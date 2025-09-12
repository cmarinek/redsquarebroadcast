-- Create support tickets system
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE DEFAULT 'TK-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(EXTRACT(HOUR FROM NOW())::TEXT, 2, '0') || LPAD(EXTRACT(MINUTE FROM NOW())::TEXT, 2, '0'),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create support ticket messages for conversations
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support categories for organization
CREATE TABLE public.support_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default support categories
INSERT INTO public.support_categories (name, description, color, sort_order) VALUES
('Technical Issue', 'Problems with the platform or devices', '#EF4444', 1),
('Account & Billing', 'Account management and payment issues', '#3B82F6', 2),
('Screen Management', 'Issues with screen setup and configuration', '#10B981', 3),
('Content & Booking', 'Problems with uploads and scheduling', '#F59E0B', 4),
('Feature Request', 'Suggestions for new features', '#8B5CF6', 5),
('General Question', 'General inquiries and help', '#6B7280', 6);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets FOR SELECT 
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role IN ('admin', 'support')
));

CREATE POLICY "Users can create their own tickets" 
ON public.support_tickets FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets" 
ON public.support_tickets FOR UPDATE 
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role IN ('admin', 'support')
));

CREATE POLICY "Support staff can manage all tickets" 
ON public.support_tickets FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role IN ('admin', 'support')
));

-- RLS Policies for support_ticket_messages
CREATE POLICY "Users can view messages for their tickets" 
ON public.support_ticket_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM support_tickets 
  WHERE id = ticket_id AND (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'support'))
  )
) AND (NOT is_internal OR auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role IN ('admin', 'support')
)));

CREATE POLICY "Users can create messages for their tickets" 
ON public.support_ticket_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM support_tickets 
  WHERE id = ticket_id AND (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'support'))
  )
));

-- RLS Policies for support_categories
CREATE POLICY "Anyone can view active support categories" 
ON public.support_categories FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage support categories" 
ON public.support_categories FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

-- Create updated_at trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-assign tickets based on category
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign to available support staff based on workload
  IF NEW.assigned_to IS NULL THEN
    SELECT ur.user_id INTO NEW.assigned_to
    FROM user_roles ur
    LEFT JOIN support_tickets st ON st.assigned_to = ur.user_id AND st.status IN ('open', 'in_progress')
    WHERE ur.role IN ('support', 'admin')
    GROUP BY ur.user_id
    ORDER BY COUNT(st.id), RANDOM()
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment
CREATE TRIGGER auto_assign_support_ticket
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_ticket();