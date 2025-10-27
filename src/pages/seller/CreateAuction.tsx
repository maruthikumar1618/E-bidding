import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { formatINR } from '@/lib/currency';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    custom_category: '',
    starting_price: '',
    reserve_price: '',
    condition: '',
    location: '',
    shipping_cost: '0',
    duration: '24',
    min_bid_increment: '1',
    auto_extend: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories((response as any).categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          newPreviews.push(result);
          
          if (newPreviews.length === Array.from(files).length) {
            setImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create an auction');
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.starting_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate end time based on duration
      const durationHours = parseInt(formData.duration);
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + durationHours);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('starting_price', formData.starting_price);
      formDataToSend.append('reserve_price', formData.reserve_price);
      formDataToSend.append('end_time', endTime.toISOString());
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('shipping_cost', formData.shipping_cost);
      formDataToSend.append('min_bid_increment', formData.min_bid_increment);
      formDataToSend.append('auto_extend', formData.auto_extend.toString());
      
      // Append images
      if (images.length > 0) {
        images.forEach(file => {
          formDataToSend.append('images', file);
        });
      }
      
      const response = await apiClient.createAuction(formDataToSend);
      toast.success('Auction created successfully!');
      navigate('/seller/dashboard');
    } catch (error: any) {
      console.error('Error creating auction:', error);
      toast.error(error.message || 'Failed to create auction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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

          <h1 className="text-h1 font-bold mb-2">Create New Auction</h1>
          <p className="text-body text-accent-dark mb-8">
            List your item and start receiving bids
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
          <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide information about the item you're selling</CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Vintage Rolex Submariner"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Category Input - Show when "Other" is selected */}
                  {formData.category_id === '13' && (
                    <div className="mt-2">
                      <Label htmlFor="custom_category">Specify Category *</Label>
                      <Input
                        id="custom_category"
                        placeholder="e.g., Musical Instruments, Kitchen Appliances"
                        value={formData.custom_category}
                        onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your item..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your starting price and reserve price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Starting Price */}
                  <div className="space-y-2">
                    <Label htmlFor="starting_price">Starting Bid (₹) *</Label>
                    <Input
                      id="starting_price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1000"
                      value={formData.starting_price}
                      onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                      required
                    />
                    <p className="text-caption text-accent-dark">
                      Minimum starting bid: ₹1
                    </p>
                  </div>

                  {/* Reserve Price */}
                  <div className="space-y-2">
                    <Label htmlFor="reserve_price">Reserve Price (₹)</Label>
                    <Input
                      id="reserve_price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Optional"
                      value={formData.reserve_price}
                      onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                    />
                    <p className="text-caption text-accent-dark">
                      Minimum price you're willing to accept
                    </p>
                  </div>
                </div>

                {/* Minimum Bid Increment */}
                <div className="space-y-2">
                  <Label htmlFor="min_bid_increment">Minimum Bid Increment (₹)</Label>
                  <Input
                    id="min_bid_increment"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100"
                    value={formData.min_bid_increment}
                    onChange={(e) => setFormData({ ...formData, min_bid_increment: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auction Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Auction Settings</CardTitle>
                <CardDescription>Configure how your auction will run</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Auction Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">2 days</SelectItem>
                      <SelectItem value="72">3 days</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto Extend */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_extend"
                    checked={formData.auto_extend}
                    onChange={(e) => setFormData({ ...formData, auto_extend: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="auto_extend">Auto-extend auction if bids are placed in the last 5 minutes</Label>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Item Images</CardTitle>
                <CardDescription>Upload photos of your item (up to 10 images)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-accent-medium rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-accent-dark" />
                    <p className="text-body text-accent-dark">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-small text-accent-dark mt-1">
                      PNG, JPG up to 10MB each
                    </p>
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Location</CardTitle>
                <CardDescription>Provide shipping and location information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  {/* Shipping Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
                    <Input
                      id="shipping_cost"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={formData.shipping_cost}
                      onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
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
                    {isLoading ? 'Creating...' : 'Create Auction'}
                  </Button>
                </div>
              </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAuction;