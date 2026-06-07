DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' 
      AND (qual ILIKE '%EXISTS ( SELECT 1%FROM profiles%' OR with_check ILIKE '%EXISTS ( SELECT 1%FROM profiles%')
  LOOP
    IF pol.qual IS NOT NULL AND pol.qual ILIKE '%EXISTS ( SELECT 1%FROM profiles%' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I USING (public.is_admin(auth.uid()))', pol.policyname, pol.schemaname, pol.tablename);
    END IF;
    
    IF pol.with_check IS NOT NULL AND pol.with_check ILIKE '%EXISTS ( SELECT 1%FROM profiles%' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (public.is_admin(auth.uid()))', pol.policyname, pol.schemaname, pol.tablename);
    END IF;
  END LOOP;
END
$$;
