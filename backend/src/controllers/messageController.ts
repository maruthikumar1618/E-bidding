import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Send message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { auction_id, receiver_id, content } = req.body;
    const sender_id = (req as any).userId;

    const message = await prisma.message.create({
      data: {
        auction_id,
        sender_id,
        receiver_id,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        receiver: {
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

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: receiver_id,
        auction_id,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You received a message about "${message.auction.title}"`,
        data: {
          sender_name: message.sender.name,
          auction_title: message.auction.title
        }
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get conversation
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { auctionId, otherUserId } = req.params;
    const userId = (req as any).userId;

    const messages = await prisma.message.findMany({
      where: {
        auction_id: auctionId,
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      },
      orderBy: { created_at: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        receiver: {
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

    // Group by auction and other user
    const conversationMap = new Map();
    
    conversations.forEach(msg => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${msg.auction_id}-${otherUserId}`;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          auction: msg.auction,
          otherUser: msg.sender_id === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      if (msg.receiver_id === userId && !msg.is_read) {
        conversationMap.get(key).unreadCount++;
      }
    });

    res.json({ conversations: Array.from(conversationMap.values()) });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
