-- Create screen groups for multi-location management
CREATE TABLE public.screen_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, group_name)
);

-- Enable RLS
ALTER TABLE public.screen_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for screen groups
CREATE POLICY "Screen owners can manage their groups"
ON public.screen_groups
FOR ALL
USING (auth.uid() = owner_id);

-- Add group_id to screens table
ALTER TABLE public.screens 
ADD COLUMN group_id UUID REFERENCES public.screen_groups(id) ON DELETE SET NULL;

-- Create content moderation table
CREATE TABLE public.content_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content_uploads(id) ON DELETE CASCADE,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderated_by UUID REFERENCES auth.users(id),
  moderation_reason TEXT,
  automated_flags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Create policies for content moderation
CREATE POLICY "Screen owners can moderate content for their screens"
ON public.content_moderation
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.screens 
    WHERE screens.id = content_moderation.screen_id 
    AND screens.owner_id = auth.uid()
  )
);

-- Create payout requests table
CREATE TABLE public.payout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  stripe_payout_id TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  earnings_period_start DATE NOT NULL,
  earnings_period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for payout requests
CREATE POLICY "Screen owners can view their payout requests"
ON public.payout_requests
FOR SELECT
USING (auth.uid() = screen_owner_id);

CREATE POLICY "Screen owners can create payout requests"
ON public.payout_requests
FOR INSERT
WITH CHECK (auth.uid() = screen_owner_id);

CREATE POLICY "Service role can manage payouts"
ON public.payout_requests
FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_screen_groups_updated_at
BEFORE UPDATE ON public.screen_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_moderation_updated_at
BEFORE UPDATE ON public.content_moderation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();