import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Gavel, Trophy, Clock, Heart, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/currency';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockAuctions } from '@/data/mockData';

const BidderDashboard = () => {
  const { user } = useAuth();
  const [myBids, setMyBids] = useState<any[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);

  useEffect(() => {
    // Simulate loading user's bids
    const loadMyBids = async () => {
      setIsLoadingBids(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock user's bids data
      const mockBids = [
        {
          id: '1',
          auction_id: '1',
          auction_title: 'Vintage Rolex Submariner',
          auction_image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
          bid_amount: 1037500,
          current_price: 1037500,
          bid_status: 'winning',
          placed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          end_time: new Date(Date.now() + 3600000 * 10).toISOString(),
          seller_name: 'TimepiecePro',
          category: 'Watches'
        },
        {
          id: '2',
          auction_id: '2',
          auction_title: 'Gaming PC - RTX 4090',
          auction_image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
          bid_amount: 265600,
          current_price: 280000,
          bid_status: 'outbid',
          placed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
          seller_name: 'TechMaster',
          category: 'Electronics'
        },
        {
          id: '3',
          auction_id: '4',
          auction_title: 'Abstract Oil Painting',
          auction_image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
          bid_amount: 37350,
          current_price: 37350,
          bid_status: 'winning',
          placed_at: new Date(Date.now() - 3600000 * 1).toISOString(),
          end_time: new Date(Date.now() + 3600000 * 4).toISOString(),
          seller_name: 'ArtisanGallery',
          category: 'Art'
        },
        {
          id: '4',
          auction_id: '6',
          auction_title: 'Vintage Gibson Guitar',
          auction_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
          bid_amount: 456500,
          current_price: 470000,
          bid_status: 'outbid',
          placed_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          end_time: new Date(Date.now() + 3600000 * 12).toISOString(),
          seller_name: 'MelodyMart',
          category: 'Music'
        }
      ];
      
      setMyBids(mockBids);
      setIsLoadingBids(false);
    };

    loadMyBids();
  }, []);

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

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'winning':
        return <Badge className="bg-semantic-success text-white">Winning</Badge>;
      case 'outbid':
        return <Badge className="bg-semantic-warning text-white">Outbid</Badge>;
      case 'won':
        return <Badge className="bg-semantic-success text-white">Won</Badge>;
      case 'lost':
        return <Badge className="bg-semantic-error text-white">Lost</Badge>;
      default:
        return <Badge className="bg-accent-medium text-white">Active</Badge>;
    }
  };

  const stats = [
    {
      title: 'Active Bids',
      value: '12',
      icon: Gavel,
      trend: '+3 today'
    },
    {
      title: 'Won Auctions',
      value: '28',
      icon: Trophy,
      trend: '5 pending payment'
    },
    {
      title: 'Total Spent',
      value: formatINR(701350), // ₹7,01,350
      icon: TrendingUp,
      trend: `This month: ${formatINR(102920)}` // ₹1,02,920
    },
    {
      title: 'Watching',
      value: '24',
      icon: Heart,
      trend: '8 ending soon'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bidder Dashboard</h1>
              <p className="text-muted-foreground">Track your bids and discover new auctions</p>
            </div>
            <Link to="/auctions">
              <Button className="gradient-primary shadow-glow">
                Browse Auctions
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-semantic-error" />
                  Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View your saved auctions</p>
                <Button asChild className="w-full">
                  <Link to="/wishlist">View Wishlist</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-semantic-success" />
                  Won Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Manage your winning bids</p>
                <Button asChild className="w-full">
                  <Link to="/won-auctions">View Won Items</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  Browse Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Discover new items to bid on</p>
                <Button asChild className="w-full gradient-primary">
                  <Link to="/auctions">Browse All</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="transition-all hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="rounded-lg bg-primary/10 p-2">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* My Bids Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  My Bids
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auctions">
                    View All Auctions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBids ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : myBids.length === 0 ? (
                <div className="text-center py-8">
                  <Gavel className="h-12 w-12 text-accent-medium mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bids yet</h3>
                  <p className="text-muted-foreground mb-4">Start bidding on auctions to see them here</p>
                  <Button asChild>
                    <Link to="/auctions">Browse Auctions</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBids.map((bid, index) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4 p-4 border border-accent-medium rounded-lg hover:shadow-md transition-shadow">
                        {/* Auction Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent-light flex-shrink-0">
                          <img
                            src={bid.auction_image}
                            alt={bid.auction_title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Auction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg truncate">{bid.auction_title}</h4>
                              <p className="text-sm text-muted-foreground">by {bid.seller_name}</p>
                            </div>
                            {getBidStatusBadge(bid.bid_status)}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Your Bid:</span>
                                <span className="font-semibold text-primary ml-1">
                                  {formatINR(bid.bid_amount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Current:</span>
                                <span className="font-semibold ml-1">
                                  {formatINR(bid.current_price)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatTimeLeft(bid.end_time)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{bid.category}</Badge>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/auction/${bid.auction_id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/auctions">
                <Button variant="outline" className="w-full justify-start">
                  <Gavel className="h-4 w-4 mr-2" />
                  Browse Auctions
                </Button>
              </Link>
              <Link to="/bidder/my-bids">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  My Bids
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="h-4 w-4 mr-2" />
                Won Auctions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Watchlist
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BidderDashboard;
