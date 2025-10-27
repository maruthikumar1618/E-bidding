import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { io } from '../index';

const prisma = new PrismaClient();

// Place a bid
export const placeBid = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auction_id, amount } = req.body;
    const userId = (req as any).userId;

    // Get auction details
    const auction = await prisma.auction.findUnique({
      where: { id: auction_id },
      include: {
        seller: true,
        bids: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (auction.seller_id === userId) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    if (new Date(auction.end_time) <= new Date()) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Check minimum bid amount
    const minBidAmount = auction.current_price + auction.min_bid_increment;
    if (amount < minBidAmount) {
      return res.status(400).json({ 
        message: `Minimum bid amount is ₹${minBidAmount}` 
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create new bid
      const bid = await tx.bid.create({
        data: {
          auction_id,
          user_id: userId,
          amount
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          }
        }
      });

      // Update auction current price and total bids
      const updatedAuction = await tx.auction.update({
        where: { id: auction_id },
        data: {
          current_price: amount,
          total_bids: { increment: 1 }
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          },
          category: true
        }
      });

      // Mark previous winning bid as not winning
      await tx.bid.updateMany({
        where: {
          auction_id,
          is_winning: true
        },
        data: {
          is_winning: false
        }
      });

      // Mark new bid as winning
      await tx.bid.update({
        where: { id: bid.id },
        data: { is_winning: true }
      });

      return { bid, auction: updatedAuction };
    });

    // Send real-time updates
    io.to(`auction_${auction_id}`).emit('new_bid', {
      bid: result.bid,
      auction: result.auction
    });

    // Create notification for auction owner
    await prisma.notification.create({
      data: {
        user_id: auction.seller_id,
        auction_id,
        type: 'BID_PLACED',
        title: 'New Bid Placed',
        message: `Someone placed a bid of ₹${amount} on your auction "${auction.title}"`,
        data: {
          bid_amount: amount,
          bidder_name: result.bid.user.name
        }
      }
    });

    // Notify previous highest bidder if different
    const previousHighestBid = auction.bids[0];
    if (previousHighestBid && previousHighestBid.user_id !== userId) {
      await prisma.notification.create({
        data: {
          user_id: previousHighestBid.user_id,
          auction_id,
          type: 'BID_OUTBID',
          title: 'You\'ve Been Outbid',
          message: `Your bid on "${auction.title}" has been outbid`,
          data: {
            new_bid_amount: amount,
            auction_title: auction.title
          }
        }
      });
    }

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: result.bid,
      auction: result.auction
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get auction bids
export const getAuctionBids = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { auction_id: auctionId },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          }
        }
      }),
      prisma.bid.count({
        where: { auction_id: auctionId }
      })
    ]);

    res.json({
      bids,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get auction bids error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's bids
export const getUserBids = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { user_id: userId },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          auction: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true
                }
              },
              category: true
            }
          }
        }
      }),
      prisma.bid.count({
        where: { user_id: userId }
      })
    ]);

    res.json({
      bids,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's winning bids
export const getWinningBids = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const bids = await prisma.bid.findMany({
      where: {
        user_id: userId,
        is_winning: true
      },
      include: {
        auction: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar_url: true
              }
            },
            category: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ bids });
  } catch (error) {
    console.error('Get winning bids error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation middleware
export const validatePlaceBid = [
  body('auction_id').notEmpty(),
  body('amount').isFloat({ min: 0 })
];
