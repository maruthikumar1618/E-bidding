import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseAuctions from "./pages/BrowseAuctions";
import AuctionDetail from "./pages/AuctionDetail";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import WonAuctions from "./pages/WonAuctions";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CreateAuction from "./pages/seller/CreateAuction";
import BidderDashboard from "./pages/bidder/BidderDashboard";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'seller' | 'bidder' }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check role (backend returns uppercase: SELLER/BIDDER)
  const userRole = user.role?.toLowerCase();
  const expectedRole = role?.toLowerCase();
  
  if (role && userRole !== expectedRole) {
    // Redirect to correct dashboard based on user's actual role
    const correctDashboard = userRole === 'seller' ? '/seller/dashboard' : '/bidder/dashboard';
    return <Navigate to={correctDashboard} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions" element={<BrowseAuctions />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/won-auctions" element={<WonAuctions />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Seller Routes */}
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller/create-auction" 
            element={
              <ProtectedRoute role="seller">
                <CreateAuction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller/auctions" 
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Bidder Routes */}
          <Route 
            path="/bidder/dashboard" 
            element={
              <ProtectedRoute role="bidder">
                <BidderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bidder/my-bids" 
            element={
              <ProtectedRoute role="bidder">
                <BidderDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
