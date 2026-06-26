# Inkora - Where Stories Become Digital

A premium digital PDF book marketplace where users can buy, sell, and discover books worldwide.

## Features

- **Premium Dark UI**: Glassmorphism design with smooth animations
- **Digital Book Marketplace**: Browse, search, and purchase PDF books
- **Seller Dashboard**: Upload, manage, and track book sales with analytics
- **In-App PDF Reader**: Full-featured reader with bookmarks, progress tracking, and controls
- **Authentication**: Email/password and Google OAuth support
- **Real-time Chat**: Message buyers and sellers instantly
- **Reviews & Ratings**: Community-driven book reviews
- **Wishlist & Library**: Save books and track purchased content
- **Admin Panel**: Moderate books, manage users, handle reports
- **Notifications**: Real-time alerts for purchases, reviews, messages

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **PDF Viewer**: react-pdf

## Supabase Integration

The app is fully connected to Supabase with:

### Authentication
- Email/password signup and login
- Google OAuth integration
- Automatic profile creation on signup
- Row-level security on all tables

### Database Tables
- `profiles` - User profiles with seller status
- `books` - Book listings with approval workflow
- `orders` - Purchase records
- `user_library` - Purchased books with reading progress
- `conversations` & `messages` - Real-time chat
- `reviews` - Book ratings and comments
- `wishlist` - Saved books
- `notifications` - User alerts
- `reports` - Content moderation
- `transactions` - Financial records
- `categories` - Book categories

### Storage Buckets
- `books` - PDF file uploads
- `covers` - Book cover images

### Features
- Admin approval workflow for new books
- Notification system for sellers
- Real-time updates via Supabase subscriptions
- Seller statistics and earnings tracking

## Color Palette

Primary: `#7C3AED` (Purple)
Secondary: `#4F46E5` (Indigo)
Accent: `#2563EB` (Blue)
Dark: `#0F172A` to `#020617`

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (already configured)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/        # Navbar, Footer
│   ├── books/         # Book cards and display
│   └── pdf/           # PDF Reader component
├── pages/
│   ├── HomePage       # Landing page
│   ├── MarketplacePage # Browse books
│   ├── BookDetailPage  # Book details
│   ├── AuthPage        # Login/Signup
│   ├── UploadPage      # Sell books
│   ├── ChatPage        # Messaging
│   ├── ProfilePage     # User profile
│   ├── SellerDashboard # Seller analytics
│   └── AdminPage       # Admin panel
├── lib/              # Supabase client, utilities
├── store/            # Zustand auth store
└── types/            # TypeScript interfaces
```

## Demo Accounts

For testing, you can create accounts with different roles:
- **Buyer**: Regular signup
- **Seller**: Set `is_seller = true` in profile
- **Admin**: Set `is_admin = true` in profile (via Supabase dashboard)

## License

MIT
