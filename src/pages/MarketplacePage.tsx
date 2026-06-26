import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Star,
  BookOpen,
  TrendingUp,
  Clock,
  DollarSign,
  Filter,
} from 'lucide-react';
import { Button, Card, Badge, Input, Select, Tabs } from '@/components/ui';
import { BookCard } from '@/components/books/BookCard';
import { supabase } from '@/lib/supabase';
import type { Book, Category } from '@/types';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const priceRanges = [
  { value: '', label: 'All Prices' },
  { value: '0-99', label: 'Under ₹100' },
  { value: '100-299', label: '₹100 - ₹299' },
  { value: '300-499', label: '₹300 - ₹499' },
  { value: '500-999', label: '₹500 - ₹999' },
  { value: '1000-', label: '₹1000+' },
];

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [contentType, setContentType] = useState(searchParams.get('type') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');

  // Fetch categories
  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  // Fetch books
  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('books')
      .select('*, seller:profiles(*)')
      .eq('is_active', true)
      .eq('is_approved', true);

    // Search
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Category
    const categoryFilter = searchParams.get('category');
    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    // Content type
    const typeFilter = searchParams.get('type');
    if (typeFilter) {
      query = query.eq('content_type', typeFilter);
    }

    // Price range
    const priceFilter = searchParams.get('price');
    if (priceFilter) {
      const [min, max] = priceFilter.split('-');
      if (min) query = query.gte('price', parseInt(min));
      if (max) query = query.lte('price', parseInt(max));
    }

    // Rating
    const ratingFilter = searchParams.get('rating');
    if (ratingFilter) {
      query = query.gte('average_rating', parseInt(ratingFilter));
    }

    // Sort
    const sortFilter = searchParams.get('sort') || 'newest';
    switch (sortFilter) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('total_sales', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
    }

    query.limit(60).then(({ data }) => {
      if (data) setBooks(data as Book[]);
      setLoading(false);
    });
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('newest');
    setPriceRange('');
    setContentType('');
    setRating('');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.get('search')) count++;
    if (searchParams.get('category')) count++;
    if (searchParams.get('type')) count++;
    if (searchParams.get('price')) count++;
    if (searchParams.get('rating')) count++;
    return count;
  }, [searchParams]);

  const featuredBooks = books.filter(b => b.is_featured).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-primary-900/30 via-dark-950 to-secondary-900/30 py-16">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-primary-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-secondary-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore the <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto mb-8">
              Discover thousands of digital books from authors around the world. PDFs, notes, study materials, and more.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search books, authors, or topics..."
                  className="w-full pl-14 pr-4 py-4 bg-dark-900/50 border border-dark-700/50 rounded-2xl text-white placeholder-dark-500 text-base focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  Search
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-16 z-40 bg-dark-950/95 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter toggle (mobile) */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              className="lg:hidden"
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            {/* Category filter */}
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                updateFilters({ category: e.target.value || null });
              }}
              className="px-4 py-2 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Content type filter */}
            <select
              value={contentType}
              onChange={e => {
                setContentType(e.target.value);
                updateFilters({ type: e.target.value || null });
              }}
              className="px-4 py-2 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500/50"
            >
              <option value="">All Types</option>
              <option value="book">Books</option>
              <option value="notes">Notes</option>
              <option value="study_material">Study Material</option>
            </select>

            {/* Price filter */}
            <select
              value={priceRange}
              onChange={e => {
                setPriceRange(e.target.value);
                updateFilters({ price: e.target.value || null });
              }}
              className="px-4 py-2 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500/50"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                updateFilters({ sort: e.target.value || null });
              }}
              className="px-4 py-2 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500/50"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 p-1 bg-dark-900/50 rounded-lg ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-dark-500 hover:text-white'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-dark-500 hover:text-white'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Results count */}
            <span className="text-sm text-dark-500">
              <span className="text-white font-semibold">{books.length}</span> books found
            </span>
          </div>

          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-dark-400">Active filters:</span>
              {searchParams.get('search') && (
                <Badge variant="primary" className="gap-1">
                  Search: "{searchParams.get('search')}"
                  <button onClick={() => updateFilters({ search: null })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchParams.get('category') && (
                <Badge variant="primary" className="gap-1">
                  {searchParams.get('category')}
                  <button onClick={() => updateFilters({ category: null })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured section */}
        {featuredBooks.length > 0 && !searchParams.get('search') && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="primary" className="mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
                <h2 className="text-2xl font-bold text-white">Editor's Picks</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* Books grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="skeleton h-72 rounded-2xl mb-4" />
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <motion.div
            layout
            className={cn(
              'gap-6',
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'flex flex-col'
            )}
          >
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-20 h-20 mx-auto text-dark-600 mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Books Found</h3>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              We couldn't find any books matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
