-- Add 'ativo' column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Create index for faster queries on active users
CREATE INDEX IF NOT EXISTS idx_admin_users_ativo ON public.admin_users(ativo);

-- Update the verify_admin_login function to check if user is active
CREATE OR REPLACE FUNCTION public.verify_admin_login(_email text, _senha_hash text)
RETURNS TABLE(id uuid, nome_completo text, email text, role admin_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.nome_completo, au.email, au.role 
  FROM public.admin_users au 
  WHERE au.email = _email 
    AND au.senha_hash = _senha_hash
    AND au.ativo = true
$$;