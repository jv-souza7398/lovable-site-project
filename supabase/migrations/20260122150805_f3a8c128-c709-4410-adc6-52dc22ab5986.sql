-- Create enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('manager', 'planner', 'viewer');

-- Create admin_users table (separate from public users)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_admin_id uuid)
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_users WHERE id = _admin_id
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_admin_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = _admin_id
  )
$$;

-- Create security definer function to verify admin credentials (for login)
CREATE OR REPLACE FUNCTION public.verify_admin_login(_email text, _senha_hash text)
RETURNS TABLE(id uuid, nome_completo text, email text, role admin_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.nome_completo, au.email, au.role 
  FROM public.admin_users au 
  WHERE au.email = _email AND au.senha_hash = _senha_hash
$$;

-- RLS Policies for admin_users
-- Only managers can view all admin users
CREATE POLICY "Managers can view all admin users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.id = auth.uid() AND au.role = 'manager'
  )
);

-- Only managers can insert new admin users
CREATE POLICY "Managers can insert admin users"
ON public.admin_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.id = auth.uid() AND au.role = 'manager'
  )
);

-- Only managers can update admin users
CREATE POLICY "Managers can update admin users"
ON public.admin_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.id = auth.uid() AND au.role = 'manager'
  )
);

-- Only managers can delete admin users
CREATE POLICY "Managers can delete admin users"
ON public.admin_users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.id = auth.uid() AND au.role = 'manager'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default manager user (password: Admin@123 - you should change this)
-- Using a simple hash for demo purposes - in production use proper bcrypt
INSERT INTO public.admin_users (nome_completo, cpf, email, senha_hash, role)
VALUES ('Administrador', '00000000000', 'admin@vincci.com', 'e6c3da5b206634d7f3f3586d747ffdb36b5c675757b380c6a5fe5c570c714349', 'manager');