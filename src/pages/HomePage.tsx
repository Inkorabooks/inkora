import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Globe,
  Star,
  ArrowRight,
  Sparkles,
  Upload,
  Book as BookIcon,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Quote,
  Award,
  Wallet,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { BookCard } from '@/components/books/BookCard';
import { supabase } from '@/lib/supabase';
import type { Book } from '@/types';

const categories = [
  { name: 'Fiction', icon: '📚', color: 'from-primary-500 to-secondary-500', count: 2400 },
  { name: 'Academic', icon: '🎓', color: 'from-secondary-500 to-accent-500', count: 3100 },
  { name: 'Business', icon: '💼', color: 'from-accent-500 to-success-500', count: 890 },
  { name: 'Self-Help', icon: '🧘', color: 'from-success-500 to-warning-500', count: 1200 },
  { name: 'Technology', icon: '💻', color: 'from-primary-600 to-accent-500', count: 2100 },
  { name: 'Art & Design', icon: '🎨', color: 'from-error-500 to-primary-500', count: 750 },
];

const stats = [
  { value: '50K+', label: 'Digital Books', icon: BookOpen },
  { value: '25K+', label: 'Active Readers', icon: Users },
  { value: '5K+', label: 'Published Authors', icon: Award },
  { value: '120+', label: 'Countries', icon: Globe },
];

const features = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'Vast Library', description: 'Access thousands of digital books across every genre and category.', gradient: 'from-primary-500 to-secondary-500' },
  { icon: <Shield className="w-6 h-6" />, title: 'Secure PDFs', description: 'Watermarked and protected content ensures author rights are preserved.', gradient: 'from-secondary-500 to-accent-500' },
  { icon: <Wallet className="w-6 h-6" />, title: 'Fair Pricing', description: 'Direct author-to-reader sales mean better prices for everyone.', gradient: 'from-accent-500 to-success-500' },
  { icon: <Zap className="w-6 h-6" />, title: 'Instant Delivery', description: 'Buy and download your books instantly. No waiting required.', gradient: 'from-success-500 to-warning-500' },
  { icon: <Users className="w-6 h-6" />, title: 'Community', description: 'Connect with authors and fellow readers in our vibrant community.', gradient: 'from-warning-500 to-error-500' },
  { icon: <TrendingUp className="w-6 h-6" />, title: 'For Authors', description: 'Publish and sell your books with powerful analytics and fair royalties.', gradient: 'from-error-500 to-primary-500' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Bestselling Author', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Inkora transformed my writing career. The platform is beautiful, the royalties are fair, and my readers love the experience.', rating: 5 },
  { name: 'James Miller', role: 'Avid Reader', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Finally, a platform that values both authors and readers. The selection is incredible and the reading experience is seamless.', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Academic Researcher', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'The academic section has everything I need. Instant downloads and a beautiful PDF reader. Highly recommend!', rating: 5 },
];

