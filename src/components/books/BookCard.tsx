import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Book as BookIcon,
  Heart,
  Play,
  ShoppingCart,
  ExternalLink,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { Book } from '@/types';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'featured';
}

export function BookCard({ book, variant = 'default' }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    if (isWishlisted) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('book_id', book.id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, book_id: book.id });
      setIsWishlisted(true);
      toast.success('Added to wishlist');
    }
  };

  const discount = book.original_price
    ? Math.round((1 - book.price / book.original_price) * 100)
    : 0;

  return (
    <Link to={`/book/${book.id}`}>
      <Card
        className="group overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cover image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={book.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              {book.is_physical ? (
                <Badge variant="primary" size="sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  Physical
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  <BookIcon className="w-3 h-3 mr-1" />
                  Digital PDF
                </Badge>
              )}
              {book.is_featured && (
                <Badge variant="warning" size="sm">
                  <Award className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Discount badge */}
            {discount > 0 && (
              <Badge variant="error" size="sm">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300',
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-dark-900/80 text-white hover:bg-rose-500 opacity-0 group-hover:opacity-100'
            )}
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-white')} />
          </motion.button>

          {/* Hover actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center p-2.5 bg-dark-900/80 hover:bg-dark-800 text-white rounded-xl transition-colors"
            >
              <Play className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Sales count */}
          {book.total_sales > 50 && (
            <div className="absolute bottom-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity">
              <Badge variant="default" size="sm">
                <TrendingUp className="w-3 h-3 mr-1" />
                {book.total_sales} sold
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <Badge variant="outline" size="sm" className="mb-2">
            {book.category}
          </Badge>

          {/* Title */}
          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors mb-1">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-sm text-dark-400 mb-3">{book.author}</p>

          {/* Price and rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold gradient-text">
                {formatPrice(book.price)}
              </span>
              {book.original_price && (
                <span className="text-sm text-dark-500 line-through">
                  {formatPrice(book.original_price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning-400 fill-warning-400" />
              <span className="text-sm text-dark-300">
                {book.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>

          {/* Seller info (for variant featured) */}
          {variant === 'featured' && book.seller && (
            <div className="mt-3 pt-3 border-t border-dark-800/50 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs text-white font-bold">
                {(book.seller as { full_name?: string })?.full_name?.[0] || '?'}
              </div>
              <span className="text-xs text-dark-400">
                by {(book.seller as { full_name?: string })?.full_name || 'Unknown'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
