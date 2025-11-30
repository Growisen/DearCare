-- 1. Create an Enum for the care preference type to ensure data integrity
create type delivery_care_preference as enum ('post_delivery', 'pre_delivery', 'on_delivery');

-- 2. Create the delivery_care_requests table
create table delivery_care_requests (
  id uuid primary key default gen_random_uuid(),
  
  -- Foreign Key to your existing clients table
  client_id uuid not null references clients(id) on delete cascade,
  
  -- Core Preference
  care_preferred delivery_care_preference not null,

  -- Post-Delivery Specific Fields
  delivery_date date,
  delivery_type text,             -- 'normal', 'c_section', 'other'
  mother_allergies text,
  mother_medications text,
  number_of_babies text,          -- 'single', 'twins', 'triplets'
  feeding_method text,            -- 'breastfeeding', 'formula', 'both'
  baby_allergies text,
  preferred_schedule text,        -- 'live_in', 'day_shifts', 'night_nanny'
  
  -- JSONB column to store boolean flags for duties
  -- Stores: { "babyCare": boolean, "motherCare": boolean }
  duties jsonb default '{"babyCare": false, "motherCare": false}'::jsonb,

  -- Pre-Delivery Specific Fields
  expected_due_date text,
  backup_contact_name text,
  backup_contact_number text,
  medical_history text,           -- Maps to 'Allergies/Medical History (Mother)'

  -- Shared Fields (Used in both Pre & On-Delivery)
  hospital_name text,             -- Maps to 'Planned Place of Birth' or 'Hospital Name'
  doctor_name text,

  -- On-Delivery Specific Fields
  birth_date_time text,    -- Handles Date & Time of birth
  room_details text,
  baby_gender text,               -- 'male', 'female'
  baby_weight text,

  -- Standard Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS) - Recommended for Supabase
alter table delivery_care_requests enable row level security;

-- 4. Create basic policies (Adjust based on your specific auth requirements)

-- Allow read access to authenticated users (or restrict to specific roles)
create policy "Allow authenticated read access"
  on delivery_care_requests for select
  to authenticated
  using (true);

-- Allow insert access to authenticated users
create policy "Allow all inserts"
  on delivery_care_requests
  for insert
  to public
  with check (true);


-- Allow update access (optional, usually restricted to owner or admin)
create policy "Allow authenticated update access"
  on delivery_care_requests for update
  to authenticated
  using (true);