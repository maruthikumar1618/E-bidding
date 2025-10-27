import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, MessageCircle, User, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    phone: '',
    email: user?.email || ''
  });

  const sellerInfo = location.state;

  useEffect(() => {
    if (sellerInfo?.auctionTitle) {
      setFormData(prev => ({
        ...prev,
        subject: `Regarding: ${sellerInfo.auctionTitle}`
      }));
    }
  }, [sellerInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to send a message');
      return;
    }

    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully! The seller will contact you soon.');
      navigate(-1);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-h1 font-bold mb-2">Contact Seller</h1>
          <p className="text-body text-accent-dark mb-8">
            Send a message to the seller about this auction
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seller Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{sellerInfo?.sellerName || 'Seller Name'}</h3>
                    <p className="text-small text-accent-dark">Verified Seller</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-small">
                      <Mail className="h-4 w-4 text-accent-dark" />
                      <span>seller@example.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-small">
                      <Phone className="h-4 w-4 text-accent-dark" />
                      <span>+91 98765 43210</span>
                    </div>
                  </div>

                  {sellerInfo?.auctionTitle && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Auction Details</h4>
                      <p className="text-small text-accent-dark">{sellerInfo.auctionTitle}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below to contact the seller
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Question about shipping"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Type your message here..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-accent-dark"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
