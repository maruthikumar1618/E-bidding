// Mock data for frontend-only application

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar_url?: string;
  rating: number;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  total_bids: number;
  image_urls: string[];
  end_time: string;
  status: 'active' | 'ended' | 'draft';
  views: number;
  category: Category;
  seller: Seller;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', icon: 'smartphone' },
  { id: '2', name: 'Watches', slug: 'watches', description: 'Timepieces and luxury watches', icon: 'watch' },
  { id: '3', name: 'Collectibles', slug: 'collectibles', description: 'Rare and collectible items', icon: 'star' },
  { id: '4', name: 'Art', slug: 'art', description: 'Paintings, sculptures, and artwork', icon: 'palette' },
  { id: '5', name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', icon: 'shirt' },
  { id: '6', name: 'Music', slug: 'music', description: 'Musical instruments and equipment', icon: 'music' },
  { id: '7', name: 'Sports', slug: 'sports', description: 'Sports equipment and memorabilia', icon: 'trophy' },
  { id: '8', name: 'Books', slug: 'books', description: 'Books and literature', icon: 'book' },
  { id: '9', name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden items', icon: 'home' },
  { id: '10', name: 'Automotive', slug: 'automotive', description: 'Cars, motorcycles, and automotive parts', icon: 'car' },
  { id: '11', name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry and accessories', icon: 'gem' },
  { id: '12', name: 'Antiques', slug: 'antiques', description: 'Vintage and antique items', icon: 'clock' },
  { id: '13', name: 'Other', slug: 'other', description: 'Other items not listed above', icon: 'more-horizontal' }
];

export const mockSellers: Seller[] = [
  { id: '1', name: 'TimepiecePro', rating: 4.8 },
  { id: '2', name: 'TechMaster', rating: 4.9 },
  { id: '3', name: 'CardCollector99', rating: 4.7 },
  { id: '4', name: 'ArtGallery', rating: 4.9 },
  { id: '5', name: 'FashionForward', rating: 4.6 },
  { id: '6', name: 'MusicLover', rating: 4.8 },
  { id: '7', name: 'SportsFan', rating: 4.7 },
  { id: '8', name: 'BookWorm', rating: 4.9 },
  { id: '9', name: 'HomeDecor', rating: 4.5 },
  { id: '10', name: 'CarEnthusiast', rating: 4.8 }
];

export const mockAuctions: Auction[] = [
  {
    id: '1',
    title: 'Vintage Rolex Submariner',
    description: 'Rare 1960s Rolex Submariner in excellent condition with original box and papers. This timepiece has been professionally serviced and maintains its original lume.',
    current_price: 1037500, // ₹10,37,500
    starting_price: 830000, // ₹8,30,000
    total_bids: 28,
    image_urls: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 12).toISOString(),
    status: 'active',
    views: 156,
    category: mockCategories[1], // Watches
    seller: mockSellers[0]
  },
  {
    id: '2',
    title: 'Gaming PC - RTX 4090',
    description: 'Custom built gaming PC with latest RTX 4090, 64GB RAM, liquid cooling system. Perfect for 4K gaming and content creation.',
    current_price: 265600, // ₹2,65,600
    starting_price: 207500, // ₹2,07,500
    total_bids: 45,
    image_urls: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 8).toISOString(),
    status: 'active',
    views: 203,
    category: mockCategories[0], // Electronics
    seller: mockSellers[1]
  },
  {
    id: '3',
    title: 'Rare Pokemon Card Collection',
    description: 'Complete first edition holographic collection including Charizard, Blastoise, and Venusaur. All cards are in mint condition.',
    current_price: 738700, // ₹7,38,700
    starting_price: 581000, // ₹5,81,000
    total_bids: 67,
    image_urls: ['https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 24).toISOString(),
    status: 'active',
    views: 312,
    category: mockCategories[2], // Collectibles
    seller: mockSellers[2]
  },
  {
    id: '4',
    title: 'Abstract Oil Painting',
    description: 'Beautiful abstract oil painting by contemporary artist. Measures 24x36 inches, professionally framed. Perfect for modern home decor.',
    current_price: 37350, // ₹37,350
    starting_price: 24900, // ₹24,900
    total_bids: 12,
    image_urls: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'active',
    views: 89,
    category: mockCategories[3], // Art
    seller: mockSellers[3]
  },
  {
    id: '5',
    title: 'Designer Handbag Collection',
    description: 'Collection of 5 designer handbags including Chanel, Louis Vuitton, and Gucci. All authentic with original packaging.',
    current_price: 232400, // ₹2,32,400
    starting_price: 166000, // ₹1,66,000
    total_bids: 23,
    image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 18).toISOString(),
    status: 'active',
    views: 145,
    category: mockCategories[4], // Fashion
    seller: mockSellers[4]
  },
  {
    id: '6',
    title: 'Vintage Gibson Guitar',
    description: '1960s Gibson Les Paul Standard in cherry sunburst. Recently restored with new pickups and electronics. Comes with original case.',
    current_price: 456500, // ₹4,56,500
    starting_price: 332000, // ₹3,32,000
    total_bids: 34,
    image_urls: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 15).toISOString(),
    status: 'active',
    views: 178,
    category: mockCategories[5], // Music
    seller: mockSellers[5]
  },
  {
    id: '7',
    title: 'Signed Basketball Jersey',
    description: 'Game-worn jersey signed by Michael Jordan from his final season with the Chicago Bulls. Comes with certificate of authenticity.',
    current_price: 996000, // ₹9,96,000
    starting_price: 664000, // ₹6,64,000
    total_bids: 89,
    image_urls: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 20).toISOString(),
    status: 'active',
    views: 267,
    category: mockCategories[6], // Sports
    seller: mockSellers[6]
  },
  {
    id: '8',
    title: 'First Edition Book Collection',
    description: 'Collection of 20 first edition books including works by Hemingway, Fitzgerald, and Steinbeck. All in excellent condition.',
    current_price: 149400, // ₹1,49,400
    starting_price: 99600, // ₹99,600
    total_bids: 15,
    image_urls: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'],
    end_time: new Date(Date.now() + 3600000 * 10).toISOString(),
    status: 'active',
    views: 98,
    category: mockCategories[7], // Books
    seller: mockSellers[7]
  },
  // Add a won auction for testing
  {
    id: '9',
    title: 'MacBook Pro M3 Max',
    description: 'Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Still in original packaging with warranty.',
    current_price: 215000, // ₹2,15,000
    starting_price: 180000, // ₹1,80,000
    total_bids: 8,
    image_urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
    end_time: new Date(Date.now() - 3600000 * 2).toISOString(), // Ended 2 hours ago
    status: 'ended',
    views: 89,
    category: mockCategories[0], // Electronics
    seller: mockSellers[1]
  }
];

// Helper functions for mock data
export const getAuctionsByCategory = (categorySlug: string): Auction[] => {
  return mockAuctions.filter(auction => auction.category.slug === categorySlug);
};

export const getAuctionsBySeller = (sellerId: string): Auction[] => {
  return mockAuctions.filter(auction => auction.seller.id === sellerId);
};

export const getActiveAuctions = (): Auction[] => {
  return mockAuctions.filter(auction => auction.status === 'active');
};

export const searchAuctions = (query: string): Auction[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockAuctions.filter(auction => 
    auction.title.toLowerCase().includes(lowercaseQuery) ||
    auction.description.toLowerCase().includes(lowercaseQuery) ||
    auction.category.name.toLowerCase().includes(lowercaseQuery)
  );
};
