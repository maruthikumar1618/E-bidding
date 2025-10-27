# 🗄️ Complete Database Setup Guide for Nexus Bids

## Step 1: Create Neon Database

1. **Go to Neon Console**: https://console.neon.tech
2. **Create New Project**:
   - Project Name: `nexus-bids-production`
   - Region: Asia Pacific (Singapore) or closest to you
   - Database Name: `nexus_bids`
3. **Copy Connection String**: It will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/nexus_bids?sslmode=require
   ```

## Step 2: Update Backend Environment

Create a `.env` file in your `backend` folder with this content:

```env
# Database - Replace with your Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/nexus_bids?sslmode=require"

# JWT - Generate a secure secret
JWT_SECRET="nexus-bids-super-secret-jwt-key-2024-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:8080"

# Cloudinary - Replace with your actual values
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 3: Set Up Database Schema

Run these commands in your backend directory:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push database schema to Neon
npm run db:push

# 3. Seed database with demo data
npm run db:seed

# 4. Start backend server
npm run dev
```

## Step 4: Update Frontend Environment

Create a `.env.local` file in your root directory:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret

# Development Settings
VITE_NODE_ENV=development
```

## Step 5: Start Frontend

```bash
npm run dev
```

## Step 6: Test Your Application

### Demo Accounts (Created by Seeding):
- **Seller**: seller@example.com / password123
- **Bidder**: bidder@example.com / password123
- **Admin**: admin@example.com / password123

### Test Features:
1. **Login** with demo accounts
2. **Create Auction** as seller
3. **Place Bids** as bidder
4. **Real-time Updates** - Open multiple tabs
5. **Notifications** - Click to navigate
6. **Auction Management** - Start/end/cancel auctions

## Database Schema Created:

Your Neon database will have these tables:
- `users` - User accounts and profiles
- `auctions` - Auction listings
- `bids` - Bid history
- `categories` - Product categories
- `watchlist` - User saved auctions
- `messages` - User-to-user messaging
- `notifications` - Real-time notifications
- `reviews` - User ratings and reviews
- `payments` - Transaction records

## Troubleshooting:

### If Prisma Client Generation Fails:
```bash
# Stop all Node processes
taskkill /f /im node.exe

# Try again
npm run db:generate
```

### If Database Connection Fails:
1. Check your Neon connection string
2. Ensure SSL mode is set to `require`
3. Verify your Neon project is active

### If Frontend Can't Connect:
1. Check if backend is running on port 3001
2. Verify CORS settings in backend
3. Check browser console for errors

## Production Deployment:

Once everything works locally, you can deploy to:
- **Railway**: Connect GitHub repo
- **Render**: Use provided render.yaml
- **Vercel**: For frontend only

## Cost: $0/month
- Neon: Free tier (500MB)
- Railway/Render: Free tier
- Cloudinary: Free tier (25GB)

Perfect for college projects! 🎓
