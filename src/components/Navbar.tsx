import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Menu,
  X,
  Heart,
  Trophy
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationIcon from './NotificationIcon';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-accent-medium shadow-navbar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/auctions" : "/"} className="flex items-center gap-2">
            <span className="text-h2 font-bold text-primary">Nexus Bid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-dark" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auctions">
              <Button variant="ghost" className="text-accent-dark hover:text-primary">
                Browse
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'SELLER' || user?.role === 'seller') && (
                  <Link to="/seller/create-auction">
                    <Button className="bg-primary hover:bg-accent-dark text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Sell
                    </Button>
                  </Link>
                )}

                <NotificationIcon />

                <div className="relative group">
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    {/* Role Badge */}
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-md">
                      {user?.role === 'SELLER' || user?.role === 'seller' ? 'S' : 'B'}
                    </span>
                  </Button>
                  
                  {/* User Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-accent-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-accent-medium">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-primary">{user?.name}</p>
                          <p className="text-small text-accent-dark">{user?.email}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                          {user?.role === 'SELLER' || user?.role === 'seller' ? 'Seller' : 'Bidder'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        to={user?.role === 'SELLER' || user?.role === 'seller' ? '/seller/dashboard' : '/bidder/dashboard'}
                        className="flex items-center gap-2 px-3 py-2 text-small hover:bg-accent-light rounded transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2 px-3 py-2 text-small hover:bg-accent-light rounded transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                      
                      <Link
                        to="/won-auctions"
                        className="flex items-center gap-2 px-3 py-2 text-small hover:bg-accent-light rounded transition-colors"
                      >
                        <Trophy className="h-4 w-4" />
                        Won Auctions
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-small hover:bg-accent-light rounded transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-accent-dark text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-accent-medium"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-dark" />
                    <Input
                      placeholder="Search auctions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <Link
                    to="/auctions"
                    className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Auctions
                  </Link>

                  {isAuthenticated ? (
                    <>
                      {(user?.role === 'SELLER' || user?.role === 'seller') && (
                        <Link
                          to="/seller/create-auction"
                          className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Create Auction
                        </Link>
                      )}

                      <Link
                        to={(user?.role === 'SELLER' || user?.role === 'seller') ? '/seller/dashboard' : '/bidder/dashboard'}
                        className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/wishlist"
                        className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Wishlist
                      </Link>

                      <Link
                        to="/won-auctions"
                        className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Won Auctions
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-3 py-2 text-body hover:bg-accent-light rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;