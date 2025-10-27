import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add to watchlist
export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    const { auction_id } = req.body;
    const userId = (req as any).userId;

    // Check if already in watchlist
    const existingItem = await prisma.watchlist.findUnique({
      where: {
        auction_id_user_id: {
          auction_id,
          user_id: userId
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Auction already in watchlist' });
    }

    const watchlistItem = await prisma.watchlist.create({
      data: {
        auction_id,
        user_id: userId
      },
      include: {
        auction: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                rating: true,
                avatar_url: true
              }
            },
            category: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Added to watchlist',
      watchlistItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req: Request, res: Response) => {
  try {
    const { auction_id } = req.params;
    const userId = (req as any).userId;

    await prisma.watchlist.deleteMany({
      where: {
        auction_id,
        user_id: userId
      }
    });

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's watchlist
export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [watchlistItems, total] = await Promise.all([
      prisma.watchlist.findMany({
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
                  rating: true,
                  avatar_url: true
                }
              },
              category: true,
              bids: {
                orderBy: { created_at: 'desc' },
                take: 1,
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar_url: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.watchlist.count({
        where: { user_id: userId }
      })
    ]);

    res.json({
      watchlist: watchlistItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
