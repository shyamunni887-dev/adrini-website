-- ==============================================================================
-- ADRINI Migration: Create product_reviews Table & Secure Public View
-- Description: Stores customer product reviews with cross-device persistence
--              and strict column-level email privacy protection.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author TEXT NOT NULL,
    email TEXT, -- Private verification email, never returned publicly
    photo TEXT, -- Compressed base64 or media URL
    variant TEXT, -- Product variant title (e.g. 'Cream & Gold / Free Size')
    verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying by Shopify product ID
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id 
    ON public.product_reviews (product_id);

-- Index for ordering by recency
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at 
    ON public.product_reviews (created_at DESC);

-- Composite index for filtering reviews by product and rating/date
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_created 
    ON public.product_reviews (product_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Service Role Policy (Full Access for Netlify Backend Functions)
CREATE POLICY "Service role has full access to product_reviews"
    ON public.product_reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Database-level Email Privacy Protection
-- Revoke direct table select from anon and authenticated to completely prevent email access
REVOKE ALL ON public.product_reviews FROM anon, authenticated;

-- Grant selective column read access to non-sensitive columns only
GRANT SELECT (id, product_id, rating, title, body, author, photo, variant, verified, created_at)
    ON public.product_reviews TO anon, authenticated;

CREATE POLICY "Public can read non-sensitive review columns"
    ON public.product_reviews
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 3. Dedicated Public View (Clean Schema for Anonymous Direct Access)
CREATE OR REPLACE VIEW public.public_product_reviews AS
    SELECT
        id,
        product_id,
        rating,
        title,
        body,
        author,
        photo,
        variant,
        verified,
        created_at
    FROM public.product_reviews;

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;
