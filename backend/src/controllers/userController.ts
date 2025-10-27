import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_verified: true,
        rating: true,
        total_ratings: true,
        avatar_url: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's auction stats
    const [auctionStats, reviewStats] = await Promise.all([
      prisma.auction.aggregate({
        where: { seller_id: id },
        _count: { id: true },
        _avg: { current_price: true }
      }),
      prisma.review.aggregate({
        where: { receiver_id: id },
        _count: { id: true },
        _avg: { rating: true }
      })
    ]);

    res.json({
      user: {
        ...user,
        stats: {
          totalAuctions: auctionStats._count.id,
          averageAuctionPrice: auctionStats._avg.current_price,
          totalReviews: reviewStats._count.id,
          averageRating: reviewStats._avg.rating
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_verified: true,
          rating: true,
          total_ratings: true,
          avatar_url: true,
          created_at: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
