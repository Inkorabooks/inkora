import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  MapPin,
  Book as BookIcon,
  ShieldCheck,
  ShoppingBag,
  MessageSquare,
  Check,
  Play,
  Download,
  Clock,
  FileText,
  Users,
  Globe,
  ChevronRight,
  ThumbsUp,
  Flag,
  Eye,
} from 'lucide-react';
import { Button, Card, Badge, Avatar, Modal, Input, Textarea } from '@/components/ui';
import { PDFReader } from '@/components/pdf/PDFReader';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book, Profile, Review } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReader, setShowReader] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // Fetch book
      const { data: bookData } = await supabase
        .from('books')
        .select('*, seller:profiles(*)')
        .eq('id', id)
        .single();

      if (bookData) {
        setBook(bookData as Book);

        // Fetch related books
        const { data: related } = await supabase
          .from('books')
          .select('*, seller:profiles(*)')
          .eq('category', bookData.category)
          .eq('is_active', true)
          .neq('id', id)
          .limit(4);
        if (related) setRelatedBooks(related as Book[]);

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, user:profiles(*)')
          .eq('book_id', id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (reviewData) setReviews(reviewData as Review[]);
      }

      // Check wishlist and purchase status if user is logged in
      if (user) {
        const { data: wishlist } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('book_id', id)
          .single();
        setIsWishlisted(!!wishlist);

        const { data: purchase } = await supabase
          .from('orders')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('book_id', id)
          .eq('status', 'completed')
          .single();
        setHasPurchased(!!purchase);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  const handlePurchase = () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login');
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const handleChat = async () => {
    if (!user || !book) return;
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', book.seller_id)
      .eq('book_id', book.id)
      .single();

    if (data) {
      navigate(`/chat/${data.id}`);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: book.seller_id,
          book_id: book.id,
        })
        .select()
        .single();
      if (newConv) navigate(`/chat/${newConv.id}`);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in');
      return;
    }

    if (isWishlisted) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlist').insert({
        user_id: user.id,
        book_id: id,
      });
      setIsWishlisted(true);
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: book?.title,
        text: `Check out "${book?.title}" by ${book?.author} on Inkora`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !book) return;

    const { error } = await supabase.from('reviews').insert({
      book_id: id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment,
    });

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted');
      setShowReview(false);
      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*, user:profiles(*)')
        .eq('book_id', id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data as Review[]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-dark-400">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookIcon className="w-20 h-20 mx-auto text-dark-600 mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Book not found</h1>
          <Button onClick={() => navigate('/marketplace')}>Browse Books</Button>
        </div>
      </div>
    );
  }

  const seller = book.seller as Profile;
  const discount = book.original_price
    ? Math.round((1 - book.price / book.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8">
      {/* PDF Reader Modal */}
      <AnimatePresence>
        {showReader && hasPurchased && (
          <PDFReader
            bookId={book.id}
            pdfUrl={book.pdf_url}
            title={book.title}
            onClose={() => setShowReader(false)}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <Modal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        title="Write a Review"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setReviewRating(i)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'w-6 h-6 transition-colors',
                      i <= reviewRating
                        ? 'text-warning-400 fill-warning-400'
                        : 'text-dark-600'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Your Review"
            placeholder="Share your thoughts about this book..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowReview(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} className="flex-1">
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 rounded-2xl"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden relative group">
                  <img
                    src={book.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="error" size="lg">
                        -{discount}% OFF
                      </Badge>
                    </div>
                  )}
                  {/* Featured badge */}
                  {book.is_featured && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="primary" size="lg">
                        Featured
                      </Badge>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full" onClick={() => setShowReader(true)}>
                      <Play className="w-4 h-4 mr-2" />
                      Read Preview
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleWishlist}
                  leftIcon={
                    isWishlisted ? (
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )
                  }
                >
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleShare}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Share
                </Button>
              </div>

              {/* Quick Info */}
              <Card className="p-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <FileText className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Format</p>
                    <p className="text-sm font-medium text-white">
                      {book.is_physical ? 'Physical' : 'PDF'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Pages</p>
                    <p className="text-sm font-medium text-white">
                      {book.page_count || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Globe className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Language</p>
                    <p className="text-sm font-medium text-white">{book.language}</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Sold</p>
                    <p className="text-sm font-medium text-white">{book.total_sales}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {book.is_physical ? (
                  <Badge variant="primary">
                    <MapPin className="w-3 h-3 mr-1" />
                    Physical Book
                  </Badge>
                ) : (
                  <Badge variant="success">
                    <BookIcon className="w-3 h-3 mr-1" />
                    Digital PDF
                  </Badge>
                )}
                {seller?.is_verified && (
                  <Badge variant="primary">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
                <Badge variant="secondary">{book.category}</Badge>
                {book.content_type !== 'book' && (
                  <Badge>{book.content_type.replace('_', ' ')}</Badge>
                )}
              </div>

              {/* Title & Author */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {book.title}
              </h1>
              <p className="text-xl text-dark-400 mb-6">
                by <span className="text-primary-400 hover:underline cursor-pointer">{book.author}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i <= Math.round(book.average_rating)
                            ? 'text-warning-400 fill-warning-400'
                            : 'text-dark-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {book.average_rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-dark-500">({book.total_reviews} reviews)</span>
                </div>
                <span className="text-dark-500">{book.total_sales} sold</span>
              </div>

              {/* Price Card */}
              <Card className="p-6 mb-8 border-primary-500/20">
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-4xl font-bold gradient-text">
                    {formatPrice(book.price)}
                  </span>
                  {book.original_price && (
                    <>
                      <span className="text-xl text-dark-500 line-through">
                        {formatPrice(book.original_price)}
                      </span>
                      <Badge variant="success">Save {discount}%</Badge>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {hasPurchased ? (
                    <>
                      <Button
                        size="lg"
                        className="flex-1"
                        onClick={() => setShowReader(true)}
                        leftIcon={<BookIcon className="w-5 h-5" />}
                      >
                        Read Now
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => window.open(book.pdf_url, '_blank')}
                        leftIcon={<Download className="w-5 h-5" />}
                      >
                        Download PDF
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="flex-1"
                        glow
                        onClick={handlePurchase}
                        leftIcon={book.is_physical ? <ShoppingBag className="w-5 h-5" /> : <BookIcon className="w-5 h-5" />}
                      >
                        {book.is_physical ? 'Buy Now' : 'Purchase & Download'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleChat}
                        leftIcon={<MessageSquare className="w-5 h-5" />}
                      >
                        Contact Seller
                      </Button>
                    </>
                  )}
                </div>

                {/* Guarantees */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-dark-700/50">
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <ShieldCheck className="w-4 h-4 text-success-400" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <Eye className="w-4 h-4 text-primary-400" />
                    Preview Available
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <Download className="w-4 h-4 text-accent-400" />
                    Instant Download
                  </div>
                </div>
              </Card>

              {/* Seller Info */}
              <Card className="p-5 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={seller?.avatar_url}
                      name={seller?.full_name}
                      size="lg"
                      verified={seller?.is_verified}
                    />
                    <div>
                      <Link
                        to={`/seller/${seller?.id}`}
                        className="font-semibold text-white hover:text-primary-400 transition-colors"
                      >
                        {seller?.full_name || 'Unknown Seller'}
                      </Link>
                      <p className="text-sm text-dark-400">
                        {seller?.is_verified ? 'Verified Seller' : 'Member'} • Joined {formatDate(seller?.created_at || '')}
                      </p>
                    </div>
                  </div>
                  <Link to={`/seller/${seller?.id}`}>
                    <Button variant="ghost" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                  {book.description || 'No description available for this book.'}
                </p>
              </div>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Reviews ({reviews.length})
                  </h2>
                  {hasPurchased && (
                    <Button
                      variant="outline"
                      onClick={() => setShowReview(true)}
                      leftIcon={<Star className="w-4 h-4" />}
                    >
                      Write Review
                    </Button>
                  )}
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <Card key={review.id} className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar
                            src={(review.user as Profile)?.avatar_url}
                            name={(review.user as Profile)?.full_name}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">
                                {(review.user as Profile)?.full_name}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 text-warning-400 fill-warning-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-dark-400 mb-2">
                              {formatDate(review.created_at)}
                            </p>
                            <p className="text-dark-300">{review.comment}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {reviews.length > 5 && (
                      <Button variant="ghost" className="w-full">
                        View all {reviews.length} reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto text-dark-600 mb-4" />
                    <p className="text-dark-400">No reviews yet</p>
                    {hasPurchased && (
                      <Button
                        variant="ghost"
                        onClick={() => setShowReview(true)}
                        className="mt-4"
                      >
                        Be the first to review
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Similar Books</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link key={relatedBook.id} to={`/book/${relatedBook.id}`}>
                  <Card className="group overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <img
                        src={relatedBook.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                        {relatedBook.title}
                      </h3>
                      <p className="text-sm text-dark-400 truncate">{relatedBook.author}</p>
                      <p className="text-primary-400 font-semibold mt-1">
                        {formatPrice(relatedBook.price)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
