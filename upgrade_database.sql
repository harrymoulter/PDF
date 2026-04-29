-- Migration to upgrade Ads and Navigation tables
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Banner',
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'After Header',
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Ensure naming consistency if migrating from an older version
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='is_active') THEN
    ALTER TABLE public.ads RENAME COLUMN is_active TO active;
  END IF;
END $$;

-- Update existing records if any
UPDATE public.ads SET name = title WHERE name IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='title');

-- Navigation table is mostly already compatible, but we can ensure clear naming
ALTER TABLE public.navigation 
RENAME COLUMN label TO name;

ALTER TABLE public.navigation 
ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'Internal Page';
