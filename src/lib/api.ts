// API configuration for frontend integration
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('nexus_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('nexus_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('nexus_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  async register(data: { email: string; password: string; name: string; role: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(data: { name?: string; avatar_url?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Auctions
  async getAuctions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request(`/auctions${queryString ? `?${queryString}` : ''}`);
  }

  async getAuction(id: string) {
    return this.request(`/auctions/${id}`);
  }

  async createAuction(data: FormData) {
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    // Remove Content-Type for FormData
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}/auctions`, {
      method: 'POST',
      headers,
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async updateAuction(id: string, data: FormData) {
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}/auctions/${id}`, {
      method: 'PUT',
      headers,
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async deleteAuction(id: string) {
    return this.request(`/auctions/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserAuctions(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/auctions/user/my-auctions${params}`);
  }

  // Seller auction management
  async startAuction(id: string) {
    return this.request(`/auctions/${id}/start`, {
      method: 'POST',
    });
  }

  async endAuction(id: string) {
    return this.request(`/auctions/${id}/end`, {
      method: 'POST',
    });
  }

  async cancelAuction(id: string) {
    return this.request(`/auctions/${id}/cancel`, {
      method: 'POST',
    });
  }

  async getAuctionAnalytics(id: string) {
    return this.request(`/auctions/${id}/analytics`);
  }

  // Bidding
  async placeBid(data: { auction_id: string; amount: number }) {
    return this.request('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAuctionBids(auctionId: string, page = 1, limit = 20) {
    return this.request(`/bids/auction/${auctionId}?page=${page}&limit=${limit}`);
  }

  async getUserBids(page = 1, limit = 20) {
    return this.request(`/bids/user/my-bids?page=${page}&limit=${limit}`);
  }

  async getWinningBids() {
    return this.request('/bids/user/winning');
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  // Watchlist
  async getWatchlist(page = 1, limit = 20) {
    return this.request(`/watchlist?page=${page}&limit=${limit}`);
  }

  async addToWatchlist(auctionId: string) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ auction_id: auctionId }),
    });
  }

  async removeFromWatchlist(auctionId: string) {
    return this.request(`/watchlist/${auctionId}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unread_only: 'true' }),
    });
    
    return this.request(`/notifications?${params}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Messages
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversation(auctionId: string, otherUserId: string) {
    return this.request(`/messages/${auctionId}/${otherUserId}`);
  }

  async sendMessage(data: { auction_id: string; receiver_id: string; content: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reviews
  async getAuctionReviews(auctionId: string, page = 1, limit = 10) {
    return this.request(`/reviews/auction/${auctionId}?page=${page}&limit=${limit}`);
  }

  async createReview(data: { auction_id: string; receiver_id: string; rating: number; comment?: string }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getUserPayments(type = 'all') {
    return this.request(`/payments?type=${type}`);
  }

  async createPayment(data: { auction_id: string; amount: number; payment_method: string }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUserProfile(id: string) {
    return this.request(`/users/${id}`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

class SocketClient {
  private socket: any = null;
  private token: string | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.token = localStorage.getItem('nexus_token');
    
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: this.token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId: string) {
    if (this.socket) {
      this.socket.emit('join_auction', auctionId);
    }
  }

  leaveAuction(auctionId: string) {
    if (this.socket) {
      this.socket.emit('leave_auction', auctionId);
    }
  }

  placeBid(auctionId: string, amount: number) {
    if (this.socket) {
      this.socket.emit('place_bid', { auctionId, amount });
    }
  }

  onNewBid(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_bid', callback);
    }
  }

  onAuctionEnded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('auction_ended', callback);
    }
  }

  onAuctionEndingSoon(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('auction_ending_soon', callback);
    }
  }

  onBidSuccess(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('bid_success', callback);
    }
  }

  onBidError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('bid_error', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketClient = new SocketClient();
