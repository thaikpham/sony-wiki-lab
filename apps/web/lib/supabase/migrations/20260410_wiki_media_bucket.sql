INSERT INTO storage.buckets (id, name, public)
VALUES ('wiki-media', 'wiki-media', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;
