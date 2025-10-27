import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { auction_id, receiver_id, rating, comment } = req.body;
    const giver_id = (req as any).userId;

    // Check if user can review (must have won the auction)
    const winningBid = await prisma.bid.findFirst({
      where: {
        auction_id,
        user_id: giver_id,
        is_winning: true
      }
    });

    if (!winningBid) {
      return res.status(400).json({ message: 'You can only review auctions you won' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        auction_id_giver_id: {
          auction_id,
          giver_id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this auction' });
    }

    const review = await prisma.review.create({
      data: {
        auction_id,
        giver_id,
        receiver_id,
        rating,
        comment
      },
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        auction: {
          select: {
            id: true,
            title: true,
            image_urls: true
          }
        }
      }
    });

    // Update receiver's rating
    const receiverReviews = await prisma.review.findMany({
      where: { receiver_id },
      select: { rating: true }
    });

    const averageRating = receiverReviews.reduce((sum, r) => sum + r.rating, 0) / receiverReviews.length;

    await prisma.user.update({
      where: { id: receiver_id },
      data: {
        rating: averageRating,
        total_ratings: receiverReviews.length
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: receiver_id,
        auction_id,
        type: 'REVIEW_RECEIVED',
        title: 'New Review Received',
        message: `You received a ${rating}-star review`,
        data: {
          rating,
          reviewer_name: review.giver.name,
          auction_title: review.auction.title
        }
      }
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get auction reviews
export const getAuctionReviews = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { auction_id: auctionId },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          giver: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          }
        }
      }),
      prisma.review.count({
        where: { auction_id: auctionId }
      })
    ]);

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get auction reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
