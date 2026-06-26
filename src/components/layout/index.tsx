import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Menu,
  X,
  User,
  Upload,
  MessageSquare,
  Heart,
  LogOut,
  ShoppingBag,
  Bell,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { Button, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Explore', path: '/explore' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(search)}`);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'glass border-b border-dark-800/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse" />
            </motion.div>
            <span className="text-2xl font-bold">
              <span className="gradient-text">Ink</span>
              <span className="text-white">ora</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'relative text-sm font-medium transition-colors duration-300',
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-dark-400 hover:text-white'
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search books, authors..."
                className="w-72 pl-11 pr-4 py-2.5 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/notifications" className="hidden sm:flex p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                </Link>
                <Link to="/chat" className="hidden sm:flex p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to="/wishlist" className="hidden sm:flex p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/sell">
                  <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                    Sell
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-800/50 transition-colors">
                    <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" verified={profile?.is_verified} />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="px-3 py-2 border-b border-dark-700/50 mb-2">
                      <p className="font-medium text-white">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-dark-400">{profile?.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link to="/library" className="flex items-center gap-2 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors">
                      <BookOpen className="w-4 h-4" />
                      My Library
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                      Orders
                    </Link>
                    <Link to="/seller/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors">
                      <Sparkles className="w-4 h-4" />
                      Seller Dashboard
                    </Link>
                    <div className="border-t border-dark-700/50 mt-2 pt-2">
                      <button
                        onClick={() => { signOut(); toast.success('Signed out successfully'); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-error-400 hover:bg-error-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button onClick={toggleTheme} className="p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link to="/login" className="hidden sm:block px-4 py-2 text-dark-300 hover:text-white text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/signup">
                  <Button size="sm" glow>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-dark-800/50"
          >
            <div className="p-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search books..."
                    className="w-full pl-11 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </form>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl transition-colors',
                    location.pathname === link.path
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <div className="pt-4 border-t border-dark-800/50 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Categories', href: '/marketplace?category=all' },
      { label: 'Featured', href: '/marketplace?featured=true' },
      { label: 'Pricing', href: '/pricing' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
    Resources: [
      { label: 'Help Center', href: '/help' },
      { label: 'Seller Guide', href: '/seller-guide' },
      { label: 'Blog', href: '/blog' },
      { label: 'API Docs', href: '/api' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Copyright', href: '/copyright' },
      { label: 'DMCA', href: '/dmca' },
    ],
  };

  return (
    <footer className="relative bg-dark-950 border-t border-dark-800/50">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="gradient-text">Ink</span>
                <span className="text-white">ora</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm mb-6 max-w-xs">
              Where Stories Become Digital. Buy, sell, and discover amazing digital books from authors worldwide.
            </p>
            <div className="flex gap-3">
              {['twitter', 'instagram', 'linkedin', 'youtube'].map(social => (
                <a
                  key={social}
                  href={`https://${social}.com/inkora`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-white hover:bg-primary-500/20 transition-all"
                >
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-dark-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-card p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Stay Updated</h4>
              <p className="text-dark-400 text-sm">Get notified about new features and exclusive offers.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-primary-500/50"
              />
              <Button>Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-dark-800/50">
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} Inkora. All rights reserved.
          </p>
          <p className="text-dark-500 text-sm">
            Made with passion for book lovers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[120px]" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(51, 65, 85, 0.5)',
          },
        }}
      />
      <Navbar />
      <main className="pt-16 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
