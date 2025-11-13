-- Screen Ratings and Reviews System
-- Created: 2025-11-13
-- Purpose: Add comprehensive ratings and reviews for screens

-- Create screen_ratings table
CREATE TABLE IF NOT EXISTS public.screen_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_images JSONB DEFAULT '[]'::jsonb,
  is_verified_booking BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  owner_response TEXT,
  owner_response_at TIMESTAMPTZ,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'flagged', 'removed')),
  flagged_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one rating per user per screen
  UNIQUE(screen_id, user_id)
);

-- Create index for performance
CREATE INDEX idx_screen_ratings_screen_id ON public.screen_ratings(screen_id);
CREATE INDEX idx_screen_ratings_user_id ON public.screen_ratings(user_id);
CREATE INDEX idx_screen_ratings_status ON public.screen_ratings(status);
CREATE INDEX idx_screen_ratings_created_at ON public.screen_ratings(created_at DESC);

-- Create rating_helpfulness tracking table
CREATE TABLE IF NOT EXISTS public.rating_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.screen_ratings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One vote per user per rating
  UNIQUE(rating_id, user_id)
);

CREATE INDEX idx_rating_helpfulness_rating_id ON public.rating_helpfulness(rating_id);

-- Add computed columns to screens table for ratings
ALTER TABLE public.screens
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb;

-- Function to update screen rating statistics
CREATE OR REPLACE FUNCTION public.update_screen_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate and update average rating and counts
  UPDATE public.screens
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM public.screen_ratings
      WHERE screen_id = COALESCE(NEW.screen_id, OLD.screen_id)
        AND status = 'published'
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.screen_ratings
      WHERE screen_id = COALESCE(NEW.screen_id, OLD.screen_id)
        AND status = 'published'
    ),
    rating_distribution = (
      SELECT jsonb_object_agg(rating_value, rating_count)
      FROM (
        SELECT
          rating::text AS rating_value,
          COUNT(*)::integer AS rating_count
        FROM public.screen_ratings
        WHERE screen_id = COALESCE(NEW.screen_id, OLD.screen_id)
          AND status = 'published'
        GROUP BY rating
      ) AS distribution
    )
  WHERE id = COALESCE(NEW.screen_id, OLD.screen_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when ratings change
DROP TRIGGER IF EXISTS trigger_update_screen_rating_stats ON public.screen_ratings;
CREATE TRIGGER trigger_update_screen_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON public.screen_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_screen_rating_stats();

-- Function to update helpful counts
CREATE OR REPLACE FUNCTION public.update_rating_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.screen_ratings
  SET
    helpful_count = (
      SELECT COUNT(*)
      FROM public.rating_helpfulness
      WHERE rating_id = COALESCE(NEW.rating_id, OLD.rating_id)
        AND is_helpful = TRUE
    ),
    not_helpful_count = (
      SELECT COUNT(*)
      FROM public.rating_helpfulness
      WHERE rating_id = COALESCE(NEW.rating_id, OLD.rating_id)
        AND is_helpful = FALSE
    )
  WHERE id = COALESCE(NEW.rating_id, OLD.rating_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for helpful counts
DROP TRIGGER IF EXISTS trigger_update_rating_helpful_count ON public.rating_helpfulness;
CREATE TRIGGER trigger_update_rating_helpful_count
AFTER INSERT OR UPDATE OR DELETE ON public.rating_helpfulness
FOR EACH ROW
EXECUTE FUNCTION public.update_rating_helpful_count();

-- RLS Policies for screen_ratings
ALTER TABLE public.screen_ratings ENABLE ROW LEVEL SECURITY;

-- Users can read published ratings
CREATE POLICY "Users can read published ratings"
ON public.screen_ratings FOR SELECT
TO authenticated
USING (status = 'published');

-- Users can create ratings for screens they've booked
CREATE POLICY "Users can create ratings for their bookings"
ON public.screen_ratings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = screen_ratings.booking_id
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
  )
);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.screen_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Screen owners can add responses to ratings on their screens
CREATE POLICY "Screen owners can respond to ratings"
ON public.screen_ratings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.screens
    WHERE screens.id = screen_ratings.screen_id
      AND screens.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.screens
    WHERE screens.id = screen_ratings.screen_id
      AND screens.owner_user_id = auth.uid()
  )
);

-- Admins can see and moderate all ratings
CREATE POLICY "Admins can manage all ratings"
ON public.screen_ratings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- RLS Policies for rating_helpfulness
ALTER TABLE public.rating_helpfulness ENABLE ROW LEVEL SECURITY;

-- Users can read all helpfulness votes
CREATE POLICY "Users can read helpfulness votes"
ON public.rating_helpfulness FOR SELECT
TO authenticated
USING (true);

-- Users can submit their own helpfulness votes
CREATE POLICY "Users can submit helpfulness votes"
ON public.rating_helpfulness FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own helpfulness votes
CREATE POLICY "Users can update their helpfulness votes"
ON public.rating_helpfulness FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own helpfulness votes
CREATE POLICY "Users can delete their helpfulness votes"
ON public.rating_helpfulness FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Updated_at trigger for screen_ratings
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.screen_ratings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.screen_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.screen_ratings IS 'User ratings and reviews for screens';
COMMENT ON TABLE public.rating_helpfulness IS 'Tracks which users found ratings helpful';
COMMENT ON COLUMN public.screens.average_rating IS 'Computed average rating from all published reviews';
COMMENT ON COLUMN public.screens.total_ratings IS 'Total count of published ratings';
COMMENT ON COLUMN public.screens.rating_distribution IS 'Distribution of ratings (1-5 stars)';
