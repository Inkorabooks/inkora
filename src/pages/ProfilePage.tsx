import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Book as BookIcon,
  Heart,
  ShoppingBag,
  DollarSign,
  Edit2,
  ShieldCheck,
  Settings,
  Bell,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  Award,
  Crown,
} from 'lucide-react';
import { Avatar, Button, Card, Badge, Input, Tabs } from '@/components/ui';
import { BookCard } from '@/components/books/BookCard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book, Order, WishlistItem, UserLibrary } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [library, setLibrary] = useState<UserLibrary[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Set active tab based on route
  useEffect(() => {
    if (location.pathname.includes('library')) setActiveTab('library');
    else if (location.pathname.includes('wishlist')) setActiveTab('wishlist');
    else if (location.pathname.includes('orders')) setActiveTab('orders');
    else setActiveTab('overview');
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // Fetch library
      const { data: libraryData } = await supabase
        .from('user_library')
        .select('*, book:books(*)')
        .eq('user_id', user.id);
      if (libraryData) setLibrary(libraryData as UserLibrary[]);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, book:books(*)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData as Order[]);

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select('*, book:books(*)')
        .eq('user_id', user.id);
      if (wishlistData) setWishlist(wishlistData as WishlistItem[]);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4" />, count: library.length },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, count: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" />, count: wishlist.length },
  ];

  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const booksRead = library.filter(l => l.reading_progress >= 90).length;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size="xl"
                verified={profile.is_verified}
                className="w-28 h-28"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                  {profile.is_verified && (
                    <Badge variant="primary">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile.is_seller && (
                    <Badge variant="success">
                      <Award className="w-3 h-3 mr-1" />
                      Seller
                    </Badge>
                  )}
                </div>
                <p className="text-dark-400 mb-2">{profile.email}</p>
                {profile.bio && (
                  <p className="text-dark-300 text-sm mb-2">{profile.bio}</p>
                )}
                {profile.location && (
                  <p className="text-dark-500 text-sm flex items-center gap-1 justify-center sm:justify-start">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{library.length}</p>
                    <p className="text-xs text-dark-400">Books</p>
                  </div>
                  <div className="w-px h-10 bg-dark-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                    <p className="text-xs text-dark-400">Orders</p>
                  </div>
                  <div className="w-px h-10 bg-dark-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">{booksRead}</p>
                    <p className="text-xs text-dark-400">Read</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => toast.success('Edit profile: coming soon!')}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/seller/dashboard')}
                  leftIcon={<Crown className="w-4 h-4" />}
                >
                  Seller Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-4 gap-4"
            >
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary-500/20">
                    <BookIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-dark-400 text-sm">Books Purchased</span>
                </div>
                <p className="text-3xl font-bold text-white">{library.length}</p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-success-500/20">
                    <ShoppingBag className="w-5 h-5 text-success-400" />
                  </div>
                  <span className="text-dark-400 text-sm">Total Orders</span>
                </div>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-warning-500/20">
                    <DollarSign className="w-5 h-5 text-warning-400" />
                  </div>
                  <span className="text-dark-400 text-sm">Total Spent</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatPrice(totalSpent)}</p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-error-500/20">
                    <Heart className="w-5 h-5 text-error-400" />
                  </div>
                  <span className="text-dark-400 text-sm">Wishlist Items</span>
                </div>
                <p className="text-3xl font-bold text-white">{wishlist.length}</p>
              </Card>

              {/* Reading Progress */}
              {library.length > 0 && (
                <Card className="p-5 md:col-span-2">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    Reading Progress
                  </h3>
                  <div className="space-y-3">
                    {library.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={(item.book as Book)?.cover_url || ''}
                          alt=""
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm line-clamp-1">{(item.book as Book)?.title}</p>
                          <div className="mt-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                              style={{ width: `${item.reading_progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-dark-400">{item.reading_progress}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Activity */}
              <Card className="p-5 md:col-span-2">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center gap-3">
                      <img
                        src={(order.book as Book)?.cover_url || ''}
                        alt=""
                        className="w-10 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm line-clamp-1">{(order.book as Book)?.title}</p>
                        <p className="text-xs text-dark-400">Purchased {formatDate(order.created_at)}</p>
                      </div>
                      <Badge variant="success">{formatPrice(order.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {library.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {library.map(item => (
                    <BookCard key={item.id} book={item.book as Book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookIcon className="w-20 h-20 mx-auto text-dark-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Your Library is Empty</h3>
                  <p className="text-dark-400 mb-6">Start building your collection</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    Browse Books
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={(order.book as Book)?.cover_url || ''}
                          alt=""
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{(order.book as Book)?.title}</p>
                          <p className="text-sm text-dark-400">{(order.book as Book)?.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
                              {order.status}
                            </Badge>
                            <span className="text-xs text-dark-500">{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{formatPrice(order.amount)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => navigate(`/book/${order.book_id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShoppingBag className="w-20 h-20 mx-auto text-dark-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                  <p className="text-dark-400 mb-6">Your purchase history will appear here</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {wishlist.map(item => (
                    <BookCard key={item.id} book={item.book as Book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-20 h-20 mx-auto text-dark-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Wishlist is Empty</h3>
                  <p className="text-dark-400 mb-6">Save books to buy later</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    Browse Books
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
