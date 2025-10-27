# SmartBid Nexus - E-Bidding Platform

A modern, real-time e-bidding platform built with React, TypeScript, and Supabase, following a comprehensive ecommerce design system.

## Features

### ✅ Implemented Features

- **Real-time Bidding System**: Live auction updates with WebSocket connections
- **User Authentication**: Role-based authentication (Seller/Bidder) with Supabase Auth
- **Auction Management**: Create, browse, and manage auctions with advanced filtering
- **Bid Management**: Place bids, auto-bidding, and bid history tracking
- **Watchlist**: Save auctions for later viewing
- **Notifications**: Real-time notifications for bids, wins, and messages
- **Responsive Design**: Mobile-first design following ecommerce design system
- **Image Upload**: Multiple image support for auction listings
- **Search & Filtering**: Advanced search with category, price, and status filters
- **User Profiles**: Comprehensive user management with ratings and reviews

### 🎨 Design System

The application follows a comprehensive ecommerce design system with:

- **Color Palette**: Primary black (#000000), secondary white (#FFFFFF), accent grays
- **Typography**: Inter font family with consistent scale (hero, h1-h3, body, small, caption)
- **Spacing**: 8px base unit system with consistent spacing values
- **Components**: Card-based layouts, consistent buttons, and form elements
- **Responsive**: Mobile-first approach with breakpoints for tablet, desktop, and wide screens

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Context + Custom hooks
- **Real-time**: Supabase Realtime subscriptions
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexus-bids-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Get your project URL and anon key from Supabase dashboard

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Database Schema

The application uses the following main tables:

- **users**: User profiles with role-based access
- **auctions**: Auction listings with metadata
- **bids**: Bid history and real-time bidding
- **categories**: Product categories
- **watchlist**: User saved auctions
- **messages**: User-to-user messaging
- **notifications**: Real-time notifications
- **reviews**: User ratings and reviews
- **payments**: Transaction records

## Key Features Implementation

### Real-time Bidding
- WebSocket connections for live auction updates
- Automatic bid validation and conflict resolution
- Real-time notification system

### Authentication
- Supabase Auth integration
- Role-based access control (Seller/Bidder)
- Protected routes and API endpoints

### Auction Management
- Comprehensive auction creation with image upload
- Advanced search and filtering
- Category-based organization
- Time-based auction ending

### Design System
- Consistent color palette and typography
- Responsive grid system
- Component-based architecture
- Accessibility considerations

## API Structure

The application uses a service-based API structure:

- `userApi`: User profile management
- `auctionApi`: Auction CRUD operations
- `bidApi`: Bidding functionality
- `categoryApi`: Category management
- `watchlistApi`: Watchlist operations
- `messageApi`: Messaging system
- `notificationApi`: Notification management
- `reviewApi`: Review and rating system
- `realtimeApi`: Real-time subscriptions

## Custom Hooks

- `useAuctionBidding`: Real-time auction bidding logic
- `useNotifications`: Notification management
- `useAuth`: Authentication state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the design system
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.