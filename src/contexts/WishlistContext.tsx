import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auction } from '@/data/mockData';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: Auction[];
  addToWishlist: (auction: Auction) => Promise<void>;
  removeFromWishlist: (auctionId: string) => Promise<void>;
  isInWishlist: (auctionId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load wishlist from localStorage
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = async (auction: Auction) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!isInWishlist(auction.id)) {
        setWishlist(prev => [...prev, auction]);
        toast.success('Added to wishlist');
      } else {
        toast.info('Already in wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (auctionId: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setWishlist(prev => prev.filter(auction => auction.id !== auctionId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (auctionId: string): boolean => {
    return wishlist.some(auction => auction.id === auctionId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
