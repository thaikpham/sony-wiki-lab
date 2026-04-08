-- 1. Table for Categories (Cameras, Lenses, etc.)
CREATE TABLE IF NOT EXISTS wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table for Wiki Products
CREATE TABLE IF NOT EXISTS wiki_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES wiki_categories(id) ON DELETE SET NULL,
  description TEXT, -- Detailed Markdown content
  short_description TEXT,
  main_image TEXT, -- URL from Supabase Storage
  gallery TEXT[] DEFAULT '{}', -- Array of image URLs
  specs JSONB DEFAULT '{}'::jsonb, -- Technical specifications (Key-Value)
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES auth.users(id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wiki_products_category ON wiki_products(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_products_slug ON wiki_products(slug);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_products ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies
-- Everyone can view published products and categories
CREATE POLICY "Allow public read-only access to categories" 
ON wiki_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access to published products" 
ON wiki_products FOR SELECT USING (is_published = true);

-- Only authenticated users (admins) can modify data
-- Note: Replace with specific logic if needed (e.g., role-based)
CREATE POLICY "Allow all access to authenticated users" 
ON wiki_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to authenticated users" 
ON wiki_products FOR ALL USING (auth.role() = 'authenticated');
