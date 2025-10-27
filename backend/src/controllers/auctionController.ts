import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, query } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary';

const prisma = new PrismaClient();

// Create auction
export const createAuction = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Creating auction with body:', req.body);
    console.log('🔍 Files:', req.files);
    
    const userId = (req as any).userId;
    const {
      title,
      description,
      starting_price,
      reserve_price,
      end_time,
      category_id,
      condition,
      location,
      shipping_cost,
      auto_extend,
      min_bid_increment
    } = req.body;

    // Validate required fields
    if (!title || !description || !starting_price || !end_time || !category_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, starting_price, end_time, category_id' 
      });
    }

    // Upload images if provided
    let image_urls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file: any) => 
          uploadToCloudinary(file.buffer, 'auctions')
        );
        image_urls = await Promise.all(uploadPromises);
      } catch (imageError) {
        console.error('Error uploading images to Cloudinary:', imageError);
        // Continue without images if Cloudinary fails
        image_urls = [];
      }
    }

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        starting_price: parseFloat(starting_price),
        current_price: parseFloat(starting_price),
        reserve_price: reserve_price ? parseFloat(reserve_price) : null,
        end_time: new Date(end_time),
        category_id,
        seller_id: userId,
        condition,
        location,
        shipping_cost: shipping_cost ? parseFloat(shipping_cost) : 0,
        auto_extend: auto_extend === 'true',
        min_bid_increment: min_bid_increment ? parseFloat(min_bid_increment) : 10,
        image_urls
      },
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
          take: 5,
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
    });

    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });
  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all auctions with filtering and pagination
export const getAuctions = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      status = 'ACTIVE',
      search,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (min_price || max_price) {
      where.current_price = {};
      if (min_price) where.current_price.gte = parseFloat(min_price as string);
      if (max_price) where.current_price.lte = parseFloat(max_price as string);
    }

    // Get auctions
    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sort_by as string]: sort_order },
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
      }),
      prisma.auction.count({ where })
    ]);

    res.json({
      auctions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single auction
export const getAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true,
            total_ratings: true,
            avatar_url: true
          }
        },
        category: true,
        bids: {
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
        }
      }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Increment view count
    await prisma.auction.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Check if user has this auction in watchlist
    let isWatched = false;
    if (userId) {
      const watchlistItem = await prisma.watchlist.findUnique({
        where: {
          auction_id_user_id: {
            auction_id: id,
            user_id: userId
          }
        }
      });
      isWatched = !!watchlistItem;
    }

    res.json({
      auction: {
        ...auction,
        isWatched
      }
    });
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update auction
export const updateAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    const updateData = { ...req.body };
    
    // Handle image uploads
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.map((file: any) => 
        uploadToCloudinary(file.buffer, 'auctions')
      );
      const newImageUrls = await Promise.all(uploadPromises);
      updateData.image_urls = [...auction.image_urls, ...newImageUrls];
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: updateData,
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
    });

    res.json({
      message: 'Auction updated successfully',
      auction: updatedAuction
    });
  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete auction
export const deleteAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    await prisma.auction.delete({
      where: { id }
    });

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's auctions
export const getUserAuctions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status } = req.query;

    const where: any = { seller_id: userId };
    if (status) {
      where.status = status;
    }

    const auctions = await prisma.auction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
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
    });

    res.json({ auctions });
  } catch (error) {
    console.error('Get user auctions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Start auction (change from DRAFT to ACTIVE)
export const startAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    if (auction.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Auction is not in draft status' });
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        start_time: new Date()
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

    res.json({
      message: 'Auction started successfully',
      auction: updatedAuction
    });
  } catch (error) {
    console.error('Start auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// End auction manually
export const endAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    if (auction.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: {
        status: 'ENDED',
        end_time: new Date()
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
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
    });

    // Notify winning bidder
    const winningBid = await prisma.bid.findFirst({
      where: {
        auction_id: id,
        is_winning: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (winningBid) {
      await prisma.notification.create({
        data: {
          user_id: winningBid.user_id,
          auction_id: id,
          type: 'AUCTION_WON',
          title: 'Auction Won!',
          message: `Congratulations! You won the auction "${auction.title}"`,
          data: {
            auction_title: auction.title,
            winning_amount: winningBid.amount,
            seller_name: auction.seller.name
          }
        }
      });
    }

    res.json({
      message: 'Auction ended successfully',
      auction: updatedAuction
    });
  } catch (error) {
    console.error('End auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel auction
export const cancelAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    if (auction.status === 'ENDED') {
      return res.status(400).json({ message: 'Cannot cancel an ended auction' });
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: {
        status: 'CANCELLED'
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

    // Notify all bidders about cancellation
    const bidders = await prisma.bid.findMany({
      where: { auction_id: id },
      select: { user_id: true },
      distinct: ['user_id']
    });

    for (const bidder of bidders) {
      await prisma.notification.create({
        data: {
          user_id: bidder.user_id,
          auction_id: id,
          type: 'AUCTION_CANCELLED',
          title: 'Auction Cancelled',
          message: `The auction "${auction.title}" has been cancelled`,
          data: {
            auction_title: auction.title,
            seller_name: auction.seller.name
          }
        }
      });
    }

    res.json({
      message: 'Auction cancelled successfully',
      auction: updatedAuction
    });
  } catch (error) {
    console.error('Cancel auction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get auction analytics for seller
export const getAuctionAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if user owns the auction
    const auction = await prisma.auction.findFirst({
      where: { id, seller_id: userId }
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or access denied' });
    }

    const [totalBids, uniqueBidders, bidHistory, views] = await Promise.all([
      prisma.bid.count({
        where: { auction_id: id }
      }),
      prisma.bid.findMany({
        where: { auction_id: id },
        select: { user_id: true },
        distinct: ['user_id']
      }),
      prisma.bid.findMany({
        where: { auction_id: id },
        orderBy: { created_at: 'asc' },
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
      prisma.auction.findUnique({
        where: { id },
        select: { views: true }
      })
    ]);

    res.json({
      analytics: {
        totalBids,
        uniqueBidders: uniqueBidders.length,
        views: views?.views || 0,
        bidHistory
      }
    });
  } catch (error) {
    console.error('Get auction analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation middleware
export const validateCreateAuction = [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('starting_price').isFloat({ min: 0 }),
  body('end_time').isISO8601(),
  body('category_id').notEmpty(),
  body('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor']),
  body('location').optional().trim().isLength({ max: 100 }),
  body('shipping_cost').optional().isFloat({ min: 0 }),
  body('min_bid_increment').optional().isFloat({ min: 1 })
];
