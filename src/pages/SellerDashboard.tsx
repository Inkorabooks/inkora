import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Book as BookIcon,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, Badge, Modal, Tabs } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book, Order, Transaction } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    totalSales: 0,
    totalViews: 0,
    activeListings: 0,
    pendingApproval: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // Fetch books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (booksData) {
        setBooks(booksData as Book[]);
        const active = booksData.filter(b => b.is_active).length;
        const pending = booksData.filter(b => !b.is_approved).length;
        const sales = booksData.reduce((sum, b) => sum + b.total_sales, 0);
        setStats(prev => ({
          ...prev,
          activeListings: active,
          pendingApproval: pending,
          totalSales: sales,
        }));
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, book:books(*)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersData) {
        setOrders(ordersData as Order[]);
        const thisMonth = ordersData
          .filter(o => new Date(o.created_at).getMonth() === new Date().getMonth())
          .reduce((sum, o) => sum + o.seller_earnings, 0);
        setStats(prev => ({
          ...prev,
          totalEarnings: profile?.total_earnings || 0,
          thisMonth,
        }));
      }

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txData) setTransactions(txData as Transaction[]);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate, profile]);

  const toggleActive = async (book: Book) => {
    const { error } = await supabase
      .from('books')
      .update({ is_active: !book.is_active })
      .eq('id', book.id);

    if (!error) {
      setBooks(books.map(b => (b.id === book.id ? { ...b, is_active: !b.is_active } : b)));
      toast.success(book.is_active ? 'Deactivated' : 'Activated');
    }
  };

  const deleteBook = async () => {
    if (!selectedBook) return;
    await supabase.from('books').delete().eq('id', selectedBook.id);
    setBooks(books.filter(b => b.id !== selectedBook.id));
    setShowDelete(false);
    toast.success('Deleted');
  };

  const withdrawRequest = async () => {
    if (!user || !profile) return;
    if (profile.seller_wallet_balance < 100) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }
    toast.success('Withdrawal request submitted!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-dark-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const earningsChange = stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'listings', label: 'Listings', icon: <BookIcon className="w-4 h-4" />, count: books.length },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, count: orders.length },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
            <p className="text-dark-400">Manage your books and track earnings</p>
          </div>
          <div className="flex gap-3">
            <Link to="/sell">
              <Button leftIcon={<Upload className="w-4 h-4" />}>Add Book</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-success-500/20">
                  <DollarSign className="w-5 h-5 text-success-400" />
                </div>
                {earningsChange !== 0 && (
                  <div className={cn('flex items-center gap-1 text-sm', earningsChange >= 0 ? 'text-success-400' : 'text-error-400')}>
                    {earningsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(earningsChange).toFixed(0)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-dark-400 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-white">{formatPrice(stats.totalEarnings)}</p>
              <p className="text-xs text-dark-500 mt-1">{formatPrice(stats.thisMonth)} this month</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-primary-500/20">
                  <BookIcon className="w-5 h-5 text-primary-400" />
                </div>
                <Badge variant="primary" size="sm">{stats.activeListings} active</Badge>
              </div>
              <p className="text-sm text-dark-400 mb-1">Total Listings</p>
              <p className="text-2xl font-bold text-white">{books.length}</p>
              {stats.pendingApproval > 0 && (
                <p className="text-xs text-warning-400 mt-1">{stats.pendingApproval} pending approval</p>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-accent-500/20">
                  <ShoppingBag className="w-5 h-5 text-accent-400" />
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-warning-500/20">
                  <DollarSign className="w-5 h-5 text-warning-400" />
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold gradient-text">{formatPrice(profile?.seller_wallet_balance || 0)}</p>
              <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={withdrawRequest}>
                Withdraw
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent orders */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/50 transition-colors">
                          <img
                            src={(order.book as Book)?.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt=""
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-white">{(order.book as Book)?.title}</p>
                            <p className="text-sm text-dark-400">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-success-400">+{formatPrice(order.seller_earnings)}</p>
                            <Badge variant={order.status === 'completed' ? 'success' : 'warning'} size="sm">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 mx-auto text-dark-600 mb-3" />
                      <p className="text-dark-400">No orders yet</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick actions */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link to="/sell" className="block">
                      <Button variant="secondary" className="w-full justify-start" leftIcon={<Upload className="w-4 h-4" />}>
                        Upload New Book
                      </Button>
                    </Link>
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Download className="w-4 h-4" />}>
                      Download Sales Report
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Settings className="w-4 h-4" />}>
                      Seller Settings
                    </Button>
                  </div>
                </Card>

                {/* Tips */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Seller Tips</h2>
                  <ul className="space-y-3 text-sm text-dark-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5" />
                      Add high-quality cover images
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5" />
                      Write detailed descriptions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5" />
                      Price competitively
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5" />
                      Respond to buyer messages quickly
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              {books.length > 0 ? (
                <div className="space-y-4">
                  {books.map(book => (
                    <Card key={book.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={book.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{book.title}</h3>
                            {!book.is_approved && (
                              <Badge variant="warning" size="sm">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {book.is_active ? (
                              <Badge variant="success" size="sm">Active</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-dark-400">{book.author}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-primary-400 font-medium">{formatPrice(book.price)}</span>
                            <span className="text-dark-500 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {book.average_rating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-dark-500">{book.total_sales} sold</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/book/${book.id}`}>
                            <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => toggleActive(book)}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              book.is_active
                                ? 'text-success-400 hover:bg-success-500/10'
                                : 'text-dark-400 hover:text-white hover:bg-dark-800'
                            )}
                          >
                            {book.is_active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => { setSelectedBook(book); setShowDelete(true); }}
                            className="p-2 text-dark-400 hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookIcon className="w-20 h-20 mx-auto text-dark-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No books listed</h3>
                  <p className="text-dark-400 mb-6">Start selling your books today</p>
                  <Link to="/sell">
                    <Button leftIcon={<Upload className="w-4 h-4" />}>List Your First Book</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {orders.length > 0 ? (
                <Card className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-dark-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Book</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Buyer</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Your Earnings</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800/50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-dark-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={(order.book as Book)?.cover_url || ''} alt="" className="w-10 h-14 object-cover rounded" />
                              <span className="text-white line-clamp-1">{(order.book as Book)?.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-dark-300">Buyer</td>
                          <td className="px-6 py-4 text-white font-medium">{formatPrice(order.amount)}</td>
                          <td className="px-6 py-4 text-success-400 font-medium">+{formatPrice(order.seller_earnings)}</td>
                          <td className="px-6 py-4">
                            <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'default'}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-dark-400 text-sm">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ) : (
                <div className="text-center py-16">
                  <ShoppingBag className="w-20 h-20 mx-auto text-dark-600 mb-4" />
                  <p className="text-dark-400">No orders yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Earnings Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-dark-300">Total Earnings</span>
                    <span className="text-2xl font-bold text-white">{formatPrice(stats.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-dark-300">This Month</span>
                    <span className="text-xl font-semibold gradient-text">{formatPrice(stats.thisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-dark-300">Available Balance</span>
                    <span className="text-xl font-semibold text-success-400">{formatPrice(profile?.seller_wallet_balance || 0)}</span>
                  </div>
                </div>
                <Button className="w-full mt-6" onClick={withdrawRequest} glow>
                  Request Withdrawal
                </Button>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-800/50">
                        <div>
                          <p className="font-medium text-white capitalize">{tx.type}</p>
                          <p className="text-sm text-dark-400">{formatDate(tx.created_at)}</p>
                        </div>
                        <span className={cn('font-semibold', tx.type === 'earning' ? 'text-success-400' : 'text-dark-300')}>
                          {tx.type === 'earning' ? '+' : '-'}{formatPrice(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-dark-600 mb-3" />
                    <p className="text-dark-400">No transactions yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Book?" description="This action cannot be undone.">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDelete(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={deleteBook} className="flex-1">Delete</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
