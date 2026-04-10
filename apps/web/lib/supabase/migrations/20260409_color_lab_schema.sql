CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS color_lab_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_profile TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  color JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS color_lab_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  caption TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_color_lab_recipes_updated_at
ON color_lab_recipes (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_color_lab_recipes_name_trgm
ON color_lab_recipes USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_color_lab_recipes_base_profile_trgm
ON color_lab_recipes USING gin (base_profile gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_color_lab_recipes_author_trgm
ON color_lab_recipes USING gin (author gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_color_lab_photos_updated_at
ON color_lab_photos (updated_at DESC);

ALTER TABLE color_lab_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_lab_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to color lab recipes"
ON color_lab_recipes FOR SELECT USING (true);

CREATE POLICY "Allow public read access to color lab photos"
ON color_lab_photos FOR SELECT USING (true);

CREATE POLICY "Allow all access to authenticated users for color lab recipes"
ON color_lab_recipes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to authenticated users for color lab photos"
ON color_lab_photos FOR ALL USING (auth.role() = 'authenticated');
