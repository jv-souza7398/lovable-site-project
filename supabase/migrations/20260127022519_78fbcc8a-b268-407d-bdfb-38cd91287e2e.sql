-- Drop existing recursive policies
DROP POLICY IF EXISTS "Managers can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Managers can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Managers can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Managers can delete admin users" ON public.admin_users;

-- Create a helper function to check if user is a manager (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = _user_id AND role = 'manager'
  )
$$;

-- Create new non-recursive RLS policies using the security definer function
CREATE POLICY "Managers can view all admin users"
ON public.admin_users
FOR SELECT
USING (public.is_manager(auth.uid()));

CREATE POLICY "Managers can insert admin users"
ON public.admin_users
FOR INSERT
WITH CHECK (public.is_manager(auth.uid()));

CREATE POLICY "Managers can update admin users"
ON public.admin_users
FOR UPDATE
USING (public.is_manager(auth.uid()));

CREATE POLICY "Managers can delete admin users"
ON public.admin_users
FOR DELETE
USING (public.is_manager(auth.uid()));