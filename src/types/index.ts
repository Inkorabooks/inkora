export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  is_seller: boolean;
  is_verified: boolean;
  is_admin: boolean;
  seller_wallet_balance: number;
  total_earnings: number;
  notification_count?: number;
  created_at: string;
}

export interface Book {
  id: string;
  seller_id: string;
  seller?: Profile;
  title: string;
  author: string;
  description: string | null;
  category: string;
  language: string;
  price: number;
  original_price?: number;
  cover_url: string | null;
  pdf_url: string;
  page_count: number | null;
  is_physical: boolean;
  condition: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  stock: number;
  total_sales: number;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  is_featured: boolean;
  is_approved: boolean;
  content_type: 'book' | 'notes' | 'study_material' | 'other';
  tags: string[];
  copyright_declaration: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  book_id: string;
  book?: Book;
  buyer?: Profile;
  seller?: Profile;
  order_type: 'digital' | 'physical';
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  amount: number;
  platform_fee: number;
  seller_earnings: number;
  payment_intent_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  book_id: string | null;
  last_message_at: string;
  created_at: string;
  buyer?: Profile;
  seller?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  order_id?: string;
  user?: Profile;
  rating: number;
  title?: string;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  book_id: string;
  book?: Book;
  created_at: string;
}

export interface UserLibrary {
  id: string;
  user_id: string;
  book_id: string;
  order_id?: string;
  book?: Book;
  current_page: number;
  reading_progress: number;
  last_read_at: string | null;
  purchased_at: string;
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  title: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  book_count?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'purchase' | 'review' | 'message' | 'system' | 'payout' | 'approval';
  title: string;
  message: string | null;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter?: Profile;
  reported_user_id?: string;
  reported_user?: Profile;
  reported_book_id?: string;
  reported_book?: Book;
  report_type: 'copyright' | 'inappropriate' | 'spam' | 'fraud' | 'other';
  description: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  order_id?: string;
  type: 'purchase' | 'earning' | 'sale' | 'withdrawal' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripe_id?: string;
  description?: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  pendingReports: number;
  newUsersThisMonth: number;
  newBooksThisMonth: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  admin?: Profile;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}
