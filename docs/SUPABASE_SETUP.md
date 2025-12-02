# Supabase Backend Setup Guide

This project has been configured to use Supabase as the backend. Follow these steps to complete the setup.

## 1. Run the Database Migration

Go to your Supabase SQL Editor and run the migration:

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/kowuwhlwetplermbdvbh/sql)
2. Copy the contents of `supabase/migrations/20241202000000_initial_schema.sql`
3. Paste and click "Run"

This will create all the necessary tables, RLS policies, triggers, and storage buckets.

## 2. Seed the Database (Optional)

After running the migration, you can seed the database with sample data:

1. In the SQL Editor, copy the contents of `supabase/seed.sql`
2. Paste and click "Run"

This adds sample henna styles, blog posts, and default settings.

## 3. Environment Variables

The following environment variables are already configured in `.env.local`:

```env
VITE_SUPABASE_URL=https://kowuwhlwetplermbdvbh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Switch to Supabase Auth

To use Supabase authentication instead of the Express backend:

### Option A: Full Migration (Recommended)

Replace the AuthContext import in your components:

```tsx
// Before
import { AuthProvider, useAuth } from './context/AuthContext';

// After
import { SupabaseAuthProvider as AuthProvider, useAuth } from './context/SupabaseAuthContext';
```

### Option B: Gradual Migration

You can use both backends during migration by importing from the appropriate context.

## 5. API Client Usage

The new Supabase API client is available at `src/lib/supabaseApi.ts`:

```tsx
import { supabaseApi } from './lib/supabaseApi';

// Auth
await supabaseApi.login({ email, password });
await supabaseApi.register({ email, password, name });
await supabaseApi.logout();

// Designs
const designs = await supabaseApi.getMyDesigns();
await supabaseApi.createDesign({ handImageUrl, generatedImageUrl, styleId });

// Styles
const styles = await supabaseApi.getStyles();

// Bookings
const bookings = await supabaseApi.getMyBookings();
await supabaseApi.createBooking({ consultationType, scheduledDate, scheduledTime });

// File uploads
const imageUrl = await supabaseApi.uploadImage(file, 'designs');
```

## 6. Storage Buckets

Three storage buckets are created:
- `designs` - For user-uploaded hand images and generated designs
- `styles` - For henna style reference images
- `avatars` - For user profile pictures

## 7. Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Public data (styles, published blogs) is readable by everyone
- Admin-only operations are protected

## Database Schema

### Tables Created:
- `profiles` - User profiles (linked to Supabase auth)
- `artist_profiles` - Artist-specific information
- `henna_styles` - Available henna design styles
- `designs` - User-generated designs
- `bookings` - Consultation bookings
- `reviews` - Artist reviews
- `newsletter` - Newsletter subscriptions
- `blog_posts` - Blog content
- `site_settings` - Site configuration

## Free Tier Considerations

Since you're on the free tier:
- Database: 500MB storage limit
- Storage: 1GB file storage
- Auth: 50,000 monthly active users
- Edge Functions: 500,000 invocations/month

Tips to stay within limits:
- Compress images before upload
- Clean up unused designs periodically
- Use pagination for large queries
