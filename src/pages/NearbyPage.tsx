import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { BookCard } from '@/components/books/BookCard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';
import { calculateDistance } from '@/lib/utils';
import toast from 'react-hot-toast';

const distances = [{ value: 5 }, { value: 10 }, { value: 20 }, { value: 50 }];

export function NearbyPage() {
  const { profile } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState(10);

  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      setUserLocation({ lat: profile.latitude, lng: profile.longitude });
      fetchBooks(profile.latitude, profile.longitude, maxDistance);
    } else getCurrentLocation();
  }, [profile, maxDistance]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      fetchBooks(pos.coords.latitude, pos.coords.longitude, maxDistance);
    }, () => { toast.error('Could not get location'); setLoading(false); });
  };

  const fetchBooks = async (lat: number, lng: number, dist: number) => {
    setLoading(true);
    const { data } = await supabase.from('books').select('*, seller:profiles(*)').eq('is_active', true).eq('is_physical', true).not('latitude', 'is', null);
    if (data) {
      const nearby = (data as Book[]).filter(b => b.latitude && b.longitude && calculateDistance(lat, lng, b.latitude, b.longitude) <= dist).sort((a, b) => calculateDistance(lat, lng, a.latitude || 0, a.longitude || 0) - calculateDistance(lat, lng, b.latitude || 0, b.longitude || 0));
      setBooks(nearby);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue"><MapPin className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">Books Near You</h1><p className="text-dark-400">Discover second-hand books nearby</p></div>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <Card className="p-4 flex items-center gap-3">
            {userLocation ? <><div className="p-2 rounded-lg bg-emerald-500/20"><Navigation className="w-5 h-5 text-emerald-400" /></div><span className="text-white">Location detected</span><Button variant="ghost" size="sm" onClick={getCurrentLocation}><RefreshCw className="w-4 h-4" /></Button></> : <Button onClick={getCurrentLocation}><Navigation className="w-4 h-4 mr-2" />Get My Location</Button>}
          </Card>
          <div className="flex items-center gap-2">
            <span className="text-dark-400 text-sm">Within</span>
            {distances.map(d => <button key={d.value} onClick={() => setMaxDistance(d.value)} className={cn('px-4 py-2 rounded-lg text-sm font-medium', maxDistance === d.value ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-800/50 text-dark-400 hover:text-white')}>{d.value} km</button>)}
          </div>
        </div>
        {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-dark-800 rounded-2xl h-80" />)}</div> : !userLocation ? <div className="text-center py-16"><MapPin className="w-16 h-16 mx-auto mb-4 text-dark-600" /><h3 className="text-xl font-semibold text-white mb-2">Enable Location</h3><p className="text-dark-400 mb-6">Allow location access to find books near you</p><Button onClick={getCurrentLocation}><Navigation className="w-5 h-5 mr-2" />Enable Location</Button></div> : books.length > 0 ? <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{books.map((book, i) => <motion.div key={book.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><div className="relative"><BookCard book={book} />{book.latitude && book.longitude && <Badge variant="primary" className="absolute top-4 left-4"><MapPin className="w-3 h-3 mr-1" />{calculateDistance(userLocation.lat, userLocation.lng, book.latitude, book.longitude).toFixed(1)} km</Badge>}</div></motion.div>)}</motion.div> : <div className="text-center py-16"><MapPin className="w-20 h-20 mx-auto mb-6 text-dark-600" /><h3 className="text-xl font-semibold text-white mb-2">No Books Nearby</h3><p className="text-dark-400 mb-6">No books within {maxDistance} km of your location</p><Button variant="secondary" onClick={() => setMaxDistance(50)}>Expand to 50 km</Button></div>}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
