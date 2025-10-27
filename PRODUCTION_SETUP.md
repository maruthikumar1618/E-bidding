# 🚀 Nexus Bids - Production Setup Guide

## Overview
This guide will help you set up a production-ready e-bidding platform using **free resources** perfect for college projects.

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (free tier)
- **Real-time**: Socket.io
- **Images**: Cloudinary (free tier)
- **Deployment**: Railway/Render (free tier)

## 📋 Prerequisites
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

## 🗄️ Database Setup (Choose One)

### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create new project
4. Copy the connection string
5. **Save this for later** - you'll need it for backend setup

### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. **Save this for later**

### Option 3: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy the connection string
5. **Save this for later**

## 🖼️ Image Hosting Setup

### Cloudinary Setup
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret
5. **Save these for later**

## 🚀 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` file with your actual values:
```env
# Database (use the connection string from your chosen provider)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT (generate a random secret)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:8080"

# Cloudinary (use your actual values)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Backend Server
```bash
npm run dev
```

Your backend should now be running at `http://localhost:3001`

## 🎨 Frontend Setup

### 1. Navigate to Root Directory
```bash
cd ..
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env.local
```

Edit `.env.local` file:
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

### 4. Start Frontend Server
```bash
npm run dev
```

Your frontend should now be running at `http://localhost:8080`

## 🧪 Testing the Setup

### Demo Accounts
The backend seeding creates these demo accounts:
- **Seller**: seller@example.com / password123
- **Bidder**: bidder@example.com / password123
- **Admin**: admin@example.com / password123

### Test Features
1. **Register/Login**: Try creating a new account or logging in
2. **Browse Auctions**: View the demo auctions
3. **Create Auction**: Create a new auction (as seller)
4. **Place Bids**: Place bids on auctions (as bidder)
5. **Real-time Bidding**: Open multiple tabs to test real-time updates
6. **Watchlist**: Add auctions to watchlist
7. **Notifications**: Check notification system

## 🚀 Deployment Options

### Option 1: Railway (Recommended)

#### Backend Deployment
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Add environment variables in Railway dashboard
5. Deploy automatically

#### Frontend Deployment
1. In Railway, create another service
2. Select the root directory (frontend)
3. Set build command: `npm run build`
4. Set start command: `npm run preview`
5. Add environment variables
6. Deploy

### Option 2: Render

#### Backend Deployment
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Use the provided `render.yaml` configuration
5. Add environment variables
6. Deploy

#### Frontend Deployment
1. Create new Static Site
2. Connect same repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy

### Option 3: Vercel (Frontend Only)

#### Frontend Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in root directory
3. Configure environment variables
4. Deploy with `vercel --prod`

## 🔧 Production Configuration

### Environment Variables for Production

#### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-url.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_API_KEY=your-cloudinary-api-key
VITE_CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend-url.com/health`
- Frontend: Check if the site loads properly

### Database Management
- Use Prisma Studio: `npm run db:studio`
- Monitor database usage in your provider's dashboard

### Logs
- Check deployment platform logs for errors
- Monitor Cloudinary usage for image storage

## 🆘 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check if all environment variables are set
- Verify database connection string
- Check if port 3001 is available

#### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

#### Database Connection Issues
- Verify connection string format
- Check if database is accessible
- Run `npm run db:push` to sync schema

#### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure proper file format (images only)

### Getting Help
1. Check the console for error messages
2. Verify all environment variables
3. Check deployment platform logs
4. Test locally first before deploying

## 🎓 College Project Tips

### Documentation
- Document your API endpoints
- Include setup instructions
- Add screenshots of your application
- Write a technical report

### Features to Highlight
- Real-time bidding with WebSocket
- JWT authentication
- Image upload and optimization
- Responsive design
- Database relationships
- Error handling

### Presentation Tips
- Show the real-time bidding in action
- Demonstrate different user roles
- Show the mobile responsiveness
- Explain the tech stack choices
- Discuss scalability considerations

## 💰 Cost Breakdown (Free Resources)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Neon/Supabase/Railway | PostgreSQL | 500MB-1GB |
| Railway/Render | Hosting | 100GB bandwidth |
| Cloudinary | Images | 25GB storage |
| **Total Monthly Cost** | | **$0** |

Perfect for college projects! 🎓

## 🎉 You're Ready!

Your production-ready e-bidding platform is now set up with:
- ✅ Real-time bidding
- ✅ User authentication
- ✅ Image uploads
- ✅ Database persistence
- ✅ Responsive design
- ✅ Free hosting
- ✅ Scalable architecture

Good luck with your college project! 🚀
