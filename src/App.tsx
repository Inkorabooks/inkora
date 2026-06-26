import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
  HomePage,
  MarketplacePage,
  BookDetailPage,
  NearbyPage,
  UploadPage,
  ChatPage,
  ProfilePage,
  SellerDashboard,
  LoginPage,
  SignupPage,
  AdminPage,
} from '@/pages';
import { useAuthStore } from '@/store/authStore';

function Protected() {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const { profile, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return <Outlet />;
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/explore" element={<MarketplacePage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/seller/:id" element={<ProfilePage />} />

          {/* Protected routes */}
          <Route element={<Protected />}>
            <Route path="/sell" element={<UploadPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/library" element={<ProfilePage />} />
            <Route path="/wishlist" element={<ProfilePage />} />
            <Route path="/orders" element={<ProfilePage />} />
            <Route path="/notifications" element={<ProfilePage />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/books" element={<AdminPage />} />
              <Route path="/admin/reports" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminPage />} />
              <Route path="/admin/orders" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
