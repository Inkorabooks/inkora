import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Book as BookIcon,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  FileText,
  Eye,
  Ban,
  ShieldCheck,
  BarChart3,
  Settings,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  UserX,
  UserCheck,
  MessageSquare,
  Flag,
} from 'lucide-react';
import { Button, Card, Badge, Input, Tabs, Modal, Avatar } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book, Profile, Report, AdminStats, Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function AdminPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !profile?.is_admin) {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user, profile, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);

    // Fetch stats
    const { data: usersCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const { data: booksCount } = await supabase.from('books').select('id', { count: 'exact', head: true });
    const { data: ordersCount } = await supabase.from('orders').select('id, amount', { count: 'exact' });
    const { data: pendingApprovals } = await supabase.from('books').select('id', { count: 'exact', head: true }).eq('is_approved', false);
    const { data: pendingReportsCount } = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending');

    // Calculate stats
    const totalRevenue = ordersCount?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    setStats({
      totalUsers: usersCount?.length || 0,
      totalBooks: booksCount?.length || 0,
      totalOrders: ordersCount?.length || 0,
      totalRevenue,
      pendingApprovals: pendingApprovals?.length || 0,
      pendingReports: pendingReportsCount?.length || 0,
      newUsersThisMonth: 0,
      newBooksThisMonth: 0,
    });

    // Fetch pending books for approval
    const { data: booksData } = await supabase
      .from('books')
      .select('*, seller:profiles(*)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (booksData) setPendingBooks(booksData as Book[]);

    // Fetch pending reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(*), reported_user:profiles!reported_user_id(*), reported_book:books(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);
    if (reportsData) setPendingReports(reportsData as Report[]);

    // Fetch recent orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, book:books(*), buyer:profiles!buyer_id(*)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (ordersData) setRecentOrders(ordersData as Order[]);

    // Fetch recent users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (usersData) setRecentUsers(usersData as Profile[]);

    setLoading(false);
  };

  const approveBook = async (book: Book) => {
    const { error } = await supabase
      .from('books')
      .update({ is_approved: true })
      .eq('id', book.id);

    if (error) {
      toast.error('Failed to approve book');
    } else {
      toast.success('Book approved');
      setPendingBooks(prev => prev.filter(b => b.id !== book.id));

      // Create notification for seller
      await supabase.rpc('create_notification', {
        p_user_id: book.seller_id,
        p_type: 'approval',
        p_title: 'Book Approved!',
        p_message: `Your book "${book.title}" has been approved and is now live.`,
      });

      setShowBookModal(false);
      fetchAdminData();
    }
  };

  const rejectBook = async (book: Book) => {
    const { error } = await supabase
      .from('books')
      .update({ is_active: false })
      .eq('id', book.id);

    if (error) {
      toast.error('Failed to reject book');
    } else {
      toast.success('Book rejected');
      setPendingBooks(prev => prev.filter(b => b.id !== book.id));
      setShowBookModal(false);
      fetchAdminData();
    }
  };

  const resolveReport = async (report: Report, action: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: action })
      .eq('id', report.id);

    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success(`Report ${action}`);
      setPendingReports(prev => prev.filter(r => r.id !== report.id));
      setShowReportModal(false);
      fetchAdminData();
    }
  };

  const toggleUserVerification = async (userId: string, isVerified: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !isVerified })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success('User updated');
      fetchAdminData();
    }
  };

  if (!profile?.is_admin) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'books', label: 'Pending Books', icon: <BookIcon className="w-4 h-4" />, count: stats?.pendingApprovals },
    { id: 'reports', label: 'Reports', icon: <Flag className="w-4 h-4" />, count: stats?.pendingReports },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-primary-400" />
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            </div>
            <p className="text-dark-400">Manage users, books, and reports</p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchAdminData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-dark-400">Users</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <BookIcon className="w-5 h-5 text-secondary-400" />
                <span className="text-sm text-dark-400">Books</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalBooks}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-success-400" />
                <span className="text-sm text-dark-400">Revenue</span>
              </div>
              <p className="text-3xl font-bold gradient-text">{formatPrice(stats.totalRevenue)}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning-400" />
                <span className="text-sm text-dark-400">Pending</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.pendingApprovals}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Flag className="w-5 h-5 text-error-400" />
                <span className="text-sm text-dark-400">Reports</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Content */}
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent orders */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-400" />
                  Recent Orders
                </h2>
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/50">
                      <img
                        src={(order.book as Book)?.cover_url || ''}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{(order.book as Book)?.title}</p>
                        <p className="text-xs text-dark-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatPrice(order.amount)}</p>
                        <Badge variant={order.status === 'completed' ? 'success' : 'warning'} size="sm">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent users */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  Recent Users
                </h2>
                <div className="space-y-3">
                  {recentUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/50">
                      <Avatar src={user.avatar_url} name={user.full_name} size="md" verified={user.is_verified} />
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-xs text-dark-400">{formatDate(user.created_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        {user.is_seller && <Badge variant="success" size="sm">Seller</Badge>}
                        {user.is_admin && <Badge variant="primary" size="sm">Admin</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Pending Books Tab */}
          {activeTab === 'books' && (
            <div>
              {pendingBooks.length > 0 ? (
                <div className="space-y-4">
                  {pendingBooks.map(book => (
                    <Card key={book.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={book.cover_url || 'https://images.pexels.com/photos/2564816/pexels-photo-2564816.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{book.title}</h3>
                            <Badge variant="warning" size="sm">Pending</Badge>
                          </div>
                          <p className="text-sm text-dark-400">{book.author}</p>
                          <p className="text-sm text-dark-300 mt-1">{book.category} • {formatPrice(book.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-dark-500">By {(book.seller as Profile)?.full_name}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedBook(book); setShowBookModal(true); }}
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            Review
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => approveBook(book)}
                            leftIcon={<CheckCircle className="w-4 h-4" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => rejectBook(book)}
                            leftIcon={<XCircle className="w-4 h-4" />}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 mx-auto text-success-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
                  <p className="text-dark-400">No books pending approval</p>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              {pendingReports.length > 0 ? (
                <div className="space-y-4">
                  {pendingReports.map(report => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-error-500/20">
                          <AlertTriangle className="w-6 h-6 text-error-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="error" size="sm">{report.report_type}</Badge>
                            <Badge variant="warning" size="sm">{report.status}</Badge>
                          </div>
                          <p className="text-white mt-2">{report.description}</p>
                          <p className="text-sm text-dark-400 mt-2">
                            Reported by {(report.reporter as Profile)?.full_name} • {formatDate(report.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedReport(report); setShowReportModal(true); }}
                          >
                            Review
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => resolveReport(report, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => resolveReport(report, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Flag className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No pending reports</h3>
                  <p className="text-dark-400">All reports have been reviewed</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-dark-800/50">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {recentUsers.map(user => (
                    <tr key={user.id} className="hover:bg-dark-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                          <div>
                            <p className="text-white">{user.full_name}</p>
                            <p className="text-sm text-dark-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {user.is_seller && <Badge variant="success" size="sm">Seller</Badge>}
                          {user.is_verified && <Badge variant="primary" size="sm">Verified</Badge>}
                          {user.is_admin && <Badge variant="warning" size="sm">Admin</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserVerification(user.id, user.is_verified)}
                          >
                            {user.is_verified ? 'Unverify' : 'Verify'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Book</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Buyer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-dark-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={(order.book as Book)?.cover_url || ''} alt="" className="w-10 h-14 object-cover rounded" />
                          <span className="text-white">{(order.book as Book)?.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-300">{(order.buyer as Profile)?.full_name}</td>
                      <td className="px-6 py-4 text-white font-medium">{formatPrice(order.amount)}</td>
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
          )}
        </div>

        {/* Book Review Modal */}
        <Modal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          title="Review Book"
          size="lg"
        >
          {selectedBook && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedBook.cover_url || ''}
                  alt={selectedBook.title}
                  className="w-32 h-44 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{selectedBook.title}</h3>
                  <p className="text-dark-400">{selectedBook.author}</p>
                  <Badge className="mt-2">{selectedBook.category}</Badge>
                  <p className="text-primary-400 font-bold mt-2">{formatPrice(selectedBook.price)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-300 mb-2">Description</h4>
                <p className="text-dark-400">{selectedBook.description || 'No description'}</p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dark-800">
                <Button variant="ghost" onClick={() => setShowBookModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => rejectBook(selectedBook)} className="flex-1">
                  Reject
                </Button>
                <Button onClick={() => approveBook(selectedBook)} className="flex-1">
                  Approve
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Report Review Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Review Report"
          size="md"
        >
          {selectedReport && (
            <div className="space-y-4">
              <Badge variant="error">{selectedReport.report_type}</Badge>
              <p className="text-dark-300">{selectedReport.description}</p>
              {selectedReport.reported_book && (
                <div className="p-4 glass rounded-xl">
                  <p className="text-sm text-dark-400">Reported Book:</p>
                  <p className="text-white">{(selectedReport.reported_book as Book).title}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-dark-800">
                <Button variant="ghost" onClick={() => setShowReportModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="secondary" onClick={() => resolveReport(selectedReport, 'dismissed')} className="flex-1">
                  Dismiss
                </Button>
                <Button onClick={() => resolveReport(selectedReport, 'resolved')} className="flex-1">
                  Resolve
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
