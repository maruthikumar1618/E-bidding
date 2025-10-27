import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

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

interface UseNotificationsProps {
  userId: string;
  enabled?: boolean;
}

export const useNotifications = ({ userId, enabled = true }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getNotifications(1, 20);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, enabled]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};