const faqs = [
  { question: 'How do I sell my book on Inkora?', answer: 'Simply create a seller account, upload your PDF and cover image, set your price, and publish. We handle payments, delivery, and customer support.' },
  { question: 'What royalties do authors receive?', answer: 'Authors receive 80% of each sale, one of the highest rates in the industry. We only keep 20% to cover platform costs and payment processing.' },
  { question: 'Are the PDFs protected?', answer: 'Yes! All PDFs are watermarked with buyer information and use secure signed URLs. This protects author rights while ensuring a smooth reading experience.' },
  { question: 'Can I read books offline?', answer: 'Absolutely! Once purchased, you can download your books and read them on any device. Our reader also supports offline mode.' },
  { question: 'What payment methods are accepted?', answer: 'We accept all major credit cards, debit cards, and PayPal through our secure Stripe integration. All transactions are encrypted and safe.' },
  { question: 'How do refunds work?', answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your purchase. Contact our support team for assistance.' },
];

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('books').select('*, seller:profiles(*)').eq('is_active', true).order('total_sales', { ascending: false }).limit(8).then(({ data }) => {
      if (data) setBooks(data as Book[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-200">Premium Digital Book Marketplace</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Buy, Sell & Discover</span>
            <br />
            <span className="gradient-text-hero">Digital Books Worldwide</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
            Your premium marketplace for digital PDF books. Connect with authors, discover new titles, and build your personal library.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/marketplace"><Button size="lg" glow rightIcon={<ArrowRight className="w-5 h-5" />}>Explore Books</Button></Link>
            <Link to="/signup"><Button variant="secondary" size="lg" leftIcon={<Upload className="w-5 h-5" />}>Start Selling</Button></Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass mb-3 group hover:bg-primary-500/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center text-dark-500">
            <span className="text-xs mb-2">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}>
              <Badge variant="primary" className="mb-4"><BookOpen className="w-3 h-3 mr-1" />Browse by Category</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Explore Our Collection</motion.h2>
            <motion.p variants={fadeInUp} className="text-dark-400 max-w-2xl mx-auto">From fiction to academic, discover thousands of books across every genre.</motion.p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/marketplace?category=${cat.name}`}>
                  <Card className="p-5 text-center group hover:border-primary-500/30 transition-all">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-dark-500">{cat.count.toLocaleString()} books</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING BOOKS */}
      <section className="py-24 relative bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <Badge variant="primary" className="mb-3"><Sparkles className="w-3 h-3 mr-1" />Trending Now</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Popular Books</h2>
            </div>
            <Link to="/marketplace"><Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>View All</Button></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <div key={i} className="animate-pulse"><div className="skeleton h-72 rounded-2xl mb-4" /><div className="skeleton h-4 w-3/4 rounded mb-2" /><div className="skeleton h-4 w-1/2 rounded" /></div>)}</div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">{books.map((book, i) => <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}><BookCard book={book} /></motion.div>)}</div>
          ) : (
            <div className="text-center py-16"><BookIcon className="w-20 h-20 mx-auto text-dark-600 mb-4" /><p className="text-dark-400 mb-4">No books available yet</p><Link to="/marketplace"><Button>Browse Marketplace</Button></Link></div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}><Badge variant="secondary" className="mb-4"><Zap className="w-3 h-3 mr-1" />Why Inkora</Badge></motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Book Lovers</motion.h2>
            <motion.p variants={fadeInUp} className="text-dark-400 max-w-2xl mx-auto">Everything you need to discover, buy, sell, and read digital books.</motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 h-full group hover:border-primary-500/30 transition-all">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-dark-950 to-secondary-900/40" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-10 sm:p-16 text-center">
            <Badge variant="primary" className="mb-6" size="lg"><Upload className="w-4 h-4 mr-1" />For Authors</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Start Selling Your Books Today</h2>
            <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">Join thousands of authors earning from their passion. Upload your PDFs, set your prices, and reach readers worldwide. 80% royalties.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-dark-300"><CheckCircle2 className="w-5 h-5 text-success-400" /><span>No upfront fees</span></div>
              <div className="flex items-center gap-2 text-dark-300"><CheckCircle2 className="w-5 h-5 text-success-400" /><span>Instant payouts</span></div>
              <div className="flex items-center gap-2 text-dark-300"><CheckCircle2 className="w-5 h-5 text-success-400" /><span>Analytics dashboard</span></div>
            </div>
            <Link to="/signup"><Button size="xl" glow rightIcon={<ArrowRight className="w-5 h-5" />}>Start Selling Free</Button></Link>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}><Badge variant="primary" className="mb-4"><Heart className="w-3 h-3 mr-1" />Testimonials</Badge></motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved by Thousands</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 h-full">
                  <Quote className="w-8 h-8 text-primary-500/30 mb-4" />
                  <p className="text-dark-200 mb-6 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30" />
                    <div>
                      <h4 className="font-semibold text-white">{t.name}</h4>
                      <p className="text-dark-400 text-sm">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-4">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-warning-400 fill-warning-400" />)}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 relative bg-dark-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}><Badge variant="secondary" className="mb-4">Help</Badge></motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</motion.h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <div className="p-6 flex items-center justify-between cursor-pointer">
                    <h3 className="font-medium text-white pr-4">{faq.question}</h3>
                    <motion.div animate={{ rotate: activeFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown className="w-5 h-5 text-primary-400 flex-shrink-0" /></motion.div>
                  </div>
                  <motion.div initial={false} animate={{ height: activeFaq === i ? 'auto' : 0, opacity: activeFaq === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-6 pb-6 text-dark-400 text-sm leading-relaxed border-t border-dark-800/50 pt-4">{faq.answer}</div>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-secondary-900/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Start Reading?</h2>
            <p className="text-lg text-dark-300 mb-10 max-w-xl mx-auto">Join thousands of book lovers on Inkora. Discover your next favorite book today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup"><Button size="xl" glow rightIcon={<ArrowRight className="w-5 h-5" />}>Get Started Free</Button></Link>
              <Link to="/marketplace"><Button variant="outline" size="xl">Browse Books</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
