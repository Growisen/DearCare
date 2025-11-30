create table public.tatahomenursing_services_enquiries (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  email text not null,
  phone text not null,
  location text not null,
  service text not null,
  created_at timestamp with time zone null default now(),
  organization text null default 'Tata HomeNursing'::text,
  constraint tatahomenursing_services_enquiries_pkey primary key (id)
) TABLESPACE pg_default;