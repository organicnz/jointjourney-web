CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT (role = 'admin' OR user_type = 'admin') INTO is_admin FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "profiles: admins can read all rows" ON public.profiles;

CREATE POLICY "profiles: admins can read all rows" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));
