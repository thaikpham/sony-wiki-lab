ALTER TABLE color_lab_recipes
ADD COLUMN IF NOT EXISTS camera_lines TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compatibility_notes TEXT DEFAULT '';

UPDATE color_lab_recipes
SET camera_lines = '{}'
WHERE camera_lines IS NULL;

UPDATE color_lab_recipes
SET compatibility_notes = ''
WHERE compatibility_notes IS NULL;

ALTER TABLE color_lab_recipes
ALTER COLUMN camera_lines SET DEFAULT '{}',
ALTER COLUMN camera_lines SET NOT NULL,
ALTER COLUMN compatibility_notes SET DEFAULT '',
ALTER COLUMN compatibility_notes SET NOT NULL;

ALTER TABLE color_lab_photos
ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES color_lab_recipes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

UPDATE color_lab_photos
SET sort_order = 0
WHERE sort_order IS NULL;

ALTER TABLE color_lab_photos
ALTER COLUMN src DROP NOT NULL,
ALTER COLUMN sort_order SET DEFAULT 0,
ALTER COLUMN sort_order SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM color_lab_photos
    WHERE recipe_id IS NULL OR storage_path IS NULL
  ) THEN
    ALTER TABLE color_lab_photos
    ALTER COLUMN recipe_id SET NOT NULL,
    ALTER COLUMN storage_path SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_color_lab_photos_recipe_id
ON color_lab_photos (recipe_id);

CREATE INDEX IF NOT EXISTS idx_color_lab_photos_recipe_sort_order
ON color_lab_photos (recipe_id, sort_order ASC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('color-lab-preview', 'color-lab-preview', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read access to color lab preview bucket"
ON storage.objects;

CREATE POLICY "Allow public read access to color lab preview bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'color-lab-preview');
