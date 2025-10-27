import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', icon: 'smartphone' },
    { name: 'Watches', slug: 'watches', description: 'Timepieces and luxury watches', icon: 'watch' },
    { name: 'Collectibles', slug: 'collectibles', description: 'Rare and collectible items', icon: 'star' },
    { name: 'Art', slug: 'art', description: 'Paintings, sculptures, and artwork', icon: 'palette' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', icon: 'shirt' },
    { name: 'Music', slug: 'music', description: 'Musical instruments and equipment', icon: 'music' },
    { name: 'Sports', slug: 'sports', description: 'Sports equipment and memorabilia', icon: 'trophy' },
    { name: 'Books', slug: 'books', description: 'Books and literature', icon: 'book' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden items', icon: 'home' },
    { name: 'Automotive', slug: 'automotive', description: 'Cars, motorcycles, and automotive parts', icon: 'car' },
    { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry and accessories', icon: 'gem' },
    { name: 'Antiques', slug: 'antiques', description: 'Vintage and antique items', icon: 'clock' },
    { name: 'Other', slug: 'other', description: 'Other items not listed above', icon: 'more-horizontal' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  console.log('✅ Categories created');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'John Seller',
      password: hashedPassword,
      role: 'SELLER',
      is_verified: true,
      rating: 4.8,
      total_ratings: 25
    }
  });

  const bidder = await prisma.user.upsert({
    where: { email: 'bidder@example.com' },
    update: {},
    create: {
      email: 'bidder@example.com',
      name: 'Jane Bidder',
      password: hashedPassword,
      role: 'BIDDER',
      is_verified: true,
      rating: 4.9,
      total_ratings: 18
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      is_verified: true,
      rating: 5.0,
      total_ratings: 0
    }
  });

  console.log('✅ Demo users created');

  // Get categories for auctions
  const electronicsCategory = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const watchesCategory = await prisma.category.findUnique({ where: { slug: 'watches' } });
  const collectiblesCategory = await prisma.category.findUnique({ where: { slug: 'collectibles' } });

  // Create demo auctions
  const auctions = [
    {
      title: 'Vintage Rolex Submariner',
      description: 'Rare 1960s Rolex Submariner in excellent condition with original box and papers. This timepiece has been professionally serviced and maintains its original lume.',
      starting_price: 830000,
      current_price: 1037500,
      end_time: new Date(Date.now() + 3600000 * 12), // 12 hours from now
      category_id: watchesCategory!.id,
      seller_id: seller.id,
      image_urls: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'],
      condition: 'good',
      location: 'Mumbai, India',
      shipping_cost: 500,
      min_bid_increment: 10000,
      total_bids: 28,
      views: 156
    },
    {
      title: 'Gaming PC - RTX 4090',
      description: 'Custom built gaming PC with latest RTX 4090, 64GB RAM, liquid cooling system. Perfect for 4K gaming and content creation.',
      starting_price: 207500,
      current_price: 265600,
      end_time: new Date(Date.now() + 3600000 * 8), // 8 hours from now
      category_id: electronicsCategory!.id,
      seller_id: seller.id,
      image_urls: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80'],
      condition: 'new',
      location: 'Delhi, India',
      shipping_cost: 2000,
      min_bid_increment: 5000,
      total_bids: 45,
      views: 203
    },
    {
      title: 'Rare Pokemon Card Collection',
      description: 'Complete first edition holographic collection including Charizard, Blastoise, and Venusaur. All cards are in mint condition.',
      starting_price: 581000,
      current_price: 738700,
      end_time: new Date(Date.now() + 3600000 * 24), // 24 hours from now
      category_id: collectiblesCategory!.id,
      seller_id: seller.id,
      image_urls: ['https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&q=80'],
      condition: 'like_new',
      location: 'Bangalore, India',
      shipping_cost: 300,
      min_bid_increment: 10000,
      total_bids: 67,
      views: 312
    }
  ];

  for (const auctionData of auctions) {
    await prisma.auction.create({
      data: {
        ...auctionData,
        status: 'ACTIVE',
        start_time: new Date(Date.now() - 3600000) // Started 1 hour ago
      }
    });
  }

  console.log('✅ Demo auctions created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('Seller: seller@example.com / password123');
  console.log('Bidder: bidder@example.com / password123');
  console.log('Admin: admin@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
