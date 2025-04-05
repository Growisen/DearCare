-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Create a function that will be executed by the trigger
CREATE OR REPLACE FUNCTION create_nurse_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  uid uuid := gen_random_uuid();
  default_instance_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  -- Insert a row into auth.users table with all required fields
  INSERT INTO auth.users (
    id,                     -- UUID primary key
    instance_id,            -- Required for Supabase
    email,                  -- Email from the nurse record
    encrypted_password,     -- Encrypted password
    email_confirmed_at,     -- Mark email as confirmed
    aud,                    -- Audience (required)
    role,                   -- Role in auth system
    raw_app_meta_data,      -- App metadata including providers
    raw_user_meta_data,     -- User metadata including custom role
    is_super_admin,         -- Not a super admin
    created_at,             -- Current timestamp
    updated_at,             -- Current timestamp
    confirmation_token,     -- Not needed since email is confirmed
    recovery_token,         -- Not needed initially
    email_change_token_new, -- Not needed initially
    email_change            -- Not needed initially
  ) VALUES (
    uid,                    -- Generated UUID
    default_instance_id,    -- Use default UUID
    NEW.email,              -- From the nurse table
    crypt('Nurse@123', gen_salt('bf')), -- Encrypted default password
    NOW(),                  -- Confirm email immediately
    'authenticated',        -- Standard audience for authenticated users
    'authenticated',        -- Standard role
    '{"provider":"email","providers":["email"]}',
    '{"role":"nurse"}',     -- Custom role as nurse
    FALSE,                  -- Not a super admin
    NOW(),                  -- Current timestamp
    NOW(),                  -- Current timestamp
    '',                     -- Empty string, not NULL
    '',                     -- Empty string, not NULL
    '',                     -- Empty string, not NULL
    ''                      -- Empty string, not NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger that calls this function after insertion
DROP TRIGGER IF EXISTS after_insert_nurse ON nurses;

CREATE TRIGGER after_insert_nurse
AFTER INSERT ON nurses
FOR EACH ROW
EXECUTE FUNCTION create_nurse_auth_user();