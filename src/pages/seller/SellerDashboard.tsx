import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  X, 
  Eye, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Auction {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  start_time?: string;
  end_time: string;
  image_urls: string[];
  total_bids: number;
  views: number;
  created_at: string;
  category: {
    name: string;
  };
  bids: Array<{
    amount: number;
    user: {
      name: string;
    };
  }>;
}

interface Analytics {
  totalBids: number;
  uniqueBidders: number;
  views: number;
  bidHistory: Array<{
    amount: number;
    created_at: string;
    user: {
      name: string;
    };
  }>;
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAuctions();
  }, [activeTab]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab.toUpperCase();
      const response = await apiClient.getUserAuctions(status);
      setAuctions(response.auctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAuction = async (auctionId: string) => {
    try {
      await apiClient.startAuction(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error starting auction:', error);
    }
  };

  const handleEndAuction = async (auctionId: string) => {
    try {
      await apiClient.endAuction(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error ending auction:', error);
    }
  };

  const handleCancelAuction = async (auctionId: string) => {
    try {
      await apiClient.cancelAuction(auctionId);
      await fetchAuctions();
    } catch (error) {
      console.error('Error cancelling auction:', error);
    }
  };

  const fetchAnalytics = async (auctionId: string) => {
    try {
      const response = await apiClient.getAuctionAnalytics(auctionId);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500';
      case 'ACTIVE': return 'bg-green-500';
      case 'ENDED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'ACTIVE': return 'Active';
      case 'ENDED': return 'Ended';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Auctions</h1>
          <p className="text-gray-600 mt-2">Manage your auction listings</p>
        </div>
        <Button 
          onClick={() => navigate('/seller/create-auction')}
          className="bg-black text-white hover:bg-gray-800"
        >
          Create New Auction
              </Button>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {auctions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <BarChart3 size={48} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No auctions found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {activeTab === 'all' 
                    ? "You haven't created any auctions yet."
                    : `No ${activeTab} auctions found.`
                  }
                </p>
                <Button 
                  onClick={() => navigate('/seller/create-auction')}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Create Your First Auction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
              <motion.div
                  key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={auction.image_urls[0] || '/placeholder.svg'}
                        alt={auction.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${getStatusColor(auction.status)} text-white`}
                      >
                        {getStatusText(auction.status)}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{auction.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {auction.category.name}
                        </span>
                    </div>
                  </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Price</span>
                          <span className="font-semibold text-lg">
                            {formatCurrency(auction.current_price)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users size={16} className="mr-1" />
                            {auction.total_bids} bids
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Eye size={16} className="mr-1" />
                            {auction.views} views
                          </div>
                        </div>

                        {auction.status === 'ACTIVE' && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-1" />
                            {getTimeRemaining(auction.end_time)} left
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/auction/${auction.id}`)}
                          className="flex-1"
                        >
                          View
                        </Button>
                        
                        {auction.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartAuction(auction.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play size={16} className="mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {auction.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => handleEndAuction(auction.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Square size={16} className="mr-1" />
                            End
                          </Button>
                        )}
                        
                        {(auction.status === 'DRAFT' || auction.status === 'ACTIVE') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelAuction(auction.id)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAuction(auction);
                          fetchAnalytics(auction.id);
                        }}
                        className="w-full"
                      >
                        <BarChart3 size={16} className="mr-1" />
                        View Analytics
                      </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Analytics Modal */}
      {selectedAuction && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Analytics - {selectedAuction.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAuction(null);
                    setAnalytics(null);
                  }}
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalBids}</div>
                  <div className="text-sm text-gray-600">Total Bids</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.uniqueBidders}</div>
                  <div className="text-sm text-gray-600">Unique Bidders</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.views}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Bid History</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analytics.bidHistory.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{bid.user.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(bid.created_at)}
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(bid.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
      )}
    </div>
  );
};

export default SellerDashboard;