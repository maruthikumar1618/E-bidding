import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { auction_id, amount, payment_method } = req.body;
    const buyer_id = (req as any).userId;

    // Get auction details
    const auction = await prisma.auction.findUnique({
      where: { id: auction_id },
      include: { seller: true }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'ENDED') {
      return res.status(400).json({ message: 'Auction has not ended yet' });
    }

    // Check if user is the winning bidder
    const winningBid = await prisma.bid.findFirst({
      where: {
        auction_id,
        user_id: buyer_id,
        is_winning: true
      }
    });

    if (!winningBid) {
      return res.status(400).json({ message: 'You are not the winning bidder' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        auction_id,
        buyer_id,
        seller_id: auction.seller_id,
        amount,
        payment_method,
        status: 'PENDING'
      },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            image_urls: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        user_id: auction.seller_id,
        auction_id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment of ₹${amount} received for auction "${auction.title}"`,
        data: {
          amount,
          buyer_name: payment.buyer.name,
          auction_title: auction.title
        }
      }
    });

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's payments
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type = 'all' } = req.query;

    let where: any = {};
    
    if (type === 'sent') {
      where.buyer_id = userId;
    } else if (type === 'received') {
      where.seller_id = userId;
    } else {
      where.OR = [
        { buyer_id: userId },
        { seller_id: userId }
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            image_urls: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
