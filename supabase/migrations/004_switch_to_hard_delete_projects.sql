-- Remove is_active column from projects table since we're switching to hard deletes
-- The CASCADE foreign keys will handle cleanup automatically

-- Remove any existing RLS policies that might filter by is_active
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Remove the is_active column
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_active;

-- Recreate RLS policies without is_active filtering
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());