import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PaymentFormProps {
  auction: {
    id: string;
    title: string;
    current_price: number;
    shipping_cost: number;
    seller: {
      name: string;
    };
  };
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ auction, onPaymentSuccess, onCancel }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const subtotal = auction.current_price;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const shipping = auction.shipping_cost;
  const total = subtotal + platformFee + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would integrate with Stripe, PayPal, etc.
      toast.success('Payment processed successfully!');
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auction Summary */}
            <div className="bg-accent-light p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{auction.title}</h3>
              <div className="flex items-center justify-between text-small text-accent-dark">
                <span>Sold by {auction.seller.name}</span>
                <Badge className="bg-semantic-success text-white">Won</Badge>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          expiryDate: formatExpiryDate(e.target.value)
                        })}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => setFormData({
                          ...formData,
                          cvv: e.target.value.replace(/\D/g, '')
                        })}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({
                        ...formData,
                        cardholderName: e.target.value
                      })}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Billing Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Billing Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        email: e.target.value
                      })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: e.target.value
                      })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          city: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          state: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          zipCode: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({
                        ...formData,
                        country: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Summary</h3>
                  
                  <div className="space-y-2 text-small">
                    <div className="flex justify-between">
                      <span>Winning Bid</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (5%)</span>
                      <span>${platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${shipping.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-semantic-success/10 border border-semantic-success rounded-lg p-3">
                  <div className="flex items-center gap-2 text-semantic-success">
                    <Shield className="h-4 w-4" />
                    <span className="text-small font-medium">Secure Payment</span>
                  </div>
                  <p className="text-small text-accent-dark mt-1">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-accent-dark"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay ${total.toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* PayPal Payment */}
            {paymentMethod === 'paypal' && (
              <div className="text-center py-8">
                <div className="bg-accent-light p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">PayPal Integration</h3>
                  <p className="text-small text-accent-dark mb-4">
                    Redirect to PayPal for secure payment processing
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Pay with PayPal
                  </Button>
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === 'bank' && (
              <div className="space-y-4">
                <div className="bg-accent-light p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                  <div className="space-y-2 text-small">
                    <div className="flex justify-between">
                      <span>Account Name:</span>
                      <span>SmartBid Nexus</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <span>1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routing Number:</span>
                      <span>021000021</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-semantic-discount/10 border border-semantic-discount rounded-lg p-3">
                  <div className="flex items-center gap-2 text-semantic-discount">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-small font-medium">Important</span>
                  </div>
                  <p className="text-small text-accent-dark mt-1">
                    Please include the auction ID ({auction.id}) in your transfer reference.
                    Payment will be processed within 1-2 business days.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentForm;
