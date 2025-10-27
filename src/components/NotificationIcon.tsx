import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ArrowRight,
  DollarSign,
  MessageSquare,
  Trophy,
  Clock,
  AlertTriangle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  redirectUrl: string;
  auction?: {
    id: string;
    title: string;
    image_urls: string[];
    status: string;
  };
}

const NotificationIcon = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNotifications(1, 10);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to the appropriate page
    navigate(notification.redirectUrl);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
        return <DollarSign size={16} className="text-green-600" />;
      case 'BID_OUTBID':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'AUCTION_WON':
        return <Trophy size={16} className="text-yellow-600" />;
      case 'AUCTION_ENDING':
        return <Clock size={16} className="text-red-600" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare size={16} className="text-blue-600" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign size={16} className="text-green-600" />;
      case 'REVIEW_RECEIVED':
        return <Star size={16} className="text-purple-600" />;
      case 'AUCTION_CANCELLED':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
        return 'border-l-green-500';
      case 'BID_OUTBID':
        return 'border-l-orange-500';
      case 'AUCTION_WON':
        return 'border-l-yellow-500';
      case 'AUCTION_ENDING':
        return 'border-l-red-500';
      case 'MESSAGE_RECEIVED':
        return 'border-l-blue-500';
      case 'PAYMENT_RECEIVED':
        return 'border-l-green-500';
      case 'REVIEW_RECEIVED':
        return 'border-l-purple-500';
      case 'AUCTION_CANCELLED':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const notificationTime = new Date(dateString).getTime();
    const diff = now - notificationTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
          >
            <Card className="shadow-lg border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        <CheckCheck size={14} className="mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/notifications')}
                      className="text-xs"
                    >
                      View all
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                            !notification.is_read ? 'bg-blue-50' : 'bg-white'
                          } hover:bg-gray-50 cursor-pointer transition-colors`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.created_at)}
                                  </span>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>

                              {notification.auction && (
                                <div className="flex items-center gap-2 mt-2">
                                  <img
                                    src={notification.auction.image_urls[0] || '/placeholder.svg'}
                                    alt={notification.auction.title}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                  <span className="text-xs text-gray-500 truncate">
                                    {notification.auction.title}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {notification.type.replace('_', ' ')}
                                </Badge>
                                <ArrowRight size={14} className="text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationIcon;