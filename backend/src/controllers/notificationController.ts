import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { page = '1', limit = '20', unread_only } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { user_id: userId };
    if (unread_only === 'true') {
      where.is_read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          auction: {
            select: {
              id: true,
              title: true,
              image_urls: true,
              status: true
            }
          }
        }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { user_id: userId, is_read: false } })
    ]);

    // Add redirection URLs based on notification type
    const notificationsWithRedirect = notifications.map(notification => {
      let redirectUrl = '';
      
      switch (notification.type) {
        case 'BID_PLACED':
        case 'BID_OUTBID':
        case 'AUCTION_WON':
        case 'AUCTION_ENDING':
          redirectUrl = `/auction/${notification.auction_id}`;
          break;
        case 'MESSAGE_RECEIVED':
          redirectUrl = `/messages/${notification.auction_id}`;
          break;
        case 'PAYMENT_RECEIVED':
          redirectUrl = `/payments`;
          break;
        case 'REVIEW_RECEIVED':
          redirectUrl = `/auction/${notification.auction_id}`;
          break;
        case 'AUCTION_CANCELLED':
          redirectUrl = `/auctions`;
          break;
        default:
          redirectUrl = '/notifications';
      }

      return {
        ...notification,
        redirectUrl
      };
    });

    res.json({
      notifications: notificationsWithRedirect,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        user_id: userId
      },
      data: {
        is_read: true
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
