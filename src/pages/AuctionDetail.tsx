import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  TrendingUp, 
  User, 
  MapPin, 
  Truck, 
  Shield, 
  Heart,
  MessageCircle,
  Star,
  ArrowLeft,
  Gavel,
  Eye,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuctionBidding } from '@/hooks/useAuctionBidding';
import { toast } from 'sonner';
import { formatINR } from '@/lib/currency';

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { auction, bids, isLoading, placeBid, isPlacingBid, timeLeft, formatTimeLeft, isUserWinning, userHighestBid } = useAuctionBidding({ 
    auctionId: id!, 
    userId: user?.id || '' 
  });
  const [bidAmount, setBidAmount] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // No need to check watchlist status as it's handled by the context
  }, [user, auction]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place a bid');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    await placeBid(amount);
    setBidAmount('');
  };

  const handleContactSeller = () => {
    if (!user) {
      toast.error('Please login to contact the seller');
      return;
    }
    
    // Navigate to contact page with seller info
    navigate('/contact', { 
      state: { 
        sellerId: auction?.seller_id,
        sellerName: auction?.seller?.name,
        auctionId: auction?.id,
        auctionTitle: auction?.title
      }
    });
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (!auction) return;

    if (isInWishlist(auction.id)) {
      await removeFromWishlist(auction.id);
    } else {
      await addToWishlist(auction);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h1 font-bold text-primary mb-4">Auction Not Found</h1>
          <Button onClick={() => navigate('/auctions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  const isAuctionActive = auction.status === 'active' && timeLeft > 0;
  const canBid = user && isAuctionActive && user.role === 'bidder';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-square bg-accent-light rounded-lg overflow-hidden">
                    <img
                      src={auction.image_urls[0] || '/placeholder.svg'}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Images */}
              {auction.image_urls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {auction.image_urls.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square bg-accent-light rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${auction.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Auction Info */}
            <div className="space-y-6">
              {/* Auction Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-primary text-white">
                        {auction.category?.name}
                      </Badge>
                      <CardTitle className="text-h2 font-bold mb-2">
                        {auction.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-small text-accent-dark">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {auction.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {auction.total_bids} bids
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleWatchlistToggle}
                      disabled={wishlistLoading}
                    >
                      <Heart 
                        className={`h-5 w-5 ${isInWishlist(auction.id) ? 'fill-semantic-error text-semantic-error' : 'text-accent-dark'}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-small text-accent-dark">Current Bid</span>
                      <span className="text-small text-accent-dark">
                        {auction.total_bids} bids
                      </span>
                    </div>
                    <div className="text-h1 font-bold text-primary">
                      {formatINR(auction.current_price)}
                    </div>
                    {auction.current_price > auction.starting_price && (
                      <div className="text-small text-accent-dark">
                        Starting: {formatINR(auction.starting_price)}
                      </div>
                    )}
                  </div>

                  {/* Time Left */}
                  <div className="flex items-center gap-2 p-3 bg-accent-light rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-small text-accent-dark">Time Left</div>
                      <div className="font-semibold text-primary">
                        {isAuctionActive ? formatTimeLeft(timeLeft) : 'Ended'}
                      </div>
                    </div>
                  </div>

                  {/* Bid Status */}
                  {isUserWinning && (
                    <div className="p-3 bg-semantic-success/10 border border-semantic-success rounded-lg">
                      <div className="flex items-center gap-2 text-semantic-success">
                        <Gavel className="h-4 w-4" />
                        <span className="font-medium">You are currently winning!</span>
                      </div>
                    </div>
                  )}

                  {/* Bidding Form */}
                  {canBid && (
                    <form onSubmit={handleBidSubmit} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="bidAmount">Your Bid</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bidAmount"
                            type="number"
                            placeholder={`Min: ${formatINR(auction.current_price + auction.min_bid_increment)}`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={auction.current_price + auction.min_bid_increment}
                            step="1"
                          />
                          <Button type="submit" disabled={isPlacingBid}>
                            {isPlacingBid ? 'Placing...' : 'Place Bid'}
                          </Button>
                        </div>
                        <p className="text-caption text-accent-dark">
                          Minimum bid increment: {formatINR(auction.min_bid_increment)}
                        </p>
                      </div>
                    </form>
                  )}

                  {/* Seller Info */}
                  <div className="space-y-4 p-4 bg-accent-light rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent-medium flex items-center justify-center">
                        <span className="text-small font-medium text-accent-dark">
                          {auction.seller?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-lg">{auction.seller?.name}</div>
                        <div className="flex items-center gap-2 text-small text-accent-dark">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(auction.seller?.rating || 0)
                                    ? 'text-semantic-discount fill-current'
                                    : 'text-accent-medium'
                                }`}
                              />
                            ))}
                          </div>
                          <span>{(auction.seller?.rating || 0).toFixed(1)}</span>
                          <span>•</span>
                          <span>Verified Seller</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-small">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent-dark" />
                        <span>Member since 2020</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-accent-dark" />
                        <span>150+ auctions</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleContactSeller}
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Seller
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Auction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent-dark" />
                    <span className="text-small">{auction.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-accent-dark" />
                    <span className="text-small">
                      Shipping: {formatINR(auction.shipping_cost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent-dark" />
                    <span className="text-small">
                      Condition: {auction.condition || 'Not specified'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section - Tabs */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Description</TabsTrigger>
                <TabsTrigger value="bids">Bid History</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body whitespace-pre-wrap">{auction.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bids" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bid History ({bids.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bids.map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 bg-accent-light rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-medium flex items-center justify-center">
                              <span className="text-caption font-medium text-accent-dark">
                                {bid.bidder?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{bid.bidder?.name}</div>
                              <div className="text-small text-accent-dark">
                                {new Date(bid.placed_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              {formatINR(bid.amount)}
                            </div>
                            {index === 0 && (
                              <Badge className="bg-semantic-success text-white text-caption">
                                Highest
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seller Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body text-accent-dark">
                      No reviews yet. Be the first to review this seller!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionDetail;
