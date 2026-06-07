-- Create an enum type for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new CRM metadata columns to the public.profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS crm_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Lead',
ADD COLUMN IF NOT EXISTS special_skills TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Set existing admins based on known emails (Migration of hardcoded admins to database)
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id AND u.email IN (
  'contact@jointjourney.app',
  'tamerlanium@gmail.com',
  'Fuad.aliyevcap@gmail.com'
);

-- Note: User metadata will be migrated via a separate data migration script.
