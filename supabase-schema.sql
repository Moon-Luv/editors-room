-- SUPABASE SCHEMA FOR EDITORS ROOM AGENCY

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Type for Booking Status
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
       CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
   END IF;
END
$$;

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_id TEXT, -- e.g., '01', '02'
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    year TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT NOT NULL,
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT,
    content TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Target',
    color_class TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STATS
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT DEFAULT '+',
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TIME SLOTS
CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_time TIME NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE, -- admin can deactivate instead of deleting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  message TEXT,
  booking_date DATE NOT NULL,
  slot_id UUID REFERENCES time_slots(id),
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_booking UNIQUE (booking_date, slot_id)  -- Prevent double-booking
);

-- 9. NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TRUSTED COMPANIES
CREATE TABLE IF NOT EXISTS trusted_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ABOUT SECTION
CREATE TABLE IF NOT EXISTS about (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    projects_completed INTEGER DEFAULT 0,
    happy_clients INTEGER DEFAULT 0,
    countries_served INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Projects: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read access on projects" ON projects;
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access on projects" ON projects;
CREATE POLICY "Allow admin write access on projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Team Members: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read access on team_members" ON team_members;
CREATE POLICY "Allow public read access on team_members" ON team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access on team_members" ON team_members;
CREATE POLICY "Allow admin write access on team_members" ON team_members FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read access on testimonials" ON testimonials;
CREATE POLICY "Allow public read access on testimonials" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access on testimonials" ON testimonials;
CREATE POLICY "Allow admin write access on testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Services: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read access on services" ON services;
CREATE POLICY "Allow public read access on services" ON services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access on services" ON services;
CREATE POLICY "Allow admin write access on services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Contact Submissions: Public Insert, Admin Read
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin read on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow admin read on contact_submissions" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');

-- Stats: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read on stats" ON stats;
CREATE POLICY "Allow public read on stats" ON stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write on stats" ON stats;
CREATE POLICY "Allow admin write on stats" ON stats FOR ALL USING (auth.role() = 'authenticated');

-- Time Slots: Public Read Active, Admin Manage
DROP POLICY IF EXISTS "Admin manage time slots" ON time_slots;
CREATE POLICY "Admin manage time slots" ON time_slots FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public read active slots" ON time_slots;
CREATE POLICY "Public read active slots" ON time_slots FOR SELECT USING (is_active = TRUE);

-- Bookings: Public Insert, Admin All
DROP POLICY IF EXISTS "Allow public insert on bookings" ON bookings;
CREATE POLICY "Allow public insert on bookings" 
ON bookings FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin all on bookings" ON bookings;
CREATE POLICY "Allow admin all on bookings"
ON bookings FOR ALL
USING (auth.role() = 'authenticated');

-- Optional: Users can see their own bookings (by email)
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (email = auth.jwt() ->> 'email');

-- Newsletter: Public Insert, Admin Read
DROP POLICY IF EXISTS "Allow public insert on newsletter_subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow public insert on newsletter_subscriptions" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin read on newsletter_subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow admin read on newsletter_subscriptions" ON newsletter_subscriptions FOR SELECT USING (auth.role() = 'authenticated');

-- Trusted Companies: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read on trusted_companies" ON trusted_companies;
CREATE POLICY "Allow public read on trusted_companies" ON trusted_companies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write on trusted_companies" ON trusted_companies;
CREATE POLICY "Allow admin write on trusted_companies" ON trusted_companies FOR ALL USING (auth.role() = 'authenticated');

-- About: Public Read, Admin Write
DROP POLICY IF EXISTS "Allow public read access on about" ON about;
CREATE POLICY "Allow public read access on about" ON about FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access on about" ON about;
CREATE POLICY "Allow admin write access on about" ON about FOR ALL USING (auth.role() = 'authenticated');

-- INDEXES FOR OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(booking_date, slot_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_team_sort ON team_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);

-- STORAGE BUCKETS SETUP
-- Note: These require the 'storage' extension to be enabled (default in Supabase)

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('projects', 'projects', true),
  ('team', 'team', true),
  ('testimonials', 'testimonials', true),
  ('blog', 'blog', true),
  ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES (Allow public read, admin write)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('projects', 'team', 'testimonials', 'blog', 'uploads') );
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id IN ('projects', 'team', 'testimonials', 'blog', 'uploads') AND auth.role() = 'authenticated' );
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING ( bucket_id IN ('projects', 'team', 'testimonials', 'blog', 'uploads') AND auth.role() = 'authenticated' );
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING ( bucket_id IN ('projects', 'team', 'testimonials', 'blog', 'uploads') AND auth.role() = 'authenticated' );
