import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuctionCard from '@/components/AuctionCard';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface Seller {
  id: string;
  name: string;
  avatar_url?: string;
  rating: number;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  total_bids: number;
  image_urls: string[];
  end_time: string;
  status: 'ACTIVE' | 'ENDED' | 'DRAFT' | 'CANCELLED';
  views: number;
  category: Category;
  seller: Seller;
  isWatched?: boolean;
}

const BrowseAuctions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [searchQuery, categoryFilter, statusFilter, sortBy, priceRange, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: 'desc'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (priceRange.min) {
        params.min_price = parseFloat(priceRange.min);
      }

      if (priceRange.max) {
        params.max_price = parseFloat(priceRange.max);
      }

      const response = await apiClient.getAuctions(params);
      setAuctions(response.auctions);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuctions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    if (key === 'category') {
      setCategoryFilter(value);
    } else if (key === 'status') {
      setStatusFilter(value);
    } else if (key === 'sort') {
      setSortBy(value);
    }
  };

  const handlePriceRangeChange = (key: 'min' | 'max', value: string) => {
    setCurrentPage(1);
    setPriceRange(prev => ({ ...prev, [key]: value }));
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Auctions</h1>
        <p className="text-gray-600">Discover amazing items up for auction</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest</SelectItem>
                  <SelectItem value="current_price">Price: Low to High</SelectItem>
                  <SelectItem value="current_price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="end_time">Ending Soon</SelectItem>
                  <SelectItem value="total_bids">Most Bids</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                <Search size={16} className="mr-2" />
                Search
              </Button>
              <div className="text-sm text-gray-600">
                {totalCount} auctions found
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-600 text-center">
              Try adjusting your search criteria or browse all auctions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction, index) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AuctionCard auction={auction} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-black text-white" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseAuctions;