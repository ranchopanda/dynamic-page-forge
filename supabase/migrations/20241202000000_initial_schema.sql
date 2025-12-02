-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ARTIST', 'ADMIN')),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artist profiles
CREATE TABLE IF NOT EXISTS public.artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  specialties JSONB DEFAULT '[]',
  experience INT DEFAULT 0,
  portfolio JSONB DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Henna styles
CREATE TABLE IF NOT EXISTS public.henna_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt_modifier TEXT NOT NULL,
  category TEXT NOT NULL,
  complexity TEXT DEFAULT 'Medium' CHECK (complexity IN ('Simple', 'Medium', 'Complex', 'Intricate')),
  coverage TEXT DEFAULT 'Full' CHECK (coverage IN ('Minimal', 'Partial', 'Full', 'Extended')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designs
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  style_id UUID REFERENCES public.henna_styles(id),
  hand_image_url TEXT NOT NULL,
  generated_image_url TEXT NOT NULL,
  outfit_context TEXT,
  hand_analysis JSONB,
  is_public BOOLEAN DEFAULT false,
  likes INT DEFAULT 0,
  review_status TEXT DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  can_be_template BOOLEAN DEFAULT false,
  user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  feedback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artist_profiles(id),
  design_id UUID UNIQUE REFERENCES public.designs(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('VIRTUAL', 'IN_PERSON', 'ON_SITE')),
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  event_date DATE,
  message TEXT,
  confirmation_code TEXT UNIQUE NOT NULL,
  total_price DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artist_id)
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT DEFAULT 'General',
  tags JSONB DEFAULT '[]',
  author TEXT DEFAULT 'Himanshi',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (singleton)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'settings',
  site_name TEXT DEFAULT 'Mehendi',
  tagline TEXT DEFAULT 'AI-Powered Custom Mehendi Design Generator',
  owner_name TEXT DEFAULT 'Himanshi',
  email TEXT DEFAULT 'himanshiparashar44@gmail.com',
  phone TEXT DEFAULT '+91 7011489500',
  whatsapp TEXT DEFAULT '+91 7011489500',
  address TEXT DEFAULT 'Greater Noida, Uttar Pradesh',
  price_per_hand INT DEFAULT 100,
  available_days TEXT DEFAULT 'Sunday, Monday',
  instagram TEXT,
  facebook TEXT,
  pinterest TEXT,
  twitter TEXT,
  about_text TEXT,
  seo_keywords TEXT DEFAULT 'mehendi design, henna artist Greater Noida, bridal mehendi, AI mehendi generator',
  google_analytics TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.site_settings (id) VALUES ('settings') ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.henna_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;


-- RLS Policies

-- Profiles: Users can read all, update own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Artist profiles: Public read, artists can update own
DROP POLICY IF EXISTS "Artist profiles are viewable by everyone" ON public.artist_profiles;
CREATE POLICY "Artist profiles are viewable by everyone" ON public.artist_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Artists can update own profile" ON public.artist_profiles;
CREATE POLICY "Artists can update own profile" ON public.artist_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Henna styles: Public read, admin write
DROP POLICY IF EXISTS "Styles are viewable by everyone" ON public.henna_styles;
CREATE POLICY "Styles are viewable by everyone" ON public.henna_styles FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage styles" ON public.henna_styles;
CREATE POLICY "Admins can manage styles" ON public.henna_styles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Designs: Public read for public designs, users manage own
DROP POLICY IF EXISTS "Public designs are viewable" ON public.designs;
CREATE POLICY "Public designs are viewable" ON public.designs FOR SELECT USING (is_public = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own designs" ON public.designs;
CREATE POLICY "Users can create own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own designs" ON public.designs;
CREATE POLICY "Users can update own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own designs" ON public.designs;
CREATE POLICY "Users can delete own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);

-- Bookings: Users manage own
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Public read, users manage own
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Newsletter: Admin only + anyone can subscribe
DROP POLICY IF EXISTS "Admins can manage newsletter" ON public.newsletter;
CREATE POLICY "Admins can manage newsletter" ON public.newsletter FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter;
CREATE POLICY "Anyone can subscribe" ON public.newsletter FOR INSERT WITH CHECK (true);

-- Blog posts: Public read published, admin write
DROP POLICY IF EXISTS "Published posts are viewable" ON public.blog_posts;
CREATE POLICY "Published posts are viewable" ON public.blog_posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Site settings: Public read, admin write
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_style_id ON public.designs(style_id);
CREATE INDEX IF NOT EXISTS idx_designs_is_public ON public.designs(is_public);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON public.blog_posts(is_published);


-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON public.artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON public.artist_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_henna_styles_updated_at ON public.henna_styles;
CREATE TRIGGER update_henna_styles_updated_at BEFORE UPDATE ON public.henna_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_designs_updated_at ON public.designs;
CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('styles', 'styles', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view design images" ON storage.objects;
CREATE POLICY "Anyone can view design images" ON storage.objects FOR SELECT USING (bucket_id IN ('designs', 'styles', 'avatars'));

DROP POLICY IF EXISTS "Authenticated users can upload designs" ON storage.objects;
CREATE POLICY "Authenticated users can upload designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
