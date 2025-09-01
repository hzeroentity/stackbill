-- Add AI & Machine Learning to existing category constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_category_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_category_check CHECK (category IN (
    'Cloud & Hosting',
    'Analytics & Tracking',
    'AI & Machine Learning', 
    'Database & Storage',
    'Developer Tools',
    'Communication',
    'Design & Creative',
    'Marketing & SEO',
    'Security',
    'Entertainment',
    'Productivity',
    'Other'
));

-- Remove the old project_id column from subscriptions table (this will break existing one-to-many relationship)
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS project_id;

-- Create junction table for many-to-many relationship between subscriptions and projects
CREATE TABLE IF NOT EXISTS public.subscription_projects (
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (subscription_id, project_id)
);

-- Create indexes for better performance (only new ones)
CREATE INDEX IF NOT EXISTS idx_subscription_projects_subscription_id ON public.subscription_projects(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_projects_project_id ON public.subscription_projects(project_id);

-- Enable RLS on subscription_projects table
ALTER TABLE public.subscription_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_projects table
CREATE POLICY "Users can view their own subscription-project relationships" ON public.subscription_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = subscription_projects.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subscription-project relationships" ON public.subscription_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = subscription_projects.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own subscription-project relationships" ON public.subscription_projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = subscription_projects.subscription_id 
      AND s.user_id = auth.uid()
    )
  );