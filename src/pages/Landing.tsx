import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuctionCard from '@/components/AuctionCard';
import { TrendingUp, Shield, Zap, Users, Star } from 'lucide-react';
import { mockAuctions } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Landing = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users to their respective dashboards or auctions page
  useEffect(() => {
    if (!isLoading && user) {
      // Don't redirect - let them see the landing page even when logged in
      // They can still navigate to their dashboard
    }
  }, [user, isLoading, navigate]);

  // Get trending auctions from mock data (first 3)
  const trendingAuctions = mockAuctions.slice(0, 3);

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Bidding',
      description: 'Place bids instantly and watch auctions unfold in real-time'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Your payments and data are protected with bank-level security'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience seamless performance with our optimized platform'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Join thousands of verified buyers and sellers worldwide'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Collector',
      content: 'SmartBid Nexus has transformed how I find rare collectibles. The real-time bidding is incredibly exciting!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Seller',
      content: 'As a seller, I love how easy it is to list items and reach thousands of potential buyers.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Enthusiast',
      content: 'The platform is intuitive and secure. I\'ve won amazing deals on electronics and art!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 gradient-hero opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Smarter Auctions.
              </span>
              <br />
              <span className="text-white">Better Deals.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
              Join the intelligent online auction platform where thousands of buyers and sellers
              connect in real-time to discover incredible deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  {user.role === 'seller' && (
                    <Link to="/seller/create-auction">
                      <Button size="lg" className="gradient-primary shadow-glow w-full sm:w-auto text-base">
                        Create Auction
                      </Button>
                    </Link>
                  )}
                  <Link to={user.role === 'seller' ? '/seller/dashboard' : '/bidder/dashboard'}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="gradient-primary shadow-glow w-full sm:w-auto text-base">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/auctions">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base bg-white/10 border-white/20 text-white hover:bg-white/20">
                      View Auctions
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose SmartBid Nexus?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of online auctions with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Auctions */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trending Auctions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the hottest items up for auction right now
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/auctions">
              <Button size="lg" variant="outline">
                View All Auctions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">{testimonial.content}</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Start Bidding?</h2>
            <p className="text-lg text-muted-foreground">
              Join SmartBid Nexus today and discover amazing deals on thousands of items
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary shadow-glow">
                Create Your Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
