# Production-ready backend setup for Nexus Bids
# College project with free resources

## 🚀 Quick Start

### 1. Database Setup (Choose one)

#### Option A: Neon (Recommended - Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update `DATABASE_URL` in your `.env` file

#### Option B: Supabase (Free PostgreSQL + Auth)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `DATABASE_URL` in your `.env` file

#### Option C: Railway (Free PostgreSQL)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection string
5. Update `DATABASE_URL` in your `.env` file

### 2. Cloudinary Setup (Free Image Hosting)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Update Cloudinary variables in your `.env` file

### 3. Installation & Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your actual values

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

### 4. Deployment Options

#### Option A: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js app
3. Add environment variables in Railway dashboard
4. Deploy automatically on git push

#### Option B: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the provided `render.yaml` configuration
4. Add environment variables in Render dashboard

#### Option C: Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the backend directory
3. Configure environment variables
4. Deploy with `vercel --prod`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── routes/         # API routes
│   ├── middleware/      # Custom middleware
│   ├── socket/         # WebSocket handlers
│   ├── utils/          # Utility functions
│   └── index.ts        # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS
FRONTEND_URL="https://your-frontend-url.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Auctions
- `GET /api/auctions` - Get all auctions (with filters)
- `GET /api/auctions/:id` - Get single auction
- `POST /api/auctions` - Create auction (auth required)
- `PUT /api/auctions/:id` - Update auction (owner only)
- `DELETE /api/auctions/:id` - Delete auction (owner only)

### Bidding
- `POST /api/bids` - Place bid (auth required)
- `GET /api/bids/auction/:auctionId` - Get auction bids
- `GET /api/bids/user/my-bids` - Get user's bids
- `GET /api/bids/user/winning` - Get winning bids

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:auction_id` - Remove from watchlist

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:auctionId/:otherUserId` - Get conversation
- `POST /api/messages` - Send message

### Reviews
- `GET /api/reviews/auction/:auctionId` - Get auction reviews
- `POST /api/reviews` - Create review (winner only)

### Payments
- `GET /api/payments` - Get user's payments
- `POST /api/payments` - Create payment

## 🔌 WebSocket Events

### Client to Server
- `join_auction` - Join auction room
- `leave_auction` - Leave auction room
- `place_bid` - Place real-time bid
- `auction_ending` - Check auction ending status

### Server to Client
- `new_bid` - New bid placed
- `auction_ended` - Auction has ended
- `auction_ending_soon` - Auction ending warning
- `bid_success` - Bid placed successfully
- `bid_error` - Bid placement error

## 🗄️ Database Schema

The database includes the following main tables:
- `users` - User accounts and profiles
- `auctions` - Auction listings
- `bids` - Bid history
- `categories` - Product categories
- `watchlist` - User saved auctions
- `messages` - User-to-user messaging
- `notifications` - Real-time notifications
- `reviews` - User ratings and reviews
- `payments` - Transaction records

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)
- File upload restrictions

## 📈 Performance Features

- Database connection pooling
- Image optimization with Cloudinary
- Compression middleware
- Efficient database queries
- Real-time updates with WebSocket
- Pagination for large datasets

## 🧪 Testing

Demo accounts are created during seeding:
- **Seller**: seller@example.com / password123
- **Bidder**: bidder@example.com / password123
- **Admin**: admin@example.com / password123

## 🚀 Production Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up Cloudinary account
- [ ] Deploy to hosting platform
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure monitoring
- [ ] Set up backups

## 💰 Cost Breakdown (Free Resources)

- **Database**: Neon/Supabase/Railway (Free tier)
- **Hosting**: Railway/Render/Vercel (Free tier)
- **Images**: Cloudinary (Free tier - 25GB)
- **Total Cost**: $0/month

Perfect for college projects! 🎓
