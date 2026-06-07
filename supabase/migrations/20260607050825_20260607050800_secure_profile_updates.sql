CREATE OR REPLACE FUNCTION public.protect_admin_columns()
RETURNS trigger AS $$
BEGIN
  -- If it's the service_role bypassing RLS, allow it
  IF current_user = 'postgres' OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Otherwise, it's a regular user update. Force the restricted columns to remain unchanged
  NEW.role = OLD.role;
  NEW.user_type = OLD.user_type;
  NEW.crm_notes = OLD.crm_notes;
  NEW.status = OLD.status;
  NEW.special_skills = OLD.special_skills;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_restricted_columns ON public.profiles;

CREATE TRIGGER ensure_restricted_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_columns();
