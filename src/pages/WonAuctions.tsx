import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trophy, 
  Clock, 
  CreditCard, 
  Truck, 
  MessageCircle, 
  Star,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockAuctions } from '@/data/mockData';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

interface WonAuction {
  id: string;
  title: string;
  description: string;
  winning_price: number;
  image_urls: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  category: {
    name: string;
  };
  end_time: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  shipping_status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

const WonAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<WonAuction | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    // Simulate loading won auctions
    const loadWonAuctions = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock won auctions data
      const mockWonAuctions: WonAuction[] = [
        {
          id: '9',
          title: 'MacBook Pro M3 Max',
          description: 'Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Still in original packaging with warranty.',
          winning_price: 215000,
          image_urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
          seller: {
            id: '2',
            name: 'TechMaster',
            rating: 4.9
          },
          category: {
            name: 'Electronics'
          },
          end_time: new Date(Date.now() - 3600000 * 2).toISOString(),
          payment_status: 'paid',
          shipping_status: 'shipped',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: '10',
          title: 'Vintage Camera Collection',
          description: 'Collection of 5 vintage cameras including Canon AE-1, Nikon F3, and Leica M3. All in working condition.',
          winning_price: 85000,
          image_urls: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&q=80'],
          seller: {
            id: '3',
            name: 'VintageCollector',
            rating: 4.7
          },
          category: {
            name: 'Collectibles'
          },
          end_time: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          payment_status: 'paid',
          shipping_status: 'delivered',
          created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
          id: '11',
          title: 'Designer Watch',
          description: 'Limited edition Swiss watch with automatic movement. Comes with original box and certificate.',
          winning_price: 125000,
          image_urls: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'],
          seller: {
            id: '1',
            name: 'TimepiecePro',
            rating: 4.8
          },
          category: {
            name: 'Watches'
          },
          end_time: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          payment_status: 'pending',
          shipping_status: 'pending',
          created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
        }
      ];
      
      setWonAuctions(mockWonAuctions);
      setIsLoading(false);
    };

    loadWonAuctions();
  }, []);

  const handlePayment = (auction: WonAuction) => {
    // Navigate to checkout page with auction details
    navigate('/checkout', {
      state: {
        auctionId: auction.id,
        amount: auction.winning_price,
        auctionTitle: auction.title,
        auctionImage: auction.image_urls?.[0]
      }
    });
  };

  const handleContactSeller = (sellerId: string, auctionTitle: string) => {
    toast.info(`Contacting seller about: ${auctionTitle}`);
  };

  const handleRateSeller = (auction: WonAuction) => {
    setSelectedAuction(auction);
    setRating(0);
    setRatingComment('');
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedAuction || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Rating submitted successfully! You rated ${selectedAuction.seller.name} ${rating} stars.`);
      setRatingModalOpen(false);
      setSelectedAuction(null);
      setRating(0);
      setRatingComment('');
    } catch (error) {
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-semantic-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-semantic-warning text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-semantic-error text-white"><AlertCircle className="h-3 w-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge className="bg-accent-medium text-white">Unknown</Badge>;
    }
  };

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-semantic-success text-white"><Package className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-semantic-info text-white"><Truck className="h-3 w-3 mr-1" />Shipped</Badge>;
      case 'pending':
        return <Badge className="bg-semantic-warning text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-semantic-error text-white"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-accent-medium text-white">Unknown</Badge>;
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
            <h1 className="text-h1 font-bold mb-2 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-semantic-success" />
              Won Auctions
            </h1>
            <p className="text-body text-accent-dark">
              {wonAuctions.length} {wonAuctions.length === 1 ? 'auction' : 'auctions'} won
            </p>
          </div>

          {wonAuctions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 text-accent-medium mx-auto mb-4" />
                <h3 className="text-h3 font-semibold mb-2">No won auctions yet</h3>
                <p className="text-body text-accent-dark mb-6">
                  Start bidding on auctions to win amazing items
                </p>
                <Button asChild>
                  <Link to="/auctions">Browse Auctions</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({wonAuctions.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending Payment ({wonAuctions.filter(a => a.payment_status === 'pending').length})</TabsTrigger>
                <TabsTrigger value="shipped">Shipped ({wonAuctions.filter(a => a.shipping_status === 'shipped').length})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({wonAuctions.filter(a => a.shipping_status === 'delivered').length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {wonAuctions.map((auction) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Image */}
                          <div className="lg:w-48 lg:h-48 w-full h-48 rounded-lg overflow-hidden bg-accent-light">
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
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-h3 font-semibold mb-2">{auction.title}</h3>
                              <p className="text-body text-accent-dark line-clamp-2 mb-3">
                                {auction.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-small text-accent-dark mb-1">Winning Price</div>
                                <div className="text-h3 font-bold text-primary">{formatINR(auction.winning_price)}</div>
                              </div>
                              <div>
                                <div className="text-small text-accent-dark mb-1">Seller</div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{auction.seller.name}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-semantic-discount fill-current" />
                                    <span className="text-small">{auction.seller.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {getPaymentStatusBadge(auction.payment_status)}
                              {getShippingStatusBadge(auction.shipping_status)}
                              <Badge variant="outline">{auction.category.name}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {auction.payment_status === 'pending' && (
                                <Button 
                                  onClick={() => handlePayment(auction)}
                                  className="bg-semantic-success hover:bg-semantic-success/90"
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay Now
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                onClick={() => handleContactSeller(auction.seller.id, auction.title)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact Seller
                              </Button>
                              
                              <Button variant="outline" asChild>
                                <Link to={`/auction/${auction.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-6">
                {wonAuctions.filter(a => a.payment_status === 'pending').map((auction) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-semantic-warning">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent-light">
                              {auction.image_urls && auction.image_urls.length > 0 ? (
                                <img
                                  src={auction.image_urls[0]}
                                  alt={auction.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-accent-dark text-small">No Image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{auction.title}</h4>
                              <p className="text-small text-accent-dark">Payment Required</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-small text-accent-dark">Amount</div>
                              <div className="font-semibold text-primary">{formatINR(auction.winning_price)}</div>
                            </div>
                            <Button 
                              onClick={() => handlePayment(auction)}
                              className="bg-semantic-success hover:bg-semantic-success/90"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="shipped" className="space-y-6">
                {wonAuctions.filter(a => a.shipping_status === 'shipped').map((auction) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-semantic-info">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent-light">
                              {auction.image_urls && auction.image_urls.length > 0 ? (
                                <img
                                  src={auction.image_urls[0]}
                                  alt={auction.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-accent-dark text-small">No Image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{auction.title}</h4>
                              <p className="text-small text-accent-dark">Item is on the way</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="outline">
                              <Truck className="h-4 w-4 mr-2" />
                              Track Package
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="delivered" className="space-y-6">
                {wonAuctions.filter(a => a.shipping_status === 'delivered').map((auction) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-semantic-success">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent-light">
                              {auction.image_urls && auction.image_urls.length > 0 ? (
                                <img
                                  src={auction.image_urls[0]}
                                  alt={auction.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-accent-dark text-small">No Image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{auction.title}</h4>
                              <p className="text-small text-accent-dark">Delivered successfully</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline"
                              onClick={() => handleRateSeller(auction)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Rate Seller
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {/* Rating Modal */}
      <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Seller</DialogTitle>
            <DialogDescription>
              How was your experience with {selectedAuction?.seller.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? 'text-semantic-discount fill-current'
                          : 'text-accent-medium'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-accent-dark">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (Optional)</label>
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRatingModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="flex-1 bg-primary hover:bg-accent-dark"
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WonAuctions;
