-- Improve search performance for global navigation search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_wiki_products_name_trgm
ON wiki_products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_products_slug_trgm
ON wiki_products USING gin (slug gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_products_short_description_trgm
ON wiki_products USING gin (short_description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_products_description_trgm
ON wiki_products USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_products_published_updated_at
ON wiki_products (is_published, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_wiki_categories_name_trgm
ON wiki_categories USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug_trgm
ON wiki_categories USING gin (slug gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_wiki_categories_description_trgm
ON wiki_categories USING gin (description gin_trgm_ops);
