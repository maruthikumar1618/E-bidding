@echo off
echo 🗄️ Nexus Bids Database Setup
echo ================================

echo.
echo Step 1: Create Neon Database
echo ------------------------------
echo 1. Go to: https://console.neon.tech
echo 2. Create new project: nexus-bids-production
echo 3. Copy the connection string
echo.

echo Step 2: Update .env file
echo ------------------------
echo Create backend/.env with your Neon connection string
echo.

echo Step 3: Set up database
echo -----------------------
echo Running database setup commands...

cd backend

echo Generating Prisma client...
call npm run db:generate

echo Pushing database schema...
call npm run db:push

echo Seeding database with demo data...
call npm run db:seed

echo.
echo ✅ Database setup complete!
echo.
echo Demo accounts created:
echo - Seller: seller@example.com / password123
echo - Bidder: bidder@example.com / password123
echo - Admin: admin@example.com / password123
echo.
echo Starting backend server...
call npm run dev
