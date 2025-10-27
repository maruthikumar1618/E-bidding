import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User ${socket.data.user.name} connected`);

    // Join auction room
    socket.on('join_auction', async (auctionId: string) => {
      try {
        // Verify auction exists
        const auction = await prisma.auction.findUnique({
          where: { id: auctionId },
          select: { id: true, status: true }
        });

        if (!auction) {
          socket.emit('error', { message: 'Auction not found' });
          return;
        }

        socket.join(`auction_${auctionId}`);
        socket.emit('joined_auction', { auctionId });
        
        console.log(`User ${socket.data.user.name} joined auction ${auctionId}`);
      } catch (error) {
        console.error('Join auction error:', error);
        socket.emit('error', { message: 'Failed to join auction' });
      }
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId: string) => {
      socket.leave(`auction_${auctionId}`);
      socket.emit('left_auction', { auctionId });
      console.log(`User ${socket.data.user.name} left auction ${auctionId}`);
    });

    // Handle real-time bidding
    socket.on('place_bid', async (data: { auctionId: string; amount: number }) => {
      try {
        const { auctionId, amount } = data;
        const userId = socket.data.user.id;

        // Get auction details
        const auction = await prisma.auction.findUnique({
          where: { id: auctionId },
          include: {
            seller: true,
            bids: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        });

        if (!auction) {
          socket.emit('bid_error', { message: 'Auction not found' });
          return;
        }

        if (auction.status !== 'ACTIVE') {
          socket.emit('bid_error', { message: 'Auction is not active' });
          return;
        }

        if (auction.seller_id === userId) {
          socket.emit('bid_error', { message: 'You cannot bid on your own auction' });
          return;
        }

        if (new Date(auction.end_time) <= new Date()) {
          socket.emit('bid_error', { message: 'Auction has ended' });
          return;
        }

        // Check minimum bid amount
        const minBidAmount = auction.current_price + auction.min_bid_increment;
        if (amount < minBidAmount) {
          socket.emit('bid_error', { 
            message: `Minimum bid amount is ₹${minBidAmount}` 
          });
          return;
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Create new bid
          const bid = await tx.bid.create({
            data: {
              auction_id: auctionId,
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
            where: { id: auctionId },
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
              auction_id: auctionId,
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

        // Broadcast to all users in the auction room
        io.to(`auction_${auctionId}`).emit('new_bid', {
          bid: result.bid,
          auction: result.auction
        });

        // Create notification for auction owner
        await prisma.notification.create({
          data: {
            user_id: auction.seller_id,
            auction_id: auctionId,
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
              auction_id: auctionId,
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

        socket.emit('bid_success', {
          message: 'Bid placed successfully',
          bid: result.bid
        });

      } catch (error) {
        console.error('Socket bid error:', error);
        socket.emit('bid_error', { message: 'Failed to place bid' });
      }
    });

    // Handle auction ending notifications
    socket.on('auction_ending', async (auctionId: string) => {
      try {
        const auction = await prisma.auction.findUnique({
          where: { id: auctionId },
          select: { id: true, title: true, end_time: true, status: true }
        });

        if (!auction || auction.status !== 'ACTIVE') {
          return;
        }

        const timeLeft = new Date(auction.end_time).getTime() - Date.now();
        
        if (timeLeft <= 0) {
          // Auction has ended
          await prisma.auction.update({
            where: { id: auctionId },
            data: { status: 'ENDED' }
          });

          io.to(`auction_${auctionId}`).emit('auction_ended', {
            auctionId,
            message: 'Auction has ended'
          });
        } else if (timeLeft <= 300000) { // 5 minutes
          // Send warning
          io.to(`auction_${auctionId}`).emit('auction_ending_soon', {
            auctionId,
            timeLeft,
            message: 'Auction ending soon!'
          });
        }
      } catch (error) {
        console.error('Auction ending error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.name} disconnected`);
    });
  });
};
