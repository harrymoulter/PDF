-- FINAL DATABASE FIX FOR PDFMASTER AI
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR

-----------------------------------------------------------
-- 1. AD PLACEMENTS TABLE (Renamed from ads for clarity)
-----------------------------------------------------------
DROP TABLE IF EXISTS public.ad_placements CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE; -- Clean up old table name

CREATE TABLE public.ad_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('After Header', 'Before Footer', 'Inside Content', 'Sidebar Top', 'Sidebar Bottom', 'ALL')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Public can view active ads" ON public.ad_placements
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can view all ads" ON public.ad_placements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Manage policies
CREATE POLICY "Admins can insert ads" ON public.ad_placements
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update ads" ON public.ad_placements
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete ads" ON public.ad_placements
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-----------------------------------------------------------
-- 2. NAVIGATION TABLE FIX (Added link_type)
-----------------------------------------------------------
-- If navigation table exists, we add the column. If not, we create it.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'navigation') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'navigation' AND column_name = 'link_type') THEN
            ALTER TABLE public.navigation ADD COLUMN link_type TEXT DEFAULT 'Internal Page';
        END IF;
    ELSE
        CREATE TABLE public.navigation (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            label TEXT NOT NULL, -- Note: AdminNavigation uses 'name' in code, but original schema was 'label'. I'll sync with code.
            url TEXT NOT NULL,
            order_index INTEGER DEFAULT 0,
            menu_type TEXT NOT NULL, -- 'header', 'footer_1', 'footer_2', 'footer_3'
            link_type TEXT DEFAULT 'Internal Page',
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- Let's check if the code expects 'name' or 'label'
-- Looking at AdminNavigation.tsx: updateItem(item.id!, { name: e.target.value })
-- It uses 'name'. I'll rename the column if it's 'label'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'navigation' AND column_name = 'label') THEN
        ALTER TABLE public.navigation RENAME COLUMN label TO name;
    END IF;
END $$;

-- Ensure RLS is active for navigation
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;

-- Reset policies for navigation to be safe
DROP POLICY IF EXISTS "Public read for navigation" ON public.navigation;
DROP POLICY IF EXISTS "Admin full access for navigation" ON public.navigation;

CREATE POLICY "Public read for navigation" ON public.navigation 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access for navigation" ON public.navigation 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-----------------------------------------------------------
-- 3. FOOTER LINKS TABLE
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.footer_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    section TEXT NOT NULL, -- 'company', 'legal', 'quick'
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "Public read for footer_links" ON public.footer_links;
DROP POLICY IF EXISTS "Admin full access for footer_links" ON public.footer_links;

CREATE POLICY "Public read for footer_links" ON public.footer_links 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access for footer_links" ON public.footer_links 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-----------------------------------------------------------
-- 4. USER HISTORY TABLE
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    file_name TEXT,
    file_size TEXT,
    result_status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "Users can insert their own history" ON public.user_history;
DROP POLICY IF EXISTS "Users can see their own history" ON public.user_history;
DROP POLICY IF EXISTS "Admins can see all history" ON public.user_history;

CREATE POLICY "Users can insert their own history" ON public.user_history
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can see their own history" ON public.user_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all history" ON public.user_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-----------------------------------------------------------
-- 5. PAGES TABLE FIX (Add SEO fields)
-----------------------------------------------------------
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pages' AND column_name = 'meta_title') THEN
            ALTER TABLE public.pages ADD COLUMN meta_title TEXT;
            ALTER TABLE public.pages ADD COLUMN meta_description TEXT;
            ALTER TABLE public.pages ADD COLUMN keywords TEXT;
            ALTER TABLE public.pages ADD COLUMN is_system_page BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;

-----------------------------------------------------------
-- 6. REFRESH CACHE (PostgREST)
-----------------------------------------------------------
-- This helps refresh the schema cache
NOTIFY pgrst, 'reload schema';
