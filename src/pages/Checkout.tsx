import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, CreditCard, Truck, Shield } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { motion } from 'framer-motion';

interface CheckoutLocationState {
  auctionId?: string;
  amount?: number;
  auctionTitle?: string;
  auctionImage?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    paymentMethod: 'card'
  });

  const state = location.state as CheckoutLocationState || {};
  const { amount = 0, auctionTitle = 'Auction Item', auctionImage } = state;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const calculateTotals = () => {
    const shippingCost = 100;
    const subtotal = amount;
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst + shippingCost;

    return { subtotal, gst, shippingCost, total };
  };

  const { subtotal, gst, shippingCost, total } = calculateTotals();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment record
      await apiClient.createPayment({
        auction_id: state.auctionId || '',
        amount: total,
        payment_method: formData.paymentMethod
      });

      toast.success('Order placed successfully!');
      navigate('/orders', { state: { success: true } });
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-2">Review your order and complete payment</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Delivery & Payment Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                    <CardDescription>Where should we deliver your item?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="House/Flat No., Building, Street"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          placeholder="400001"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        placeholder="Near Central Park"
                        value={formData.landmark}
                        onChange={(e) => handleInputChange('landmark', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="saveAddress" className="cursor-pointer">
                        Save this address for future use
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-muted-foreground">
                            Pay securely with your card
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium">UPI</div>
                          <div className="text-sm text-muted-foreground">
                            Pay using UPI apps like Google Pay, PhonePe
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">
                            Pay cash when your order is delivered
                          </div>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Item Details */}
                    {auctionImage && (
                      <div className="flex gap-4">
                        <img
                          src={auctionImage}
                          alt={auctionTitle}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{auctionTitle}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatINR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping Charges</span>
                        <span>{formatINR(shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GST (18%)</span>
                        <span>{formatINR(gst)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>{formatINR(total)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Delivery Info */}
                    <div className="flex items-start gap-3 text-sm">
                      <Truck className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Expected Delivery</p>
                        <p className="text-muted-foreground">5-7 business days</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Shield className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Secure Payment</p>
                        <p className="text-muted-foreground">Protected by 256-bit SSL</p>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By placing this order, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;

