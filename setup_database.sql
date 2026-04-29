-- SQL SETUP FOR PDFMASTER AI ADMIN DASHBOARD
-- Run this script in your Supabase SQL Editor

-- 1. EXTEND PROFILES TABLE (If not already extended)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. CREATE ADS TABLE
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE CUSTOM CODES TABLE
CREATE TABLE IF NOT EXISTS public.custom_codes (
    id TEXT PRIMARY KEY, -- 'header', 'body', 'footer'
    content TEXT,
    is_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    is_system_page BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CREATE NAVIGATION TABLE
CREATE TABLE IF NOT EXISTS public.navigation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    menu_type TEXT NOT NULL, -- 'header', 'footer_1', 'footer_2', 'footer_3'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CREATE FOOTER LINKS TABLE
CREATE TABLE IF NOT EXISTS public.footer_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    section TEXT NOT NULL, -- 'company', 'legal', 'quick'
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CREATE USER HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    file_name TEXT,
    file_size TEXT,
    result_status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- 8. SECURITY POLICIES

-- Public Read Access
CREATE POLICY "Public read for ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Public read for codes" ON public.custom_codes FOR SELECT USING (is_enabled = true);
CREATE POLICY "Public read for pages" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read for navigation" ON public.navigation FOR SELECT USING (true);
CREATE POLICY "Public read for footer_links" ON public.footer_links FOR SELECT USING (true);

-- User History Policies
CREATE POLICY "Users can insert their own history" ON public.user_history
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can see their own history" ON public.user_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all history" ON public.user_history
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin Full Access (using subquery to check role in profiles)
CREATE POLICY "Admin full access for ads" ON public.ads 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access for codes" ON public.custom_codes 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access for pages" ON public.pages 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access for navigation" ON public.navigation 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access for footer_links" ON public.footer_links 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. INITIAL DATA
INSERT INTO public.custom_codes (id, content, is_enabled) VALUES 
('header', '', false),
('body', '', false),
('footer', '', false)
ON CONFLICT (id) DO NOTHING;

-- 9. SET INITIAL ADMIN (Optional - replace with your user ID or run manually)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
