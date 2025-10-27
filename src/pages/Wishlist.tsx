import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, TrendingUp, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFromWishlist = async (auctionId: string) => {
    setRemovingId(auctionId);
    try {
      await removeFromWishlist(auctionId);
    } finally {
      setRemovingId(null);
    }
  };

  const formatTimeLeft = (endTime: string) => {
    const timeLeft = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
    const days = Math.floor(timeLeft / (3600 * 24));
    const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Ended';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-semantic-success text-white">Live</Badge>;
      case 'ended':
        return <Badge className="bg-accent-dark text-white">Ended</Badge>;
      case 'cancelled':
        return <Badge className="bg-semantic-error text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-accent-medium text-white">Draft</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-h1 font-bold mb-2">My Wishlist</h1>
            <p className="text-body text-accent-dark">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>

          {wishlist.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-accent-medium mx-auto mb-4" />
                <h3 className="text-h3 font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-body text-accent-dark mb-6">
                  Start adding items you love to your wishlist
                </p>
                <Button asChild>
                  <Link to="/auctions">Browse Auctions</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((auction) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        {getStatusBadge(auction.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWishlist(auction.id)}
                          disabled={removingId === auction.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-semantic-error" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Image */}
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-accent-light">
                        {auction.image_urls && auction.image_urls.length > 0 ? (
                          <img
                            src={auction.image_urls[0]}
                            alt={auction.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-accent-dark">No Image</span>
                          </div>
                        )}
                        
                        {/* Time Left Overlay */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-small flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeLeft(auction.end_time)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                            {auction.title}
                          </h3>
                          <p className="text-small text-accent-dark line-clamp-2">
                            {auction.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-small text-accent-dark">Current Bid</span>
                            <span className="text-small text-accent-dark">{auction.total_bids} bids</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-h3 font-semibold text-primary">
                              {formatINR(auction.current_price)}
                            </span>
                            {auction.current_price > auction.starting_price && (
                              <span className="text-small text-accent-dark line-through">
                                {formatINR(auction.starting_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-small text-accent-dark">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {auction.views} views
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {auction.category.name}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button asChild className="flex-1">
                            <Link to={`/auction/${auction.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromWishlist(auction.id)}
                            disabled={removingId === auction.id}
                            className="px-3"
                          >
                            <Heart className="h-4 w-4 fill-semantic-error text-semantic-error" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;
