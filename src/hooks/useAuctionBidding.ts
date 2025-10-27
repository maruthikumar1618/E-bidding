import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { socketClient } from '@/lib/api';

interface Auction {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  reserve_price?: number;
  status: 'ACTIVE' | 'ENDED' | 'DRAFT' | 'CANCELLED';
  start_time?: string;
  end_time: string;
  image_urls: string[];
  condition?: string;
  location?: string;
  shipping_cost: number;
  auto_extend: boolean;
  min_bid_increment: number;
  total_bids: number;
  views: number;
  created_at: string;
  updated_at: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    avatar_url?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  bids: Array<{
    id: string;
    amount: number;
    is_winning: boolean;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
}

interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  is_winning: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface UseAuctionBiddingProps {
  auctionId: string;
  userId: string;
}

export const useAuctionBidding = ({ auctionId, userId }: UseAuctionBiddingProps) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch auction data
  const fetchAuction = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAuction(auctionId);
      setAuction(response.auction);
      
      // Calculate time left
      const endTime = new Date(response.auction.end_time).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
    } catch (error) {
      console.error('Error fetching auction:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  // Fetch bids
  const fetchBids = useCallback(async () => {
    try {
      const response = await apiClient.getAuctionBids(auctionId, 1, 20);
      setBids(response.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  }, [auctionId]);

  // Place bid
  const placeBid = useCallback(async (amount: number) => {
    if (!auction || !userId) return;

    setIsPlacingBid(true);
    try {
      const response = await apiClient.placeBid({
        auction_id: auctionId,
        amount
      });
      
      // Update local state
      setAuction(response.auction);
      setBids(prev => [response.bid, ...prev]);
      
      return response;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    } finally {
      setIsPlacingBid(false);
    }
  }, [auction, auctionId, userId]);

  // Setup real-time updates
  useEffect(() => {
    if (!auctionId) return;

    // Connect to socket
    socketClient.connect();

    // Join auction room
    socketClient.joinAuction(auctionId);

    // Listen for new bids
    socketClient.onNewBid((data) => {
      if (data.auction.id === auctionId) {
        setAuction(data.auction);
        setBids(prev => [data.bid, ...prev]);
      }
    });

    // Listen for auction ended
    socketClient.onAuctionEnded((data) => {
      if (data.auctionId === auctionId) {
        setAuction(prev => prev ? { ...prev, status: 'ENDED' } : null);
      }
    });

    // Listen for bid success/error
    socketClient.onBidSuccess((data) => {
      console.log('Bid placed successfully:', data);
    });

    socketClient.onBidError((data) => {
      console.error('Bid error:', data);
    });

    return () => {
      socketClient.leaveAuction(auctionId);
      socketClient.removeAllListeners();
    };
  }, [auctionId]);

  // Update time left
  useEffect(() => {
    if (!auction || auction.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      const endTime = new Date(auction.end_time).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setAuction(prev => prev ? { ...prev, status: 'ENDED' } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Initial data fetch
  useEffect(() => {
    fetchAuction();
    fetchBids();
  }, [fetchAuction, fetchBids]);

  return {
    auction,
    bids,
    isLoading,
    isPlacingBid,
    timeLeft,
    placeBid,
    refetch: fetchAuction
  };
};