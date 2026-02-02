-- Create admin_audit_logs table for tracking sensitive operations
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  performed_by text,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit logs (only readable via service_role/edge functions)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- No SELECT policy = no one can read directly from client
-- Audit logs are only accessible via Edge Functions with service_role

-- Create trigger function for admin_users audit logging
CREATE OR REPLACE FUNCTION public.audit_admin_users_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_record jsonb;
  new_record jsonb;
BEGIN
  -- Remove senha_hash from logged data for security
  IF TG_OP = 'DELETE' THEN
    old_record := to_jsonb(OLD);
    old_record := old_record - 'senha_hash';
    
    INSERT INTO public.admin_audit_logs (
      table_name,
      operation,
      record_id,
      old_data,
      new_data,
      performed_by
    ) VALUES (
      'admin_users',
      'DELETE',
      OLD.id,
      old_record,
      NULL,
      current_user
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_record := to_jsonb(OLD);
    old_record := old_record - 'senha_hash';
    new_record := to_jsonb(NEW);
    new_record := new_record - 'senha_hash';
    
    INSERT INTO public.admin_audit_logs (
      table_name,
      operation,
      record_id,
      old_data,
      new_data,
      performed_by
    ) VALUES (
      'admin_users',
      'UPDATE',
      NEW.id,
      old_record,
      new_record,
      current_user
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_record := to_jsonb(NEW);
    new_record := new_record - 'senha_hash';
    
    INSERT INTO public.admin_audit_logs (
      table_name,
      operation,
      record_id,
      old_data,
      new_data,
      performed_by
    ) VALUES (
      'admin_users',
      'INSERT',
      NEW.id,
      NULL,
      new_record,
      current_user
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger to admin_users table
CREATE TRIGGER audit_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_users_changes();

-- Add comment explaining the security architecture
COMMENT ON TABLE public.admin_audit_logs IS 'Audit trail for admin_users table changes. Protected by RLS with no policies = only accessible via service_role.';