CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
 BEGIN
   INSERT INTO public.profiles (id, username, user_type, role)
   VALUES (
     NEW.id,
     SPLIT_PART(NEW.email, '@', 1),
     CASE
       WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
       ELSE 'user'
     END,
     CASE
       WHEN NEW.email IN ('contact@jointjourney.app', 'tamerlanium@gmail.com', 'Fuad.aliyevcap@gmail.com') THEN 'admin'::user_role
       ELSE 'user'::user_role
     END
   );
   RETURN NEW;
 END;
 $function$;
