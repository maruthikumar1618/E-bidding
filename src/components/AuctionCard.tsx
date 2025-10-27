import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Auction } from '@/data/mockData';
import { formatINR } from '@/lib/currency';

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard = ({ auction }: AuctionCardProps) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading } = useWishlist();

  const timeLeft = Math.max(0, Math.floor((new Date(auction.end_time || Date.now()).getTime() - Date.now()) / 1000));
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const days = Math.floor(timeLeft / (3600 * 24));

  const formatTimeLeft = () => {
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Ended';
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (isInWishlist(auction.id)) {
      await removeFromWishlist(auction.id);
    } else {
      await addToWishlist(auction);
    }
  };

  const getStatusBadge = () => {
    switch (auction.status) {
      case 'active':
        return <Badge className="bg-semantic-success text-white">Live</Badge>;
      case 'ended':
        return <Badge className="bg-accent-dark text-white">Ended</Badge>;
      case 'cancelled':
        return <Badge className="bg-semantic-error text-white">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getPriceDisplay = () => {
    const currentPrice = auction.current_price;
    const startingPrice = auction.starting_price;
    const isAboveStarting = currentPrice > startingPrice;
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-small text-accent-dark">Current Bid</span>
          <span className="text-small text-accent-dark">{auction.total_bids} bids</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-h3 font-semibold text-primary">{formatINR(currentPrice)}</span>
          {isAboveStarting && (
            <span className="text-small text-accent-dark line-through">
              {formatINR(startingPrice)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover group cursor-pointer">
        <div className="relative overflow-hidden aspect-square bg-accent-light">
          <img
            src={auction.image_urls?.[0] || '/placeholder.svg'}
            alt={auction.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-white">
              {auction.category.name}
            </Badge>
          </div>

          {/* Watchlist Button */}
          <div className="absolute top-3 right-12">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white/80 hover:bg-white rounded-full"
              onClick={handleWatchlistToggle}
              disabled={isLoading}
            >
              <Heart 
                className={`h-4 w-4 ${isInWishlist(auction.id) ? 'fill-semantic-error text-semantic-error' : 'text-accent-dark'}`} 
              />
            </Button>
          </div>

          {/* Views Counter */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-small text-white bg-black/50 px-2 py-1 rounded">
            <Eye className="h-3 w-3" />
            {auction.views}
          </div>
        </div>
        
        <CardContent className="p-md space-y-3">
          <div className="space-y-2">
            <h3 className="text-h3 font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {auction.title}
            </h3>
            <p className="text-body text-accent-dark line-clamp-2">
              {auction.description}
            </p>
          </div>

          {/* Price Display */}
          {getPriceDisplay()}

          {/* Seller Info */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-6 h-6 rounded-full bg-accent-medium flex items-center justify-center">
              <span className="text-caption font-medium text-accent-dark">
                {auction.seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small font-medium truncate">{auction.seller.name}</p>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(auction.seller?.rating || 0) 
                          ? 'text-semantic-discount' 
                          : 'text-accent-medium'
                      }`}
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-caption text-accent-dark">
                  {(auction.seller?.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Time Left */}
          <div className="flex items-center gap-2 text-small text-accent-dark pt-1">
            <Clock className="h-4 w-4" />
            <span>
              {auction.status === 'active' ? formatTimeLeft() : 'Ended'}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-md pt-0">
          <Link to={`/auction/${auction.id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-accent-dark text-white font-medium">
              {auction.status === 'active' ? 'Place Bid' : 'View Details'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AuctionCard;