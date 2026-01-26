create type "public"."crm_payment_type" as enum ('cash', 'bank transfer');

create type "public"."payment_type_dearcare" as enum ('client_payment_received', 'nurse_salary_paid', 'office_expenses_paid', 'student_fee_received', 'commission');

create sequence "public"."bank_accounts_id_seq";

create sequence "public"."refund_payments_id_seq";

create sequence "public"."transactions_bank_id_seq";

drop policy "Authenticated users can delete advance payments" on "public"."advance_payments";

drop policy "Authenticated users can insert advance payments" on "public"."advance_payments";

drop policy "Authenticated users can read advance payments" on "public"."advance_payments";

drop policy "Authenticated users can update advance payments" on "public"."advance_payments";

drop policy "Authenticated users have full access" on "public"."clients";

drop policy "Authenticated users have full access" on "public"."individual_clients";

drop policy "Allow all authenticated users to read" on "public"."nurses";

drop policy "Authenticated users have full access" on "public"."nurses";

drop policy "Authenticated users have full access" on "public"."organization_clients";

drop policy "Users can view salary payments" on "public"."salary_payments";

revoke delete on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke insert on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke references on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke select on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke trigger on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke truncate on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke update on table "public"."tatahomenursing_services_enquiries" from "anon";

revoke delete on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke insert on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke references on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke select on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke trigger on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke truncate on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke update on table "public"."tatahomenursing_services_enquiries" from "authenticated";

revoke delete on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke insert on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke references on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke select on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke trigger on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke truncate on table "public"."tatahomenursing_services_enquiries" from "service_role";

revoke update on table "public"."tatahomenursing_services_enquiries" from "service_role";

alter table "public"."shift_summary" drop constraint "fk_assignment";

alter table "public"."advance_payments" drop constraint "advance_payments_check";

alter table "public"."attendence_individual" drop constraint "attendence_individual_assigned_id_fkey";

alter table "public"."dearcare_salary_calculation_runs" drop constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."nurse_client" drop constraint "nurse_client_client_id_fkey";

alter table "public"."salary_payments" drop constraint "salary_payments_payment_status_check";

drop view if exists "public"."nurse_assignments_view";

drop view if exists "public"."nurse_assignments_view_with_reg_no";

drop view if exists "public"."nurse_assignments_view_with_salary";

drop view if exists "public"."clients_view_unified";

drop view if exists "public"."unified_payment_records_view";

alter table "public"."tatahomenursing_services_enquiries" drop constraint "tatahomenursing_services_enquiries_pkey";

alter table "public"."registration_counters" drop constraint "registration_counters_pkey";

drop index if exists "public"."tatahomenursing_services_enquiries_pkey";

drop index if exists "public"."registration_counters_pkey";

drop table "public"."tatahomenursing_services_enquiries";


  create table "public"."bank_accounts" (
    "id" integer not null default nextval('public.bank_accounts_id_seq'::regclass),
    "bank_name" character varying(255) not null,
    "account_name" character varying(255) not null,
    "shortform" character varying(50) not null,
    "account_number" character varying(100),
    "ifsc" character varying(20),
    "branch" character varying(255),
    "balance" numeric(15,2) default 0.00,
    "tenant" character varying(100),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."child_care_requests" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "number_of_children" text,
    "ages_of_children" text,
    "care_needs" jsonb default '{}'::jsonb,
    "care_needs_details" text,
    "notes" text,
    "primary_focus" text,
    "home_tasks" jsonb default '{}'::jsonb,
    "home_tasks_details" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."child_care_requests" enable row level security;


  create table "public"."client_service_history" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "start_date" date not null,
    "end_date" date not null,
    "note" text,
    "created_at" timestamp with time zone default now(),
    "service_required" text
      );


alter table "public"."client_service_history" enable row level security;


  create table "public"."crm_refund_payments" (
    "id" integer not null default nextval('public.refund_payments_id_seq'::regclass),
    "client_id" uuid not null,
    "amount" numeric(10,2) not null,
    "reason" text,
    "payment_method" text,
    "payment_type" public.crm_payment_type,
    "created_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text),
    "refund_date" timestamp with time zone,
    "payment_status" text default 'pending'::text
      );


alter table "public"."crm_refund_payments" enable row level security;


  create table "public"."daybook_personal" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "paytype" public.pay_type,
    "amount" real,
    "description" text,
    "tenant" character varying(100)
      );


alter table "public"."daybook_personal" enable row level security;


  create table "public"."housemaid_requests" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "client_id" uuid not null,
    "service_type" text,
    "service_type_other" text,
    "frequency" text,
    "preferred_schedule" text,
    "start_date" date,
    "home_type" text,
    "bedrooms" smallint default 0,
    "bathrooms" smallint default 0,
    "household_size" smallint default 1,
    "has_pets" boolean default false,
    "pet_details" text,
    "duties" jsonb default '{}'::jsonb,
    "meal_prep_details" text,
    "childcare_details" text,
    "allergies" text,
    "restricted_areas" text,
    "special_instructions" text
      );


alter table "public"."housemaid_requests" enable row level security;


  create table "public"."reassessment" (
    "id" bigint generated always as identity not null,
    "client_id" uuid not null,
    "diagnosis" text,
    "present_condition" text,
    "vitals" jsonb,
    "bed_sore" jsonb,
    "mental_status" text,
    "hygiene" text,
    "general_status" text,
    "care_status" text,
    "outdoor_hours" text,
    "nursing_diagnosis" text,
    "follow_up_evaluation" text,
    "assignment_done_by" text,
    "allotted_staff_name" text,
    "assigning_period" text,
    "previous_visited_date" date,
    "dynamic_fields" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."reassessment" enable row level security;


  create table "public"."transactions_bank" (
    "id" integer not null default nextval('public.transactions_bank_id_seq'::regclass),
    "bank_account_id" integer not null,
    "transaction_type" character varying(50) not null,
    "amount" numeric(15,2) not null,
    "from_account_id" integer,
    "to_account_id" integer,
    "cheque_number" character varying(100),
    "reference" character varying(255),
    "description" text,
    "status" character varying(50) default 'completed'::character varying,
    "tenant" character varying(100),
    "created_at" timestamp with time zone default now()
      );


alter table "public"."advance_payments" add column "approved" boolean not null default false;

alter table "public"."advance_payments" add column "info" text;

alter table "public"."advance_payments" add column "payment_method" text;

alter table "public"."advance_payments" add column "payment_type" public.crm_payment_type;

alter table "public"."advance_payments" add column "receipt_file" text;

alter table "public"."client_payment_line_items" add column "commission" numeric default '0'::numeric;

alter table "public"."client_payment_records" add column "approved" boolean not null default false;

alter table "public"."client_payment_records" add column "payment_type" text;

alter table "public"."clients" enable row level security;

alter table "public"."day_book" add column "created_by" text;

alter table "public"."day_book" add column "custom_paid_date" date;

alter table "public"."day_book" add column "payment_description" text;

alter table "public"."day_book" add column "payment_type_specific" public.payment_type_dearcare;

alter table "public"."individual_clients" enable row level security;

alter table "public"."nurse_client" add column "end_notes" text;

alter table "public"."nurse_client" add column "notes" text;

alter table "public"."nurses" add column "nurse_sequence_reg_no" text;

alter table "public"."nurses" enable row level security;

alter table "public"."organization_clients" enable row level security;

alter table "public"."otp" add column "verified" boolean not null default false;

alter table "public"."otp" add column "verified_at" timestamp with time zone;

alter table "public"."patient_assessments" add column "bed_sore" jsonb;

alter table "public"."salary_payments" add column "approved_at" timestamp with time zone;

alter table "public"."salary_payments" add column "balance_amount" numeric default '0'::numeric;

alter table "public"."salary_payments" add column "paid_at" timestamp with time zone;

alter table "public"."salary_payments" add column "payment_history" jsonb;

alter table "public"."salary_payments" add column "payment_type" public.crm_payment_type;

alter table "public"."staff_requirements" add column "custom_shift_timing" text;

alter sequence "public"."bank_accounts_id_seq" owned by "public"."bank_accounts"."id";

alter sequence "public"."refund_payments_id_seq" owned by "public"."crm_refund_payments"."id";

alter sequence "public"."transactions_bank_id_seq" owned by "public"."transactions_bank"."id";

CREATE UNIQUE INDEX bank_accounts_pkey ON public.bank_accounts USING btree (id);

CREATE UNIQUE INDEX child_care_requests_pkey ON public.child_care_requests USING btree (id);

CREATE UNIQUE INDEX client_service_history_pkey ON public.client_service_history USING btree (id);

CREATE UNIQUE INDEX daybook_personal_pkey ON public.daybook_personal USING btree (id);

CREATE UNIQUE INDEX housemaid_requests_pkey ON public.housemaid_requests USING btree (id);

CREATE INDEX idx_refunds_client_id ON public.crm_refund_payments USING btree (client_id);

CREATE INDEX idx_service_history_client ON public.client_service_history USING btree (client_id);

CREATE UNIQUE INDEX reassessment_pkey ON public.reassessment USING btree (id);

CREATE UNIQUE INDEX refund_payments_pkey ON public.crm_refund_payments USING btree (id);

CREATE UNIQUE INDEX transactions_bank_pkey ON public.transactions_bank USING btree (id);

CREATE UNIQUE INDEX registration_counters_pkey ON public.registration_counters USING btree (category, type);

alter table "public"."bank_accounts" add constraint "bank_accounts_pkey" PRIMARY KEY using index "bank_accounts_pkey";

alter table "public"."child_care_requests" add constraint "child_care_requests_pkey" PRIMARY KEY using index "child_care_requests_pkey";

alter table "public"."client_service_history" add constraint "client_service_history_pkey" PRIMARY KEY using index "client_service_history_pkey";

alter table "public"."crm_refund_payments" add constraint "refund_payments_pkey" PRIMARY KEY using index "refund_payments_pkey";

alter table "public"."daybook_personal" add constraint "daybook_personal_pkey" PRIMARY KEY using index "daybook_personal_pkey";

alter table "public"."housemaid_requests" add constraint "housemaid_requests_pkey" PRIMARY KEY using index "housemaid_requests_pkey";

alter table "public"."reassessment" add constraint "reassessment_pkey" PRIMARY KEY using index "reassessment_pkey";

alter table "public"."transactions_bank" add constraint "transactions_bank_pkey" PRIMARY KEY using index "transactions_bank_pkey";

alter table "public"."registration_counters" add constraint "registration_counters_pkey" PRIMARY KEY using index "registration_counters_pkey";

alter table "public"."child_care_requests" add constraint "child_care_requests_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."child_care_requests" validate constraint "child_care_requests_client_id_fkey";

alter table "public"."child_care_requests" add constraint "child_care_requests_primary_focus_check" CHECK ((primary_focus = ANY (ARRAY['child_care_priority'::text, 'both_equal'::text]))) not valid;

alter table "public"."child_care_requests" validate constraint "child_care_requests_primary_focus_check";

alter table "public"."client_service_history" add constraint "client_service_history_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_service_history" validate constraint "client_service_history_client_id_fkey";

alter table "public"."crm_refund_payments" add constraint "refund_payments_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."crm_refund_payments" validate constraint "refund_payments_client_id_fkey";

alter table "public"."housemaid_requests" add constraint "housemaid_requests_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."housemaid_requests" validate constraint "housemaid_requests_client_id_fkey";

alter table "public"."housemaid_requests" add constraint "housemaid_requests_service_type_check" CHECK ((service_type = ANY (ARRAY['live-in'::text, 'part-time'::text, 'other'::text]))) not valid;

alter table "public"."housemaid_requests" validate constraint "housemaid_requests_service_type_check";

alter table "public"."reassessment" add constraint "reassessment_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."reassessment" validate constraint "reassessment_client_id_fkey";

alter table "public"."shift_summary" add constraint "shift_summary_assigned_id_fkey" FOREIGN KEY (assigned_id) REFERENCES public.nurse_client(id) ON DELETE CASCADE not valid;

alter table "public"."shift_summary" validate constraint "shift_summary_assigned_id_fkey";

alter table "public"."transactions_bank" add constraint "transactions_bank_bank_account_id_fkey" FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE CASCADE not valid;

alter table "public"."transactions_bank" validate constraint "transactions_bank_bank_account_id_fkey";

alter table "public"."transactions_bank" add constraint "transactions_bank_from_account_id_fkey" FOREIGN KEY (from_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL not valid;

alter table "public"."transactions_bank" validate constraint "transactions_bank_from_account_id_fkey";

alter table "public"."transactions_bank" add constraint "transactions_bank_status_check" CHECK (((status)::text = ANY ((ARRAY['completed'::character varying, 'pending'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."transactions_bank" validate constraint "transactions_bank_status_check";

alter table "public"."transactions_bank" add constraint "transactions_bank_to_account_id_fkey" FOREIGN KEY (to_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL not valid;

alter table "public"."transactions_bank" validate constraint "transactions_bank_to_account_id_fkey";

alter table "public"."transactions_bank" add constraint "transactions_bank_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'withdraw'::character varying, 'transfer'::character varying, 'cheque'::character varying])::text[]))) not valid;

alter table "public"."transactions_bank" validate constraint "transactions_bank_transaction_type_check";

alter table "public"."advance_payments" add constraint "advance_payments_check" CHECK (((return_amount >= (0)::numeric) AND (return_amount <= advance_amount))) not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_check";

alter table "public"."attendence_individual" add constraint "attendence_individual_assigned_id_fkey" FOREIGN KEY (assigned_id) REFERENCES public.nurse_client(id) ON DELETE CASCADE not valid;

alter table "public"."attendence_individual" validate constraint "attendence_individual_assigned_id_fkey";

alter table "public"."dearcare_salary_calculation_runs" add constraint "dearcare_salary_calculation_runs_execution_status_check" CHECK (((execution_status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::text[]))) not valid;

alter table "public"."dearcare_salary_calculation_runs" validate constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."nurse_client" add constraint "nurse_client_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."nurse_client" validate constraint "nurse_client_client_id_fkey";

alter table "public"."salary_payments" add constraint "salary_payments_payment_status_check" CHECK (((payment_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('paid'::character varying)::text, ('cancelled'::character varying)::text, ('approved'::character varying)::text]))) not valid;

alter table "public"."salary_payments" validate constraint "salary_payments_payment_status_check";

set check_function_bodies = off;

create or replace view "public"."advance_payments_view" as  SELECT ap.id,
    ap.date,
    ap.advance_amount,
    ap.return_type,
    ap.return_amount,
    ap.remaining_amount,
    ap.installment_amount,
    ap.info,
    ap.payment_method,
    ap.receipt_file,
    ap.deductions,
    ap.approved,
    ap.payment_type,
    ap.nurse_id,
    n.full_name AS nurse_name,
    n.admitted_type AS nurse_admitted_type,
    n.address,
    n.city,
    n.nurse_prev_reg_no,
    n.nurse_reg_no
   FROM (public.advance_payments ap
     JOIN public.nurses n ON ((ap.nurse_id = n.nurse_id)));


create or replace view "public"."aggregated_salaries" as  SELECT salary_payments.nurse_id,
    COALESCE(sum(
        CASE
            WHEN ((salary_payments.payment_status)::text = 'approved'::text) THEN salary_payments.net_salary
            ELSE COALESCE(( SELECT sum(((entry.value ->> 'amount'::text))::numeric) AS sum
               FROM jsonb_array_elements(COALESCE(salary_payments.payment_history, '[]'::jsonb)) entry(value)), (0)::numeric)
        END), (0)::numeric) AS approved,
    COALESCE(sum(salary_payments.balance_amount), (0)::numeric) AS pending
   FROM public.salary_payments
  GROUP BY salary_payments.nurse_id;


create or replace view "public"."crm_client_refund_details_view" as  SELECT rp.id,
    rp.amount,
    rp.reason,
    rp.payment_type,
    rp.payment_method,
    rp.created_at,
    rp.refund_date,
    rp.client_id,
    c.registration_number,
    c.prev_registration_number,
    COALESCE(ind.requestor_name, org.organization_name) AS client_name
   FROM (((public.crm_refund_payments rp
     LEFT JOIN public.clients c ON ((rp.client_id = c.id)))
     LEFT JOIN public.individual_clients ind ON ((rp.client_id = ind.client_id)))
     LEFT JOIN public.organization_clients org ON ((rp.client_id = org.client_id)));


CREATE OR REPLACE FUNCTION public.fetch_aggregated_salaries(nurse_id integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  result jsonb;
begin
  result := (
    select jsonb_build_object(
      'approved', coalesce(sum(case when payment_status = 'approved' then net_salary else 0 end), 0),
      'pending', coalesce(sum(case when payment_status = 'pending' then net_salary else 0 end), 0)
    )
    from salary_payments
    where nurse_id = fetch_aggregated_salaries.nurse_id
  );

  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_advance_payment_totals(p_org public.admission_type, p_date date DEFAULT NULL::date, p_search text DEFAULT NULL::text)
 RETURNS TABLE(total_given numeric, total_returned numeric)
 LANGUAGE sql
AS $function$
  select 
    coalesce(sum(advance_amount), 0) as total_given,
    coalesce(sum(return_amount), 0) as total_returned
  from advance_payments_view
  where nurse_admitted_type = p_org
  and (p_date is null or date = p_date)
  and (
      p_search is null 
      or p_search = '' 
      or (info ilike '%' || p_search || '%'
          or nurse_name ilike '%' || p_search || '%'
          or nurse_reg_no ilike '%' || p_search || '%'
          or nurse_prev_reg_no ilike '%' || p_search || '%'
          or address ilike '%' || p_search || '%'
          or city ilike '%' || p_search || '%')
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_advance_payment_totals(p_org public.admission_type, p_date date DEFAULT NULL::date, p_search text DEFAULT NULL::text, p_payment_type text DEFAULT NULL::text)
 RETURNS TABLE(total_given numeric, total_returned numeric)
 LANGUAGE sql
AS $function$
  SELECT 
    COALESCE(SUM(advance_amount), 0) AS total_given,
    COALESCE(SUM(return_amount), 0) AS total_returned
  FROM advance_payments_view
  WHERE nurse_admitted_type = p_org
  
  -- Date Filter
  AND (p_date IS NULL OR date = p_date)
  
  -- Payment Type Filter (ENUM Handling)
  AND (
      p_payment_type IS NULL 
      OR p_payment_type = 'all' 
      -- We cast the ENUM column to TEXT here to allow case-insensitive comparison
      -- and prevent errors when comparing against strings.
      OR payment_type::text ILIKE p_payment_type 
  )
  
  -- Search Filter
  AND (
      p_search IS NULL 
      OR p_search = '' 
      OR (info ILIKE '%' || p_search || '%'
          OR nurse_name ILIKE '%' || p_search || '%'
          OR nurse_reg_no ILIKE '%' || p_search || '%'
          OR nurse_prev_reg_no ILIKE '%' || p_search || '%'
          OR address ILIKE '%' || p_search || '%'
          OR city ILIKE '%' || p_search || '%')
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_client_payment_aggregates(filter_client_category public.client_category, filter_start_date date DEFAULT NULL::date, filter_end_date date DEFAULT NULL::date, search_text text DEFAULT NULL::text)
 RETURNS TABLE(total_amount_received numeric, total_commission_generated numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COALESCE(SUM(total_commission), 0)
    FROM 
        unified_payment_records_view_with_comm
    WHERE 
        (filter_start_date IS NULL OR date_added >= filter_start_date)
        AND
        (filter_end_date IS NULL OR date_added <= filter_end_date)
        AND
        (
            search_text IS NULL OR search_text = '' 
            OR
            client_display_name ILIKE '%' || search_text || '%'
        )
        AND
        (
            client_category = filter_client_category
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_daily_assignment_stats(target_date date, admitted_type_filter public.admission_type DEFAULT NULL::public.admission_type)
 RETURNS TABLE(starting_today_count bigint, ending_today_count bigint, active_count bigint, expiring_soon_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE start_date = target_date),
        COUNT(*) FILTER (WHERE end_date = target_date),
        COUNT(*) FILTER (WHERE start_date <= target_date AND (end_date >= target_date OR end_date IS NULL)),
        COUNT(*) FILTER (WHERE end_date > target_date AND end_date <= target_date + 7)
    FROM nurse_assignments_view_with_service_history
    WHERE 
        -- DIRECT COMPARISON (No ::text casting needed now!)
        (admitted_type_filter IS NULL OR admitted_type = admitted_type_filter);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_nurse_attendance_report(input_date date, page_number integer, page_size integer, status_filter text, admitted_type_filter text, search_term text)
 RETURNS TABLE(id bigint, assigned_id bigint, "nurseName" text, date date, "shiftStart" time without time zone, "shiftEnd" time without time zone, "scheduledStart" text, "scheduledEnd" text, "hoursWorked" text, status text, location text, "nurseId" bigint, total_count bigint)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  with active_schedules as (
    -- 1. Find all nurses assigned to work on this specific date
    select
      nc.id as nc_id,
      nc.nurse_id,
      nc.shift_start_time,
      nc.shift_end_time
    from
      nurse_client nc
    where
      -- Date logic: Input date must fall within assignment start/end
      nc.start_date <= input_date
      and (nc.end_date is null or nc.end_date >= input_date)
  ),
  joined_data as (
    -- 2. Join with Nurse details and Attendance records
    select
      ai.id as attendance_id,
      sched.nc_id as assignment_id,
      n.full_name,
      input_date as work_date,
      ai.start_time,
      ai.end_time,
      sched.shift_start_time,
      sched.shift_end_time,
      ai.total_hours,
      -- Logic: If attendance row exists, they are present; otherwise absent
      case 
        when ai.id is not null then 'present' 
        else 'absent' 
      end as computed_status,
      ai.location,
      n.nurse_id,
      n.nurse_reg_no,
      n.admitted_type
    from
      active_schedules sched
    join
      nurses n on sched.nurse_id = n.nurse_id
    left join
      attendence_individual ai on sched.nc_id = ai.assigned_id and ai.date = input_date
  )
  -- 3. Filter and Paginate
  select
    jd.attendance_id,
    jd.assignment_id,
    jd.full_name::text,       -- Explicit cast to text
    jd.work_date,
    jd.start_time,            -- Already TIME type
    jd.end_time,              -- Already TIME type
    jd.shift_start_time::text, -- Explicit cast from varchar to text (FIXES ERROR)
    jd.shift_end_time::text,   -- Explicit cast from varchar to text (FIXES ERROR)
    jd.total_hours,           -- Already text
    jd.computed_status,
    jd.location,
    jd.nurse_id,
    count(*) over() as total_count
  from
    joined_data jd
  where
    -- Status Filter
    (status_filter is null or status_filter = 'all' or jd.computed_status = status_filter)
    -- Admitted Type Filter
    and (admitted_type_filter is null or admitted_type_filter = '' or jd.admitted_type::text = admitted_type_filter)
    -- Search Filter (Name or Reg No)
    and (search_term is null or search_term = '' or 
         jd.full_name ilike '%' || search_term || '%' or 
         jd.nurse_reg_no ilike '%' || search_term || '%')
  order by
    jd.full_name asc
  limit
    page_size
  offset
    (page_number - 1) * page_size;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_salary_stats(p_org public.admission_type, p_date date DEFAULT NULL::date, p_search text DEFAULT NULL::text, p_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_approved_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_paid_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(total_approved_amount numeric, total_salary_amount numeric)
 LANGUAGE sql
AS $function$
  select 
    coalesce(sum(sp.net_salary) filter (where sp.payment_status = 'approved'), 0) as total_approved_amount,
    coalesce(sum(sp.net_salary), 0) as total_salary_amount
  from salary_payments sp
  join nurses n on sp.nurse_id = n.nurse_id
  where n.admitted_type = p_org
    and (
      p_date is null 
      or (sp.pay_period_start <= p_date and sp.pay_period_end >= p_date)
    )
    and (
      p_search is null 
      or p_search = '' 
      or (sp.info ilike '%' || p_search || '%'
          or n.full_name ilike '%' || p_search || '%'
          or n.nurse_reg_no ilike '%' || p_search || '%'
      )
    )
    and (
      p_created_at is null
      or sp.created_at >= p_created_at
    )
    and (
      p_approved_at is null
      or sp.approved_at >= p_approved_at
    )
    and (
      p_paid_at is null
      or sp.paid_at >= p_paid_at
    );
$function$
;

create or replace view "public"."nurse_assignments_view_with_service_history" as  SELECT nc.id,
    nc.created_at,
    nc.nurse_id,
    nc.client_id,
    nc.assigned_type,
    nc.start_date,
    nc.end_date,
    nc.shift_start_time,
    nc.shift_end_time,
    nc.salary_hour,
    nc.salary_per_day,
    nc.shift_hours,
    n.first_name AS nurse_first_name,
    n.last_name AS nurse_last_name,
    (((n.first_name)::text || ' '::text) || (n.last_name)::text) AS nurse_full_name,
    n.admitted_type,
    n.nurse_reg_no,
    n.salary_per_month,
    c.client_type,
    c.client_category,
    COALESCE(ic.requestor_name, ic.patient_name, oc.organization_name) AS client_name,
    COALESCE(ic.patient_name, ''::character varying) AS patient_name,
    csh.start_date AS current_service_start,
    csh.end_date AS current_service_end,
    csh.note AS current_service_note
   FROM (((((public.nurse_client nc
     JOIN public.nurses n ON ((nc.nurse_id = n.nurse_id)))
     JOIN public.clients c ON ((nc.client_id = c.id)))
     LEFT JOIN public.individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::public.client_type))))
     LEFT JOIN public.organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::public.client_type))))
     LEFT JOIN ( SELECT DISTINCT ON (client_service_history.client_id) client_service_history.client_id,
            client_service_history.start_date,
            client_service_history.end_date,
            client_service_history.note
           FROM public.client_service_history
          WHERE ((CURRENT_DATE >= client_service_history.start_date) AND (CURRENT_DATE <= client_service_history.end_date))
          ORDER BY client_service_history.client_id, client_service_history.start_date DESC) csh ON ((c.id = csh.client_id)));


create or replace view "public"."unified_payment_records_view_with_comm" as  SELECT p.id,
    p.client_id,
    p.payment_group_name,
    p.total_amount,
    p.date_added,
    p.mode_of_payment,
    p.start_date,
    p.end_date,
    p.payment_type,
    c.client_category,
    c.client_type,
    c.status AS client_status,
    COALESCE(org.organization_name, ind.requestor_name, 'Unknown Client'::character varying) AS client_display_name,
    COALESCE(sum(pli.commission), (0)::numeric) AS total_commission
   FROM ((((public.client_payment_records p
     JOIN public.clients c ON ((p.client_id = c.id)))
     LEFT JOIN public.individual_clients ind ON ((c.id = ind.client_id)))
     LEFT JOIN public.organization_clients org ON ((c.id = org.client_id)))
     LEFT JOIN public.client_payment_line_items pli ON ((p.id = pli.payment_record_id)))
  GROUP BY p.id, p.client_id, p.payment_group_name, p.total_amount, p.date_added, p.mode_of_payment, p.start_date, p.end_date, c.client_category, c.client_type, c.status, org.organization_name, ind.requestor_name;


create or replace view "public"."view_salary_payment_debts" as  SELECT n.nurse_reg_no,
    n.full_name,
    n.admitted_type,
    sp.id AS salary_payment_id,
    sp.nurse_id,
    sp.pay_period_start,
    sp.pay_period_end,
    sp.net_salary,
    sp.payment_status,
    sp.gross_salary,
    sp.info,
    sp.created_at,
    sp.bonus,
    sp.deductions,
    sp.approved_at,
    sp.paid_at,
    COALESCE(adv_stats.total_remaining, (0)::numeric) AS total_outstanding_debt,
    COALESCE(adv_stats.total_installments, (0)::numeric) AS total_installments_due,
    COALESCE(adv_stats.active_loan_count, (0)::bigint) AS active_loan_count,
        CASE
            WHEN (adv_stats.total_remaining > (0)::numeric) THEN true
            ELSE false
        END AS has_active_debt
   FROM ((public.salary_payments sp
     JOIN public.nurses n ON ((sp.nurse_id = n.nurse_id)))
     LEFT JOIN ( SELECT advance_payments.nurse_id,
            count(*) AS active_loan_count,
            sum(advance_payments.remaining_amount) AS total_remaining,
            sum(advance_payments.installment_amount) AS total_installments
           FROM public.advance_payments
          WHERE (advance_payments.remaining_amount > (0)::numeric)
          GROUP BY advance_payments.nurse_id) adv_stats ON ((sp.nurse_id = adv_stats.nurse_id)));


create or replace view "public"."clients_view_unified" as  SELECT c.id,
    c.client_type,
    c.status,
    c.created_at,
    c.client_category,
    c.otp_preference,
    c.registration_number,
    c.prev_registration_number,
    ic.requestor_email,
    ic.requestor_phone,
    ic.requestor_name,
    ic.patient_name,
    ic.service_required,
    ic.start_date,
    oc.organization_name,
    oc.contact_email,
    oc.contact_phone,
    lower(concat_ws(' '::text, ic.requestor_name, ic.patient_name, ic.requestor_email, ic.requestor_phone, oc.organization_name, oc.contact_email, oc.contact_phone, c.registration_number, c.prev_registration_number)) AS search_text
   FROM ((public.clients c
     LEFT JOIN public.individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::public.client_type))))
     LEFT JOIN public.organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::public.client_type))))
  WHERE ((ic.client_id IS NOT NULL) OR (oc.client_id IS NOT NULL));


CREATE OR REPLACE FUNCTION public.increment_registration_counter(p_category text, p_type text, p_year text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_counter INTEGER;
BEGIN
  -- Insert a new row (starting at 1) if this Category+Type has never been seen.
  -- Otherwise, update the existing row.
  INSERT INTO registration_counters (category, type, year, counter)
  VALUES (p_category, p_type, p_year, 1)
  
  -- CHANGED: Conflict is now only on (category, type)
  ON CONFLICT (category, type) 
  DO UPDATE SET 
    counter = registration_counters.counter + 1,
    year = p_year -- We update the year column to keep it current
  RETURNING counter INTO new_counter;
  
  RETURN new_counter;
END;
$function$
;

create or replace view "public"."unified_payment_records_view" as  SELECT p.id,
    p.client_id,
    p.payment_group_name,
    p.total_amount,
    p.date_added,
    p.mode_of_payment,
    p.start_date,
    p.end_date,
    c.client_category,
    c.client_type,
    p.payment_type,
    c.status AS client_status,
    COALESCE(org.organization_name, ind.requestor_name, 'Unknown Client'::character varying) AS client_display_name
   FROM (((public.client_payment_records p
     JOIN public.clients c ON ((p.client_id = c.id)))
     LEFT JOIN public.individual_clients ind ON ((c.id = ind.client_id)))
     LEFT JOIN public.organization_clients org ON ((c.id = org.client_id)));


grant delete on table "public"."academy_courses" to "anon";

grant insert on table "public"."academy_courses" to "anon";

grant references on table "public"."academy_courses" to "anon";

grant select on table "public"."academy_courses" to "anon";

grant trigger on table "public"."academy_courses" to "anon";

grant truncate on table "public"."academy_courses" to "anon";

grant update on table "public"."academy_courses" to "anon";

grant delete on table "public"."academy_courses" to "authenticated";

grant insert on table "public"."academy_courses" to "authenticated";

grant references on table "public"."academy_courses" to "authenticated";

grant select on table "public"."academy_courses" to "authenticated";

grant trigger on table "public"."academy_courses" to "authenticated";

grant truncate on table "public"."academy_courses" to "authenticated";

grant update on table "public"."academy_courses" to "authenticated";

grant delete on table "public"."academy_courses" to "service_role";

grant insert on table "public"."academy_courses" to "service_role";

grant references on table "public"."academy_courses" to "service_role";

grant select on table "public"."academy_courses" to "service_role";

grant trigger on table "public"."academy_courses" to "service_role";

grant truncate on table "public"."academy_courses" to "service_role";

grant update on table "public"."academy_courses" to "service_role";

grant delete on table "public"."academy_enquiries" to "anon";

grant insert on table "public"."academy_enquiries" to "anon";

grant references on table "public"."academy_enquiries" to "anon";

grant select on table "public"."academy_enquiries" to "anon";

grant trigger on table "public"."academy_enquiries" to "anon";

grant truncate on table "public"."academy_enquiries" to "anon";

grant update on table "public"."academy_enquiries" to "anon";

grant delete on table "public"."academy_enquiries" to "authenticated";

grant insert on table "public"."academy_enquiries" to "authenticated";

grant references on table "public"."academy_enquiries" to "authenticated";

grant select on table "public"."academy_enquiries" to "authenticated";

grant trigger on table "public"."academy_enquiries" to "authenticated";

grant truncate on table "public"."academy_enquiries" to "authenticated";

grant update on table "public"."academy_enquiries" to "authenticated";

grant delete on table "public"."academy_enquiries" to "service_role";

grant insert on table "public"."academy_enquiries" to "service_role";

grant references on table "public"."academy_enquiries" to "service_role";

grant select on table "public"."academy_enquiries" to "service_role";

grant trigger on table "public"."academy_enquiries" to "service_role";

grant truncate on table "public"."academy_enquiries" to "service_role";

grant update on table "public"."academy_enquiries" to "service_role";

grant delete on table "public"."academy_faculties" to "anon";

grant insert on table "public"."academy_faculties" to "anon";

grant references on table "public"."academy_faculties" to "anon";

grant select on table "public"."academy_faculties" to "anon";

grant trigger on table "public"."academy_faculties" to "anon";

grant truncate on table "public"."academy_faculties" to "anon";

grant update on table "public"."academy_faculties" to "anon";

grant delete on table "public"."academy_faculties" to "authenticated";

grant insert on table "public"."academy_faculties" to "authenticated";

grant references on table "public"."academy_faculties" to "authenticated";

grant select on table "public"."academy_faculties" to "authenticated";

grant trigger on table "public"."academy_faculties" to "authenticated";

grant truncate on table "public"."academy_faculties" to "authenticated";

grant update on table "public"."academy_faculties" to "authenticated";

grant delete on table "public"."academy_faculties" to "service_role";

grant insert on table "public"."academy_faculties" to "service_role";

grant references on table "public"."academy_faculties" to "service_role";

grant select on table "public"."academy_faculties" to "service_role";

grant trigger on table "public"."academy_faculties" to "service_role";

grant truncate on table "public"."academy_faculties" to "service_role";

grant update on table "public"."academy_faculties" to "service_role";

grant delete on table "public"."academy_rejects" to "anon";

grant insert on table "public"."academy_rejects" to "anon";

grant references on table "public"."academy_rejects" to "anon";

grant select on table "public"."academy_rejects" to "anon";

grant trigger on table "public"."academy_rejects" to "anon";

grant truncate on table "public"."academy_rejects" to "anon";

grant update on table "public"."academy_rejects" to "anon";

grant delete on table "public"."academy_rejects" to "authenticated";

grant insert on table "public"."academy_rejects" to "authenticated";

grant references on table "public"."academy_rejects" to "authenticated";

grant select on table "public"."academy_rejects" to "authenticated";

grant trigger on table "public"."academy_rejects" to "authenticated";

grant truncate on table "public"."academy_rejects" to "authenticated";

grant update on table "public"."academy_rejects" to "authenticated";

grant delete on table "public"."academy_rejects" to "service_role";

grant insert on table "public"."academy_rejects" to "service_role";

grant references on table "public"."academy_rejects" to "service_role";

grant select on table "public"."academy_rejects" to "service_role";

grant trigger on table "public"."academy_rejects" to "service_role";

grant truncate on table "public"."academy_rejects" to "service_role";

grant update on table "public"."academy_rejects" to "service_role";

grant delete on table "public"."academy_roles" to "anon";

grant insert on table "public"."academy_roles" to "anon";

grant references on table "public"."academy_roles" to "anon";

grant select on table "public"."academy_roles" to "anon";

grant trigger on table "public"."academy_roles" to "anon";

grant truncate on table "public"."academy_roles" to "anon";

grant update on table "public"."academy_roles" to "anon";

grant delete on table "public"."academy_roles" to "authenticated";

grant insert on table "public"."academy_roles" to "authenticated";

grant references on table "public"."academy_roles" to "authenticated";

grant select on table "public"."academy_roles" to "authenticated";

grant trigger on table "public"."academy_roles" to "authenticated";

grant truncate on table "public"."academy_roles" to "authenticated";

grant update on table "public"."academy_roles" to "authenticated";

grant delete on table "public"."academy_roles" to "service_role";

grant insert on table "public"."academy_roles" to "service_role";

grant references on table "public"."academy_roles" to "service_role";

grant select on table "public"."academy_roles" to "service_role";

grant trigger on table "public"."academy_roles" to "service_role";

grant truncate on table "public"."academy_roles" to "service_role";

grant update on table "public"."academy_roles" to "service_role";

grant delete on table "public"."academy_student_attendance" to "anon";

grant insert on table "public"."academy_student_attendance" to "anon";

grant references on table "public"."academy_student_attendance" to "anon";

grant select on table "public"."academy_student_attendance" to "anon";

grant trigger on table "public"."academy_student_attendance" to "anon";

grant truncate on table "public"."academy_student_attendance" to "anon";

grant update on table "public"."academy_student_attendance" to "anon";

grant delete on table "public"."academy_student_attendance" to "authenticated";

grant insert on table "public"."academy_student_attendance" to "authenticated";

grant references on table "public"."academy_student_attendance" to "authenticated";

grant select on table "public"."academy_student_attendance" to "authenticated";

grant trigger on table "public"."academy_student_attendance" to "authenticated";

grant truncate on table "public"."academy_student_attendance" to "authenticated";

grant update on table "public"."academy_student_attendance" to "authenticated";

grant delete on table "public"."academy_student_attendance" to "service_role";

grant insert on table "public"."academy_student_attendance" to "service_role";

grant references on table "public"."academy_student_attendance" to "service_role";

grant select on table "public"."academy_student_attendance" to "service_role";

grant trigger on table "public"."academy_student_attendance" to "service_role";

grant truncate on table "public"."academy_student_attendance" to "service_role";

grant update on table "public"."academy_student_attendance" to "service_role";

grant delete on table "public"."academy_supervisors" to "anon";

grant insert on table "public"."academy_supervisors" to "anon";

grant references on table "public"."academy_supervisors" to "anon";

grant select on table "public"."academy_supervisors" to "anon";

grant trigger on table "public"."academy_supervisors" to "anon";

grant truncate on table "public"."academy_supervisors" to "anon";

grant update on table "public"."academy_supervisors" to "anon";

grant delete on table "public"."academy_supervisors" to "authenticated";

grant insert on table "public"."academy_supervisors" to "authenticated";

grant references on table "public"."academy_supervisors" to "authenticated";

grant select on table "public"."academy_supervisors" to "authenticated";

grant trigger on table "public"."academy_supervisors" to "authenticated";

grant truncate on table "public"."academy_supervisors" to "authenticated";

grant update on table "public"."academy_supervisors" to "authenticated";

grant delete on table "public"."academy_supervisors" to "service_role";

grant insert on table "public"."academy_supervisors" to "service_role";

grant references on table "public"."academy_supervisors" to "service_role";

grant select on table "public"."academy_supervisors" to "service_role";

grant trigger on table "public"."academy_supervisors" to "service_role";

grant truncate on table "public"."academy_supervisors" to "service_role";

grant update on table "public"."academy_supervisors" to "service_role";

grant delete on table "public"."admin_dashboard_todos" to "anon";

grant insert on table "public"."admin_dashboard_todos" to "anon";

grant references on table "public"."admin_dashboard_todos" to "anon";

grant select on table "public"."admin_dashboard_todos" to "anon";

grant trigger on table "public"."admin_dashboard_todos" to "anon";

grant truncate on table "public"."admin_dashboard_todos" to "anon";

grant update on table "public"."admin_dashboard_todos" to "anon";

grant delete on table "public"."admin_dashboard_todos" to "authenticated";

grant insert on table "public"."admin_dashboard_todos" to "authenticated";

grant references on table "public"."admin_dashboard_todos" to "authenticated";

grant select on table "public"."admin_dashboard_todos" to "authenticated";

grant trigger on table "public"."admin_dashboard_todos" to "authenticated";

grant truncate on table "public"."admin_dashboard_todos" to "authenticated";

grant update on table "public"."admin_dashboard_todos" to "authenticated";

grant delete on table "public"."admin_dashboard_todos" to "service_role";

grant insert on table "public"."admin_dashboard_todos" to "service_role";

grant references on table "public"."admin_dashboard_todos" to "service_role";

grant select on table "public"."admin_dashboard_todos" to "service_role";

grant trigger on table "public"."admin_dashboard_todos" to "service_role";

grant truncate on table "public"."admin_dashboard_todos" to "service_role";

grant update on table "public"."admin_dashboard_todos" to "service_role";

grant delete on table "public"."attendence_individual" to "anon";

grant insert on table "public"."attendence_individual" to "anon";

grant references on table "public"."attendence_individual" to "anon";

grant select on table "public"."attendence_individual" to "anon";

grant trigger on table "public"."attendence_individual" to "anon";

grant truncate on table "public"."attendence_individual" to "anon";

grant update on table "public"."attendence_individual" to "anon";

grant delete on table "public"."attendence_individual" to "authenticated";

grant insert on table "public"."attendence_individual" to "authenticated";

grant references on table "public"."attendence_individual" to "authenticated";

grant select on table "public"."attendence_individual" to "authenticated";

grant trigger on table "public"."attendence_individual" to "authenticated";

grant truncate on table "public"."attendence_individual" to "authenticated";

grant update on table "public"."attendence_individual" to "authenticated";

grant delete on table "public"."attendence_individual" to "service_role";

grant insert on table "public"."attendence_individual" to "service_role";

grant references on table "public"."attendence_individual" to "service_role";

grant select on table "public"."attendence_individual" to "service_role";

grant trigger on table "public"."attendence_individual" to "service_role";

grant truncate on table "public"."attendence_individual" to "service_role";

grant update on table "public"."attendence_individual" to "service_role";

grant delete on table "public"."bank_accounts" to "anon";

grant insert on table "public"."bank_accounts" to "anon";

grant references on table "public"."bank_accounts" to "anon";

grant select on table "public"."bank_accounts" to "anon";

grant trigger on table "public"."bank_accounts" to "anon";

grant truncate on table "public"."bank_accounts" to "anon";

grant update on table "public"."bank_accounts" to "anon";

grant delete on table "public"."bank_accounts" to "authenticated";

grant insert on table "public"."bank_accounts" to "authenticated";

grant references on table "public"."bank_accounts" to "authenticated";

grant select on table "public"."bank_accounts" to "authenticated";

grant trigger on table "public"."bank_accounts" to "authenticated";

grant truncate on table "public"."bank_accounts" to "authenticated";

grant update on table "public"."bank_accounts" to "authenticated";

grant delete on table "public"."bank_accounts" to "service_role";

grant insert on table "public"."bank_accounts" to "service_role";

grant references on table "public"."bank_accounts" to "service_role";

grant select on table "public"."bank_accounts" to "service_role";

grant trigger on table "public"."bank_accounts" to "service_role";

grant truncate on table "public"."bank_accounts" to "service_role";

grant update on table "public"."bank_accounts" to "service_role";

grant delete on table "public"."child_care_requests" to "anon";

grant insert on table "public"."child_care_requests" to "anon";

grant references on table "public"."child_care_requests" to "anon";

grant select on table "public"."child_care_requests" to "anon";

grant trigger on table "public"."child_care_requests" to "anon";

grant truncate on table "public"."child_care_requests" to "anon";

grant update on table "public"."child_care_requests" to "anon";

grant delete on table "public"."child_care_requests" to "authenticated";

grant insert on table "public"."child_care_requests" to "authenticated";

grant references on table "public"."child_care_requests" to "authenticated";

grant select on table "public"."child_care_requests" to "authenticated";

grant trigger on table "public"."child_care_requests" to "authenticated";

grant truncate on table "public"."child_care_requests" to "authenticated";

grant update on table "public"."child_care_requests" to "authenticated";

grant delete on table "public"."child_care_requests" to "service_role";

grant insert on table "public"."child_care_requests" to "service_role";

grant references on table "public"."child_care_requests" to "service_role";

grant select on table "public"."child_care_requests" to "service_role";

grant trigger on table "public"."child_care_requests" to "service_role";

grant truncate on table "public"."child_care_requests" to "service_role";

grant update on table "public"."child_care_requests" to "service_role";

grant delete on table "public"."client_files" to "anon";

grant insert on table "public"."client_files" to "anon";

grant references on table "public"."client_files" to "anon";

grant select on table "public"."client_files" to "anon";

grant trigger on table "public"."client_files" to "anon";

grant truncate on table "public"."client_files" to "anon";

grant update on table "public"."client_files" to "anon";

grant delete on table "public"."client_files" to "authenticated";

grant insert on table "public"."client_files" to "authenticated";

grant references on table "public"."client_files" to "authenticated";

grant select on table "public"."client_files" to "authenticated";

grant trigger on table "public"."client_files" to "authenticated";

grant truncate on table "public"."client_files" to "authenticated";

grant update on table "public"."client_files" to "authenticated";

grant delete on table "public"."client_files" to "service_role";

grant insert on table "public"."client_files" to "service_role";

grant references on table "public"."client_files" to "service_role";

grant select on table "public"."client_files" to "service_role";

grant trigger on table "public"."client_files" to "service_role";

grant truncate on table "public"."client_files" to "service_role";

grant update on table "public"."client_files" to "service_role";

grant delete on table "public"."client_payment_line_items" to "anon";

grant insert on table "public"."client_payment_line_items" to "anon";

grant references on table "public"."client_payment_line_items" to "anon";

grant select on table "public"."client_payment_line_items" to "anon";

grant trigger on table "public"."client_payment_line_items" to "anon";

grant truncate on table "public"."client_payment_line_items" to "anon";

grant update on table "public"."client_payment_line_items" to "anon";

grant delete on table "public"."client_payment_line_items" to "authenticated";

grant insert on table "public"."client_payment_line_items" to "authenticated";

grant references on table "public"."client_payment_line_items" to "authenticated";

grant select on table "public"."client_payment_line_items" to "authenticated";

grant trigger on table "public"."client_payment_line_items" to "authenticated";

grant truncate on table "public"."client_payment_line_items" to "authenticated";

grant update on table "public"."client_payment_line_items" to "authenticated";

grant delete on table "public"."client_payment_line_items" to "service_role";

grant insert on table "public"."client_payment_line_items" to "service_role";

grant references on table "public"."client_payment_line_items" to "service_role";

grant select on table "public"."client_payment_line_items" to "service_role";

grant trigger on table "public"."client_payment_line_items" to "service_role";

grant truncate on table "public"."client_payment_line_items" to "service_role";

grant update on table "public"."client_payment_line_items" to "service_role";

grant delete on table "public"."client_payment_records" to "anon";

grant insert on table "public"."client_payment_records" to "anon";

grant references on table "public"."client_payment_records" to "anon";

grant select on table "public"."client_payment_records" to "anon";

grant trigger on table "public"."client_payment_records" to "anon";

grant truncate on table "public"."client_payment_records" to "anon";

grant update on table "public"."client_payment_records" to "anon";

grant delete on table "public"."client_payment_records" to "authenticated";

grant insert on table "public"."client_payment_records" to "authenticated";

grant references on table "public"."client_payment_records" to "authenticated";

grant select on table "public"."client_payment_records" to "authenticated";

grant trigger on table "public"."client_payment_records" to "authenticated";

grant truncate on table "public"."client_payment_records" to "authenticated";

grant update on table "public"."client_payment_records" to "authenticated";

grant delete on table "public"."client_payment_records" to "service_role";

grant insert on table "public"."client_payment_records" to "service_role";

grant references on table "public"."client_payment_records" to "service_role";

grant select on table "public"."client_payment_records" to "service_role";

grant trigger on table "public"."client_payment_records" to "service_role";

grant truncate on table "public"."client_payment_records" to "service_role";

grant update on table "public"."client_payment_records" to "service_role";

grant delete on table "public"."client_service_history" to "anon";

grant insert on table "public"."client_service_history" to "anon";

grant references on table "public"."client_service_history" to "anon";

grant select on table "public"."client_service_history" to "anon";

grant trigger on table "public"."client_service_history" to "anon";

grant truncate on table "public"."client_service_history" to "anon";

grant update on table "public"."client_service_history" to "anon";

grant delete on table "public"."client_service_history" to "authenticated";

grant insert on table "public"."client_service_history" to "authenticated";

grant references on table "public"."client_service_history" to "authenticated";

grant select on table "public"."client_service_history" to "authenticated";

grant trigger on table "public"."client_service_history" to "authenticated";

grant truncate on table "public"."client_service_history" to "authenticated";

grant update on table "public"."client_service_history" to "authenticated";

grant delete on table "public"."client_service_history" to "service_role";

grant insert on table "public"."client_service_history" to "service_role";

grant references on table "public"."client_service_history" to "service_role";

grant select on table "public"."client_service_history" to "service_role";

grant trigger on table "public"."client_service_history" to "service_role";

grant truncate on table "public"."client_service_history" to "service_role";

grant update on table "public"."client_service_history" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."course_abbreviations" to "anon";

grant insert on table "public"."course_abbreviations" to "anon";

grant references on table "public"."course_abbreviations" to "anon";

grant select on table "public"."course_abbreviations" to "anon";

grant trigger on table "public"."course_abbreviations" to "anon";

grant truncate on table "public"."course_abbreviations" to "anon";

grant update on table "public"."course_abbreviations" to "anon";

grant delete on table "public"."course_abbreviations" to "authenticated";

grant insert on table "public"."course_abbreviations" to "authenticated";

grant references on table "public"."course_abbreviations" to "authenticated";

grant select on table "public"."course_abbreviations" to "authenticated";

grant trigger on table "public"."course_abbreviations" to "authenticated";

grant truncate on table "public"."course_abbreviations" to "authenticated";

grant update on table "public"."course_abbreviations" to "authenticated";

grant delete on table "public"."course_abbreviations" to "service_role";

grant insert on table "public"."course_abbreviations" to "service_role";

grant references on table "public"."course_abbreviations" to "service_role";

grant select on table "public"."course_abbreviations" to "service_role";

grant trigger on table "public"."course_abbreviations" to "service_role";

grant truncate on table "public"."course_abbreviations" to "service_role";

grant update on table "public"."course_abbreviations" to "service_role";

grant delete on table "public"."crm_refund_payments" to "anon";

grant insert on table "public"."crm_refund_payments" to "anon";

grant references on table "public"."crm_refund_payments" to "anon";

grant select on table "public"."crm_refund_payments" to "anon";

grant trigger on table "public"."crm_refund_payments" to "anon";

grant truncate on table "public"."crm_refund_payments" to "anon";

grant update on table "public"."crm_refund_payments" to "anon";

grant delete on table "public"."crm_refund_payments" to "authenticated";

grant insert on table "public"."crm_refund_payments" to "authenticated";

grant references on table "public"."crm_refund_payments" to "authenticated";

grant select on table "public"."crm_refund_payments" to "authenticated";

grant trigger on table "public"."crm_refund_payments" to "authenticated";

grant truncate on table "public"."crm_refund_payments" to "authenticated";

grant update on table "public"."crm_refund_payments" to "authenticated";

grant delete on table "public"."crm_refund_payments" to "service_role";

grant insert on table "public"."crm_refund_payments" to "service_role";

grant references on table "public"."crm_refund_payments" to "service_role";

grant select on table "public"."crm_refund_payments" to "service_role";

grant trigger on table "public"."crm_refund_payments" to "service_role";

grant truncate on table "public"."crm_refund_payments" to "service_role";

grant update on table "public"."crm_refund_payments" to "service_role";

grant delete on table "public"."day_book" to "anon";

grant insert on table "public"."day_book" to "anon";

grant references on table "public"."day_book" to "anon";

grant select on table "public"."day_book" to "anon";

grant trigger on table "public"."day_book" to "anon";

grant truncate on table "public"."day_book" to "anon";

grant update on table "public"."day_book" to "anon";

grant delete on table "public"."day_book" to "authenticated";

grant insert on table "public"."day_book" to "authenticated";

grant references on table "public"."day_book" to "authenticated";

grant select on table "public"."day_book" to "authenticated";

grant trigger on table "public"."day_book" to "authenticated";

grant truncate on table "public"."day_book" to "authenticated";

grant update on table "public"."day_book" to "authenticated";

grant delete on table "public"."day_book" to "service_role";

grant insert on table "public"."day_book" to "service_role";

grant references on table "public"."day_book" to "service_role";

grant select on table "public"."day_book" to "service_role";

grant trigger on table "public"."day_book" to "service_role";

grant truncate on table "public"."day_book" to "service_role";

grant update on table "public"."day_book" to "service_role";

grant delete on table "public"."daybook_personal" to "anon";

grant insert on table "public"."daybook_personal" to "anon";

grant references on table "public"."daybook_personal" to "anon";

grant select on table "public"."daybook_personal" to "anon";

grant trigger on table "public"."daybook_personal" to "anon";

grant truncate on table "public"."daybook_personal" to "anon";

grant update on table "public"."daybook_personal" to "anon";

grant delete on table "public"."daybook_personal" to "authenticated";

grant insert on table "public"."daybook_personal" to "authenticated";

grant references on table "public"."daybook_personal" to "authenticated";

grant select on table "public"."daybook_personal" to "authenticated";

grant trigger on table "public"."daybook_personal" to "authenticated";

grant truncate on table "public"."daybook_personal" to "authenticated";

grant update on table "public"."daybook_personal" to "authenticated";

grant delete on table "public"."daybook_personal" to "service_role";

grant insert on table "public"."daybook_personal" to "service_role";

grant references on table "public"."daybook_personal" to "service_role";

grant select on table "public"."daybook_personal" to "service_role";

grant trigger on table "public"."daybook_personal" to "service_role";

grant truncate on table "public"."daybook_personal" to "service_role";

grant update on table "public"."daybook_personal" to "service_role";

grant delete on table "public"."dearcare_complaint_resolutions" to "anon";

grant insert on table "public"."dearcare_complaint_resolutions" to "anon";

grant references on table "public"."dearcare_complaint_resolutions" to "anon";

grant select on table "public"."dearcare_complaint_resolutions" to "anon";

grant trigger on table "public"."dearcare_complaint_resolutions" to "anon";

grant truncate on table "public"."dearcare_complaint_resolutions" to "anon";

grant update on table "public"."dearcare_complaint_resolutions" to "anon";

grant delete on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant insert on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant references on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant select on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant trigger on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant truncate on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant update on table "public"."dearcare_complaint_resolutions" to "authenticated";

grant delete on table "public"."dearcare_complaint_resolutions" to "service_role";

grant insert on table "public"."dearcare_complaint_resolutions" to "service_role";

grant references on table "public"."dearcare_complaint_resolutions" to "service_role";

grant select on table "public"."dearcare_complaint_resolutions" to "service_role";

grant trigger on table "public"."dearcare_complaint_resolutions" to "service_role";

grant truncate on table "public"."dearcare_complaint_resolutions" to "service_role";

grant update on table "public"."dearcare_complaint_resolutions" to "service_role";

grant delete on table "public"."dearcare_complaints" to "anon";

grant insert on table "public"."dearcare_complaints" to "anon";

grant references on table "public"."dearcare_complaints" to "anon";

grant select on table "public"."dearcare_complaints" to "anon";

grant trigger on table "public"."dearcare_complaints" to "anon";

grant truncate on table "public"."dearcare_complaints" to "anon";

grant update on table "public"."dearcare_complaints" to "anon";

grant delete on table "public"."dearcare_complaints" to "authenticated";

grant insert on table "public"."dearcare_complaints" to "authenticated";

grant references on table "public"."dearcare_complaints" to "authenticated";

grant select on table "public"."dearcare_complaints" to "authenticated";

grant trigger on table "public"."dearcare_complaints" to "authenticated";

grant truncate on table "public"."dearcare_complaints" to "authenticated";

grant update on table "public"."dearcare_complaints" to "authenticated";

grant delete on table "public"."dearcare_complaints" to "service_role";

grant insert on table "public"."dearcare_complaints" to "service_role";

grant references on table "public"."dearcare_complaints" to "service_role";

grant select on table "public"."dearcare_complaints" to "service_role";

grant trigger on table "public"."dearcare_complaints" to "service_role";

grant truncate on table "public"."dearcare_complaints" to "service_role";

grant update on table "public"."dearcare_complaints" to "service_role";

grant delete on table "public"."dearcare_salary_calculation_runs" to "anon";

grant insert on table "public"."dearcare_salary_calculation_runs" to "anon";

grant references on table "public"."dearcare_salary_calculation_runs" to "anon";

grant select on table "public"."dearcare_salary_calculation_runs" to "anon";

grant trigger on table "public"."dearcare_salary_calculation_runs" to "anon";

grant truncate on table "public"."dearcare_salary_calculation_runs" to "anon";

grant update on table "public"."dearcare_salary_calculation_runs" to "anon";

grant delete on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant insert on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant references on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant select on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant trigger on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant truncate on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant update on table "public"."dearcare_salary_calculation_runs" to "authenticated";

grant delete on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant insert on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant references on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant select on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant trigger on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant truncate on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant update on table "public"."dearcare_salary_calculation_runs" to "service_role";

grant delete on table "public"."dearcare_services_enquiries" to "anon";

grant insert on table "public"."dearcare_services_enquiries" to "anon";

grant references on table "public"."dearcare_services_enquiries" to "anon";

grant select on table "public"."dearcare_services_enquiries" to "anon";

grant trigger on table "public"."dearcare_services_enquiries" to "anon";

grant truncate on table "public"."dearcare_services_enquiries" to "anon";

grant update on table "public"."dearcare_services_enquiries" to "anon";

grant delete on table "public"."dearcare_services_enquiries" to "authenticated";

grant insert on table "public"."dearcare_services_enquiries" to "authenticated";

grant references on table "public"."dearcare_services_enquiries" to "authenticated";

grant select on table "public"."dearcare_services_enquiries" to "authenticated";

grant trigger on table "public"."dearcare_services_enquiries" to "authenticated";

grant truncate on table "public"."dearcare_services_enquiries" to "authenticated";

grant update on table "public"."dearcare_services_enquiries" to "authenticated";

grant delete on table "public"."dearcare_services_enquiries" to "service_role";

grant insert on table "public"."dearcare_services_enquiries" to "service_role";

grant references on table "public"."dearcare_services_enquiries" to "service_role";

grant select on table "public"."dearcare_services_enquiries" to "service_role";

grant trigger on table "public"."dearcare_services_enquiries" to "service_role";

grant truncate on table "public"."dearcare_services_enquiries" to "service_role";

grant update on table "public"."dearcare_services_enquiries" to "service_role";

grant delete on table "public"."dearcare_staff" to "anon";

grant insert on table "public"."dearcare_staff" to "anon";

grant references on table "public"."dearcare_staff" to "anon";

grant select on table "public"."dearcare_staff" to "anon";

grant trigger on table "public"."dearcare_staff" to "anon";

grant truncate on table "public"."dearcare_staff" to "anon";

grant update on table "public"."dearcare_staff" to "anon";

grant delete on table "public"."dearcare_staff" to "authenticated";

grant insert on table "public"."dearcare_staff" to "authenticated";

grant references on table "public"."dearcare_staff" to "authenticated";

grant select on table "public"."dearcare_staff" to "authenticated";

grant trigger on table "public"."dearcare_staff" to "authenticated";

grant truncate on table "public"."dearcare_staff" to "authenticated";

grant update on table "public"."dearcare_staff" to "authenticated";

grant delete on table "public"."dearcare_staff" to "service_role";

grant insert on table "public"."dearcare_staff" to "service_role";

grant references on table "public"."dearcare_staff" to "service_role";

grant select on table "public"."dearcare_staff" to "service_role";

grant trigger on table "public"."dearcare_staff" to "service_role";

grant truncate on table "public"."dearcare_staff" to "service_role";

grant update on table "public"."dearcare_staff" to "service_role";

grant delete on table "public"."dearcare_web_notifications" to "anon";

grant insert on table "public"."dearcare_web_notifications" to "anon";

grant references on table "public"."dearcare_web_notifications" to "anon";

grant select on table "public"."dearcare_web_notifications" to "anon";

grant trigger on table "public"."dearcare_web_notifications" to "anon";

grant truncate on table "public"."dearcare_web_notifications" to "anon";

grant update on table "public"."dearcare_web_notifications" to "anon";

grant delete on table "public"."dearcare_web_notifications" to "authenticated";

grant insert on table "public"."dearcare_web_notifications" to "authenticated";

grant references on table "public"."dearcare_web_notifications" to "authenticated";

grant select on table "public"."dearcare_web_notifications" to "authenticated";

grant trigger on table "public"."dearcare_web_notifications" to "authenticated";

grant truncate on table "public"."dearcare_web_notifications" to "authenticated";

grant update on table "public"."dearcare_web_notifications" to "authenticated";

grant delete on table "public"."dearcare_web_notifications" to "service_role";

grant insert on table "public"."dearcare_web_notifications" to "service_role";

grant references on table "public"."dearcare_web_notifications" to "service_role";

grant select on table "public"."dearcare_web_notifications" to "service_role";

grant trigger on table "public"."dearcare_web_notifications" to "service_role";

grant truncate on table "public"."dearcare_web_notifications" to "service_role";

grant update on table "public"."dearcare_web_notifications" to "service_role";

grant delete on table "public"."dearcare_web_users" to "anon";

grant insert on table "public"."dearcare_web_users" to "anon";

grant references on table "public"."dearcare_web_users" to "anon";

grant select on table "public"."dearcare_web_users" to "anon";

grant trigger on table "public"."dearcare_web_users" to "anon";

grant truncate on table "public"."dearcare_web_users" to "anon";

grant update on table "public"."dearcare_web_users" to "anon";

grant delete on table "public"."dearcare_web_users" to "authenticated";

grant insert on table "public"."dearcare_web_users" to "authenticated";

grant references on table "public"."dearcare_web_users" to "authenticated";

grant select on table "public"."dearcare_web_users" to "authenticated";

grant trigger on table "public"."dearcare_web_users" to "authenticated";

grant truncate on table "public"."dearcare_web_users" to "authenticated";

grant update on table "public"."dearcare_web_users" to "authenticated";

grant delete on table "public"."dearcare_web_users" to "service_role";

grant insert on table "public"."dearcare_web_users" to "service_role";

grant references on table "public"."dearcare_web_users" to "service_role";

grant select on table "public"."dearcare_web_users" to "service_role";

grant trigger on table "public"."dearcare_web_users" to "service_role";

grant truncate on table "public"."dearcare_web_users" to "service_role";

grant update on table "public"."dearcare_web_users" to "service_role";

grant delete on table "public"."faculty_assignment" to "anon";

grant insert on table "public"."faculty_assignment" to "anon";

grant references on table "public"."faculty_assignment" to "anon";

grant select on table "public"."faculty_assignment" to "anon";

grant trigger on table "public"."faculty_assignment" to "anon";

grant truncate on table "public"."faculty_assignment" to "anon";

grant update on table "public"."faculty_assignment" to "anon";

grant delete on table "public"."faculty_assignment" to "authenticated";

grant insert on table "public"."faculty_assignment" to "authenticated";

grant references on table "public"."faculty_assignment" to "authenticated";

grant select on table "public"."faculty_assignment" to "authenticated";

grant trigger on table "public"."faculty_assignment" to "authenticated";

grant truncate on table "public"."faculty_assignment" to "authenticated";

grant update on table "public"."faculty_assignment" to "authenticated";

grant delete on table "public"."faculty_assignment" to "service_role";

grant insert on table "public"."faculty_assignment" to "service_role";

grant references on table "public"."faculty_assignment" to "service_role";

grant select on table "public"."faculty_assignment" to "service_role";

grant trigger on table "public"."faculty_assignment" to "service_role";

grant truncate on table "public"."faculty_assignment" to "service_role";

grant update on table "public"."faculty_assignment" to "service_role";

grant delete on table "public"."faculty_experiences" to "anon";

grant insert on table "public"."faculty_experiences" to "anon";

grant references on table "public"."faculty_experiences" to "anon";

grant select on table "public"."faculty_experiences" to "anon";

grant trigger on table "public"."faculty_experiences" to "anon";

grant truncate on table "public"."faculty_experiences" to "anon";

grant update on table "public"."faculty_experiences" to "anon";

grant delete on table "public"."faculty_experiences" to "authenticated";

grant insert on table "public"."faculty_experiences" to "authenticated";

grant references on table "public"."faculty_experiences" to "authenticated";

grant select on table "public"."faculty_experiences" to "authenticated";

grant trigger on table "public"."faculty_experiences" to "authenticated";

grant truncate on table "public"."faculty_experiences" to "authenticated";

grant update on table "public"."faculty_experiences" to "authenticated";

grant delete on table "public"."faculty_experiences" to "service_role";

grant insert on table "public"."faculty_experiences" to "service_role";

grant references on table "public"."faculty_experiences" to "service_role";

grant select on table "public"."faculty_experiences" to "service_role";

grant trigger on table "public"."faculty_experiences" to "service_role";

grant truncate on table "public"."faculty_experiences" to "service_role";

grant update on table "public"."faculty_experiences" to "service_role";

grant delete on table "public"."faculty_register_seq" to "anon";

grant insert on table "public"."faculty_register_seq" to "anon";

grant references on table "public"."faculty_register_seq" to "anon";

grant select on table "public"."faculty_register_seq" to "anon";

grant trigger on table "public"."faculty_register_seq" to "anon";

grant truncate on table "public"."faculty_register_seq" to "anon";

grant update on table "public"."faculty_register_seq" to "anon";

grant delete on table "public"."faculty_register_seq" to "authenticated";

grant insert on table "public"."faculty_register_seq" to "authenticated";

grant references on table "public"."faculty_register_seq" to "authenticated";

grant select on table "public"."faculty_register_seq" to "authenticated";

grant trigger on table "public"."faculty_register_seq" to "authenticated";

grant truncate on table "public"."faculty_register_seq" to "authenticated";

grant update on table "public"."faculty_register_seq" to "authenticated";

grant delete on table "public"."faculty_register_seq" to "service_role";

grant insert on table "public"."faculty_register_seq" to "service_role";

grant references on table "public"."faculty_register_seq" to "service_role";

grant select on table "public"."faculty_register_seq" to "service_role";

grant trigger on table "public"."faculty_register_seq" to "service_role";

grant truncate on table "public"."faculty_register_seq" to "service_role";

grant update on table "public"."faculty_register_seq" to "service_role";

grant delete on table "public"."housemaid_requests" to "anon";

grant insert on table "public"."housemaid_requests" to "anon";

grant references on table "public"."housemaid_requests" to "anon";

grant select on table "public"."housemaid_requests" to "anon";

grant trigger on table "public"."housemaid_requests" to "anon";

grant truncate on table "public"."housemaid_requests" to "anon";

grant update on table "public"."housemaid_requests" to "anon";

grant delete on table "public"."housemaid_requests" to "authenticated";

grant insert on table "public"."housemaid_requests" to "authenticated";

grant references on table "public"."housemaid_requests" to "authenticated";

grant select on table "public"."housemaid_requests" to "authenticated";

grant trigger on table "public"."housemaid_requests" to "authenticated";

grant truncate on table "public"."housemaid_requests" to "authenticated";

grant update on table "public"."housemaid_requests" to "authenticated";

grant delete on table "public"."housemaid_requests" to "service_role";

grant insert on table "public"."housemaid_requests" to "service_role";

grant references on table "public"."housemaid_requests" to "service_role";

grant select on table "public"."housemaid_requests" to "service_role";

grant trigger on table "public"."housemaid_requests" to "service_role";

grant truncate on table "public"."housemaid_requests" to "service_role";

grant update on table "public"."housemaid_requests" to "service_role";

grant delete on table "public"."individual_clients" to "anon";

grant insert on table "public"."individual_clients" to "anon";

grant references on table "public"."individual_clients" to "anon";

grant select on table "public"."individual_clients" to "anon";

grant trigger on table "public"."individual_clients" to "anon";

grant truncate on table "public"."individual_clients" to "anon";

grant update on table "public"."individual_clients" to "anon";

grant delete on table "public"."individual_clients" to "authenticated";

grant insert on table "public"."individual_clients" to "authenticated";

grant references on table "public"."individual_clients" to "authenticated";

grant select on table "public"."individual_clients" to "authenticated";

grant trigger on table "public"."individual_clients" to "authenticated";

grant truncate on table "public"."individual_clients" to "authenticated";

grant update on table "public"."individual_clients" to "authenticated";

grant delete on table "public"."individual_clients" to "service_role";

grant insert on table "public"."individual_clients" to "service_role";

grant references on table "public"."individual_clients" to "service_role";

grant select on table "public"."individual_clients" to "service_role";

grant trigger on table "public"."individual_clients" to "service_role";

grant truncate on table "public"."individual_clients" to "service_role";

grant update on table "public"."individual_clients" to "service_role";

grant delete on table "public"."nurse_client" to "anon";

grant insert on table "public"."nurse_client" to "anon";

grant references on table "public"."nurse_client" to "anon";

grant select on table "public"."nurse_client" to "anon";

grant trigger on table "public"."nurse_client" to "anon";

grant truncate on table "public"."nurse_client" to "anon";

grant update on table "public"."nurse_client" to "anon";

grant delete on table "public"."nurse_client" to "authenticated";

grant insert on table "public"."nurse_client" to "authenticated";

grant references on table "public"."nurse_client" to "authenticated";

grant select on table "public"."nurse_client" to "authenticated";

grant trigger on table "public"."nurse_client" to "authenticated";

grant truncate on table "public"."nurse_client" to "authenticated";

grant update on table "public"."nurse_client" to "authenticated";

grant delete on table "public"."nurse_client" to "service_role";

grant insert on table "public"."nurse_client" to "service_role";

grant references on table "public"."nurse_client" to "service_role";

grant select on table "public"."nurse_client" to "service_role";

grant trigger on table "public"."nurse_client" to "service_role";

grant truncate on table "public"."nurse_client" to "service_role";

grant update on table "public"."nurse_client" to "service_role";

grant delete on table "public"."nurse_health" to "anon";

grant insert on table "public"."nurse_health" to "anon";

grant references on table "public"."nurse_health" to "anon";

grant select on table "public"."nurse_health" to "anon";

grant trigger on table "public"."nurse_health" to "anon";

grant truncate on table "public"."nurse_health" to "anon";

grant update on table "public"."nurse_health" to "anon";

grant delete on table "public"."nurse_health" to "authenticated";

grant insert on table "public"."nurse_health" to "authenticated";

grant references on table "public"."nurse_health" to "authenticated";

grant select on table "public"."nurse_health" to "authenticated";

grant trigger on table "public"."nurse_health" to "authenticated";

grant truncate on table "public"."nurse_health" to "authenticated";

grant update on table "public"."nurse_health" to "authenticated";

grant delete on table "public"."nurse_health" to "service_role";

grant insert on table "public"."nurse_health" to "service_role";

grant references on table "public"."nurse_health" to "service_role";

grant select on table "public"."nurse_health" to "service_role";

grant trigger on table "public"."nurse_health" to "service_role";

grant truncate on table "public"."nurse_health" to "service_role";

grant update on table "public"."nurse_health" to "service_role";

grant delete on table "public"."nurse_leave_requests" to "anon";

grant insert on table "public"."nurse_leave_requests" to "anon";

grant references on table "public"."nurse_leave_requests" to "anon";

grant select on table "public"."nurse_leave_requests" to "anon";

grant trigger on table "public"."nurse_leave_requests" to "anon";

grant truncate on table "public"."nurse_leave_requests" to "anon";

grant update on table "public"."nurse_leave_requests" to "anon";

grant delete on table "public"."nurse_leave_requests" to "authenticated";

grant insert on table "public"."nurse_leave_requests" to "authenticated";

grant references on table "public"."nurse_leave_requests" to "authenticated";

grant select on table "public"."nurse_leave_requests" to "authenticated";

grant trigger on table "public"."nurse_leave_requests" to "authenticated";

grant truncate on table "public"."nurse_leave_requests" to "authenticated";

grant update on table "public"."nurse_leave_requests" to "authenticated";

grant delete on table "public"."nurse_leave_requests" to "service_role";

grant insert on table "public"."nurse_leave_requests" to "service_role";

grant references on table "public"."nurse_leave_requests" to "service_role";

grant select on table "public"."nurse_leave_requests" to "service_role";

grant trigger on table "public"."nurse_leave_requests" to "service_role";

grant truncate on table "public"."nurse_leave_requests" to "service_role";

grant update on table "public"."nurse_leave_requests" to "service_role";

grant delete on table "public"."nurse_references" to "anon";

grant insert on table "public"."nurse_references" to "anon";

grant references on table "public"."nurse_references" to "anon";

grant select on table "public"."nurse_references" to "anon";

grant trigger on table "public"."nurse_references" to "anon";

grant truncate on table "public"."nurse_references" to "anon";

grant update on table "public"."nurse_references" to "anon";

grant delete on table "public"."nurse_references" to "authenticated";

grant insert on table "public"."nurse_references" to "authenticated";

grant references on table "public"."nurse_references" to "authenticated";

grant select on table "public"."nurse_references" to "authenticated";

grant trigger on table "public"."nurse_references" to "authenticated";

grant truncate on table "public"."nurse_references" to "authenticated";

grant update on table "public"."nurse_references" to "authenticated";

grant delete on table "public"."nurse_references" to "service_role";

grant insert on table "public"."nurse_references" to "service_role";

grant references on table "public"."nurse_references" to "service_role";

grant select on table "public"."nurse_references" to "service_role";

grant trigger on table "public"."nurse_references" to "service_role";

grant truncate on table "public"."nurse_references" to "service_role";

grant update on table "public"."nurse_references" to "service_role";

grant delete on table "public"."nurses" to "anon";

grant insert on table "public"."nurses" to "anon";

grant references on table "public"."nurses" to "anon";

grant select on table "public"."nurses" to "anon";

grant trigger on table "public"."nurses" to "anon";

grant truncate on table "public"."nurses" to "anon";

grant update on table "public"."nurses" to "anon";

grant delete on table "public"."nurses" to "authenticated";

grant insert on table "public"."nurses" to "authenticated";

grant references on table "public"."nurses" to "authenticated";

grant select on table "public"."nurses" to "authenticated";

grant trigger on table "public"."nurses" to "authenticated";

grant truncate on table "public"."nurses" to "authenticated";

grant update on table "public"."nurses" to "authenticated";

grant delete on table "public"."nurses" to "service_role";

grant insert on table "public"."nurses" to "service_role";

grant references on table "public"."nurses" to "service_role";

grant select on table "public"."nurses" to "service_role";

grant trigger on table "public"."nurses" to "service_role";

grant truncate on table "public"."nurses" to "service_role";

grant update on table "public"."nurses" to "service_role";

grant delete on table "public"."organization_clients" to "anon";

grant insert on table "public"."organization_clients" to "anon";

grant references on table "public"."organization_clients" to "anon";

grant select on table "public"."organization_clients" to "anon";

grant trigger on table "public"."organization_clients" to "anon";

grant truncate on table "public"."organization_clients" to "anon";

grant update on table "public"."organization_clients" to "anon";

grant delete on table "public"."organization_clients" to "authenticated";

grant insert on table "public"."organization_clients" to "authenticated";

grant references on table "public"."organization_clients" to "authenticated";

grant select on table "public"."organization_clients" to "authenticated";

grant trigger on table "public"."organization_clients" to "authenticated";

grant truncate on table "public"."organization_clients" to "authenticated";

grant update on table "public"."organization_clients" to "authenticated";

grant delete on table "public"."organization_clients" to "service_role";

grant insert on table "public"."organization_clients" to "service_role";

grant references on table "public"."organization_clients" to "service_role";

grant select on table "public"."organization_clients" to "service_role";

grant trigger on table "public"."organization_clients" to "service_role";

grant truncate on table "public"."organization_clients" to "service_role";

grant update on table "public"."organization_clients" to "service_role";

grant delete on table "public"."otp" to "anon";

grant insert on table "public"."otp" to "anon";

grant references on table "public"."otp" to "anon";

grant select on table "public"."otp" to "anon";

grant trigger on table "public"."otp" to "anon";

grant truncate on table "public"."otp" to "anon";

grant update on table "public"."otp" to "anon";

grant delete on table "public"."otp" to "authenticated";

grant insert on table "public"."otp" to "authenticated";

grant references on table "public"."otp" to "authenticated";

grant select on table "public"."otp" to "authenticated";

grant trigger on table "public"."otp" to "authenticated";

grant truncate on table "public"."otp" to "authenticated";

grant update on table "public"."otp" to "authenticated";

grant delete on table "public"."otp" to "service_role";

grant insert on table "public"."otp" to "service_role";

grant references on table "public"."otp" to "service_role";

grant select on table "public"."otp" to "service_role";

grant trigger on table "public"."otp" to "service_role";

grant truncate on table "public"."otp" to "service_role";

grant update on table "public"."otp" to "service_role";

grant delete on table "public"."patient_assessments" to "anon";

grant insert on table "public"."patient_assessments" to "anon";

grant references on table "public"."patient_assessments" to "anon";

grant select on table "public"."patient_assessments" to "anon";

grant trigger on table "public"."patient_assessments" to "anon";

grant truncate on table "public"."patient_assessments" to "anon";

grant update on table "public"."patient_assessments" to "anon";

grant delete on table "public"."patient_assessments" to "authenticated";

grant insert on table "public"."patient_assessments" to "authenticated";

grant references on table "public"."patient_assessments" to "authenticated";

grant select on table "public"."patient_assessments" to "authenticated";

grant trigger on table "public"."patient_assessments" to "authenticated";

grant truncate on table "public"."patient_assessments" to "authenticated";

grant update on table "public"."patient_assessments" to "authenticated";

grant delete on table "public"."patient_assessments" to "service_role";

grant insert on table "public"."patient_assessments" to "service_role";

grant references on table "public"."patient_assessments" to "service_role";

grant select on table "public"."patient_assessments" to "service_role";

grant trigger on table "public"."patient_assessments" to "service_role";

grant truncate on table "public"."patient_assessments" to "service_role";

grant update on table "public"."patient_assessments" to "service_role";

grant delete on table "public"."reassessment" to "anon";

grant insert on table "public"."reassessment" to "anon";

grant references on table "public"."reassessment" to "anon";

grant select on table "public"."reassessment" to "anon";

grant trigger on table "public"."reassessment" to "anon";

grant truncate on table "public"."reassessment" to "anon";

grant update on table "public"."reassessment" to "anon";

grant delete on table "public"."reassessment" to "authenticated";

grant insert on table "public"."reassessment" to "authenticated";

grant references on table "public"."reassessment" to "authenticated";

grant select on table "public"."reassessment" to "authenticated";

grant trigger on table "public"."reassessment" to "authenticated";

grant truncate on table "public"."reassessment" to "authenticated";

grant update on table "public"."reassessment" to "authenticated";

grant delete on table "public"."reassessment" to "service_role";

grant insert on table "public"."reassessment" to "service_role";

grant references on table "public"."reassessment" to "service_role";

grant select on table "public"."reassessment" to "service_role";

grant trigger on table "public"."reassessment" to "service_role";

grant truncate on table "public"."reassessment" to "service_role";

grant update on table "public"."reassessment" to "service_role";

grant delete on table "public"."registration_counters" to "anon";

grant insert on table "public"."registration_counters" to "anon";

grant references on table "public"."registration_counters" to "anon";

grant select on table "public"."registration_counters" to "anon";

grant trigger on table "public"."registration_counters" to "anon";

grant truncate on table "public"."registration_counters" to "anon";

grant update on table "public"."registration_counters" to "anon";

grant delete on table "public"."registration_counters" to "authenticated";

grant insert on table "public"."registration_counters" to "authenticated";

grant references on table "public"."registration_counters" to "authenticated";

grant select on table "public"."registration_counters" to "authenticated";

grant trigger on table "public"."registration_counters" to "authenticated";

grant truncate on table "public"."registration_counters" to "authenticated";

grant update on table "public"."registration_counters" to "authenticated";

grant delete on table "public"."registration_counters" to "service_role";

grant insert on table "public"."registration_counters" to "service_role";

grant references on table "public"."registration_counters" to "service_role";

grant select on table "public"."registration_counters" to "service_role";

grant trigger on table "public"."registration_counters" to "service_role";

grant truncate on table "public"."registration_counters" to "service_role";

grant update on table "public"."registration_counters" to "service_role";

grant delete on table "public"."reminders" to "anon";

grant insert on table "public"."reminders" to "anon";

grant references on table "public"."reminders" to "anon";

grant select on table "public"."reminders" to "anon";

grant trigger on table "public"."reminders" to "anon";

grant truncate on table "public"."reminders" to "anon";

grant update on table "public"."reminders" to "anon";

grant delete on table "public"."reminders" to "authenticated";

grant insert on table "public"."reminders" to "authenticated";

grant references on table "public"."reminders" to "authenticated";

grant select on table "public"."reminders" to "authenticated";

grant trigger on table "public"."reminders" to "authenticated";

grant truncate on table "public"."reminders" to "authenticated";

grant update on table "public"."reminders" to "authenticated";

grant delete on table "public"."reminders" to "service_role";

grant insert on table "public"."reminders" to "service_role";

grant references on table "public"."reminders" to "service_role";

grant select on table "public"."reminders" to "service_role";

grant trigger on table "public"."reminders" to "service_role";

grant truncate on table "public"."reminders" to "service_role";

grant update on table "public"."reminders" to "service_role";

grant delete on table "public"."salary_configurations" to "anon";

grant insert on table "public"."salary_configurations" to "anon";

grant references on table "public"."salary_configurations" to "anon";

grant select on table "public"."salary_configurations" to "anon";

grant trigger on table "public"."salary_configurations" to "anon";

grant truncate on table "public"."salary_configurations" to "anon";

grant update on table "public"."salary_configurations" to "anon";

grant delete on table "public"."salary_configurations" to "authenticated";

grant insert on table "public"."salary_configurations" to "authenticated";

grant references on table "public"."salary_configurations" to "authenticated";

grant select on table "public"."salary_configurations" to "authenticated";

grant trigger on table "public"."salary_configurations" to "authenticated";

grant truncate on table "public"."salary_configurations" to "authenticated";

grant update on table "public"."salary_configurations" to "authenticated";

grant delete on table "public"."salary_configurations" to "service_role";

grant insert on table "public"."salary_configurations" to "service_role";

grant references on table "public"."salary_configurations" to "service_role";

grant select on table "public"."salary_configurations" to "service_role";

grant trigger on table "public"."salary_configurations" to "service_role";

grant truncate on table "public"."salary_configurations" to "service_role";

grant update on table "public"."salary_configurations" to "service_role";

grant delete on table "public"."salary_payments" to "anon";

grant insert on table "public"."salary_payments" to "anon";

grant references on table "public"."salary_payments" to "anon";

grant select on table "public"."salary_payments" to "anon";

grant trigger on table "public"."salary_payments" to "anon";

grant truncate on table "public"."salary_payments" to "anon";

grant update on table "public"."salary_payments" to "anon";

grant delete on table "public"."salary_payments" to "authenticated";

grant insert on table "public"."salary_payments" to "authenticated";

grant references on table "public"."salary_payments" to "authenticated";

grant select on table "public"."salary_payments" to "authenticated";

grant trigger on table "public"."salary_payments" to "authenticated";

grant truncate on table "public"."salary_payments" to "authenticated";

grant update on table "public"."salary_payments" to "authenticated";

grant delete on table "public"."salary_payments" to "service_role";

grant insert on table "public"."salary_payments" to "service_role";

grant references on table "public"."salary_payments" to "service_role";

grant select on table "public"."salary_payments" to "service_role";

grant trigger on table "public"."salary_payments" to "service_role";

grant truncate on table "public"."salary_payments" to "service_role";

grant update on table "public"."salary_payments" to "service_role";

grant delete on table "public"."scheduled_notifications" to "anon";

grant insert on table "public"."scheduled_notifications" to "anon";

grant references on table "public"."scheduled_notifications" to "anon";

grant select on table "public"."scheduled_notifications" to "anon";

grant trigger on table "public"."scheduled_notifications" to "anon";

grant truncate on table "public"."scheduled_notifications" to "anon";

grant update on table "public"."scheduled_notifications" to "anon";

grant delete on table "public"."scheduled_notifications" to "authenticated";

grant insert on table "public"."scheduled_notifications" to "authenticated";

grant references on table "public"."scheduled_notifications" to "authenticated";

grant select on table "public"."scheduled_notifications" to "authenticated";

grant trigger on table "public"."scheduled_notifications" to "authenticated";

grant truncate on table "public"."scheduled_notifications" to "authenticated";

grant update on table "public"."scheduled_notifications" to "authenticated";

grant delete on table "public"."scheduled_notifications" to "service_role";

grant insert on table "public"."scheduled_notifications" to "service_role";

grant references on table "public"."scheduled_notifications" to "service_role";

grant select on table "public"."scheduled_notifications" to "service_role";

grant trigger on table "public"."scheduled_notifications" to "service_role";

grant truncate on table "public"."scheduled_notifications" to "service_role";

grant update on table "public"."scheduled_notifications" to "service_role";

grant delete on table "public"."shift_summary" to "anon";

grant insert on table "public"."shift_summary" to "anon";

grant references on table "public"."shift_summary" to "anon";

grant select on table "public"."shift_summary" to "anon";

grant trigger on table "public"."shift_summary" to "anon";

grant truncate on table "public"."shift_summary" to "anon";

grant update on table "public"."shift_summary" to "anon";

grant delete on table "public"."shift_summary" to "authenticated";

grant insert on table "public"."shift_summary" to "authenticated";

grant references on table "public"."shift_summary" to "authenticated";

grant select on table "public"."shift_summary" to "authenticated";

grant trigger on table "public"."shift_summary" to "authenticated";

grant truncate on table "public"."shift_summary" to "authenticated";

grant update on table "public"."shift_summary" to "authenticated";

grant delete on table "public"."shift_summary" to "service_role";

grant insert on table "public"."shift_summary" to "service_role";

grant references on table "public"."shift_summary" to "service_role";

grant select on table "public"."shift_summary" to "service_role";

grant trigger on table "public"."shift_summary" to "service_role";

grant truncate on table "public"."shift_summary" to "service_role";

grant update on table "public"."shift_summary" to "service_role";

grant delete on table "public"."staff_requirements" to "anon";

grant insert on table "public"."staff_requirements" to "anon";

grant references on table "public"."staff_requirements" to "anon";

grant select on table "public"."staff_requirements" to "anon";

grant trigger on table "public"."staff_requirements" to "anon";

grant truncate on table "public"."staff_requirements" to "anon";

grant update on table "public"."staff_requirements" to "anon";

grant delete on table "public"."staff_requirements" to "authenticated";

grant insert on table "public"."staff_requirements" to "authenticated";

grant references on table "public"."staff_requirements" to "authenticated";

grant select on table "public"."staff_requirements" to "authenticated";

grant trigger on table "public"."staff_requirements" to "authenticated";

grant truncate on table "public"."staff_requirements" to "authenticated";

grant update on table "public"."staff_requirements" to "authenticated";

grant delete on table "public"."staff_requirements" to "service_role";

grant insert on table "public"."staff_requirements" to "service_role";

grant references on table "public"."staff_requirements" to "service_role";

grant select on table "public"."staff_requirements" to "service_role";

grant trigger on table "public"."staff_requirements" to "service_role";

grant truncate on table "public"."staff_requirements" to "service_role";

grant update on table "public"."staff_requirements" to "service_role";

grant delete on table "public"."student_academics" to "anon";

grant insert on table "public"."student_academics" to "anon";

grant references on table "public"."student_academics" to "anon";

grant select on table "public"."student_academics" to "anon";

grant trigger on table "public"."student_academics" to "anon";

grant truncate on table "public"."student_academics" to "anon";

grant update on table "public"."student_academics" to "anon";

grant delete on table "public"."student_academics" to "authenticated";

grant insert on table "public"."student_academics" to "authenticated";

grant references on table "public"."student_academics" to "authenticated";

grant select on table "public"."student_academics" to "authenticated";

grant trigger on table "public"."student_academics" to "authenticated";

grant truncate on table "public"."student_academics" to "authenticated";

grant update on table "public"."student_academics" to "authenticated";

grant delete on table "public"."student_academics" to "service_role";

grant insert on table "public"."student_academics" to "service_role";

grant references on table "public"."student_academics" to "service_role";

grant select on table "public"."student_academics" to "service_role";

grant trigger on table "public"."student_academics" to "service_role";

grant truncate on table "public"."student_academics" to "service_role";

grant update on table "public"."student_academics" to "service_role";

grant delete on table "public"."student_experience" to "anon";

grant insert on table "public"."student_experience" to "anon";

grant references on table "public"."student_experience" to "anon";

grant select on table "public"."student_experience" to "anon";

grant trigger on table "public"."student_experience" to "anon";

grant truncate on table "public"."student_experience" to "anon";

grant update on table "public"."student_experience" to "anon";

grant delete on table "public"."student_experience" to "authenticated";

grant insert on table "public"."student_experience" to "authenticated";

grant references on table "public"."student_experience" to "authenticated";

grant select on table "public"."student_experience" to "authenticated";

grant trigger on table "public"."student_experience" to "authenticated";

grant truncate on table "public"."student_experience" to "authenticated";

grant update on table "public"."student_experience" to "authenticated";

grant delete on table "public"."student_experience" to "service_role";

grant insert on table "public"."student_experience" to "service_role";

grant references on table "public"."student_experience" to "service_role";

grant select on table "public"."student_experience" to "service_role";

grant trigger on table "public"."student_experience" to "service_role";

grant truncate on table "public"."student_experience" to "service_role";

grant update on table "public"."student_experience" to "service_role";

grant delete on table "public"."student_guardian" to "anon";

grant insert on table "public"."student_guardian" to "anon";

grant references on table "public"."student_guardian" to "anon";

grant select on table "public"."student_guardian" to "anon";

grant trigger on table "public"."student_guardian" to "anon";

grant truncate on table "public"."student_guardian" to "anon";

grant update on table "public"."student_guardian" to "anon";

grant delete on table "public"."student_guardian" to "authenticated";

grant insert on table "public"."student_guardian" to "authenticated";

grant references on table "public"."student_guardian" to "authenticated";

grant select on table "public"."student_guardian" to "authenticated";

grant trigger on table "public"."student_guardian" to "authenticated";

grant truncate on table "public"."student_guardian" to "authenticated";

grant update on table "public"."student_guardian" to "authenticated";

grant delete on table "public"."student_guardian" to "service_role";

grant insert on table "public"."student_guardian" to "service_role";

grant references on table "public"."student_guardian" to "service_role";

grant select on table "public"."student_guardian" to "service_role";

grant trigger on table "public"."student_guardian" to "service_role";

grant truncate on table "public"."student_guardian" to "service_role";

grant update on table "public"."student_guardian" to "service_role";

grant delete on table "public"."student_leave_request" to "anon";

grant insert on table "public"."student_leave_request" to "anon";

grant references on table "public"."student_leave_request" to "anon";

grant select on table "public"."student_leave_request" to "anon";

grant trigger on table "public"."student_leave_request" to "anon";

grant truncate on table "public"."student_leave_request" to "anon";

grant update on table "public"."student_leave_request" to "anon";

grant delete on table "public"."student_leave_request" to "authenticated";

grant insert on table "public"."student_leave_request" to "authenticated";

grant references on table "public"."student_leave_request" to "authenticated";

grant select on table "public"."student_leave_request" to "authenticated";

grant trigger on table "public"."student_leave_request" to "authenticated";

grant truncate on table "public"."student_leave_request" to "authenticated";

grant update on table "public"."student_leave_request" to "authenticated";

grant delete on table "public"."student_leave_request" to "service_role";

grant insert on table "public"."student_leave_request" to "service_role";

grant references on table "public"."student_leave_request" to "service_role";

grant select on table "public"."student_leave_request" to "service_role";

grant trigger on table "public"."student_leave_request" to "service_role";

grant truncate on table "public"."student_leave_request" to "service_role";

grant update on table "public"."student_leave_request" to "service_role";

grant delete on table "public"."student_preferences" to "anon";

grant insert on table "public"."student_preferences" to "anon";

grant references on table "public"."student_preferences" to "anon";

grant select on table "public"."student_preferences" to "anon";

grant trigger on table "public"."student_preferences" to "anon";

grant truncate on table "public"."student_preferences" to "anon";

grant update on table "public"."student_preferences" to "anon";

grant delete on table "public"."student_preferences" to "authenticated";

grant insert on table "public"."student_preferences" to "authenticated";

grant references on table "public"."student_preferences" to "authenticated";

grant select on table "public"."student_preferences" to "authenticated";

grant trigger on table "public"."student_preferences" to "authenticated";

grant truncate on table "public"."student_preferences" to "authenticated";

grant update on table "public"."student_preferences" to "authenticated";

grant delete on table "public"."student_preferences" to "service_role";

grant insert on table "public"."student_preferences" to "service_role";

grant references on table "public"."student_preferences" to "service_role";

grant select on table "public"."student_preferences" to "service_role";

grant trigger on table "public"."student_preferences" to "service_role";

grant truncate on table "public"."student_preferences" to "service_role";

grant update on table "public"."student_preferences" to "service_role";

grant delete on table "public"."student_register_seq" to "anon";

grant insert on table "public"."student_register_seq" to "anon";

grant references on table "public"."student_register_seq" to "anon";

grant select on table "public"."student_register_seq" to "anon";

grant trigger on table "public"."student_register_seq" to "anon";

grant truncate on table "public"."student_register_seq" to "anon";

grant update on table "public"."student_register_seq" to "anon";

grant delete on table "public"."student_register_seq" to "authenticated";

grant insert on table "public"."student_register_seq" to "authenticated";

grant references on table "public"."student_register_seq" to "authenticated";

grant select on table "public"."student_register_seq" to "authenticated";

grant trigger on table "public"."student_register_seq" to "authenticated";

grant truncate on table "public"."student_register_seq" to "authenticated";

grant update on table "public"."student_register_seq" to "authenticated";

grant delete on table "public"."student_register_seq" to "service_role";

grant insert on table "public"."student_register_seq" to "service_role";

grant references on table "public"."student_register_seq" to "service_role";

grant select on table "public"."student_register_seq" to "service_role";

grant trigger on table "public"."student_register_seq" to "service_role";

grant truncate on table "public"."student_register_seq" to "service_role";

grant update on table "public"."student_register_seq" to "service_role";

grant delete on table "public"."student_source" to "anon";

grant insert on table "public"."student_source" to "anon";

grant references on table "public"."student_source" to "anon";

grant select on table "public"."student_source" to "anon";

grant trigger on table "public"."student_source" to "anon";

grant truncate on table "public"."student_source" to "anon";

grant update on table "public"."student_source" to "anon";

grant delete on table "public"."student_source" to "authenticated";

grant insert on table "public"."student_source" to "authenticated";

grant references on table "public"."student_source" to "authenticated";

grant select on table "public"."student_source" to "authenticated";

grant trigger on table "public"."student_source" to "authenticated";

grant truncate on table "public"."student_source" to "authenticated";

grant update on table "public"."student_source" to "authenticated";

grant delete on table "public"."student_source" to "service_role";

grant insert on table "public"."student_source" to "service_role";

grant references on table "public"."student_source" to "service_role";

grant select on table "public"."student_source" to "service_role";

grant trigger on table "public"."student_source" to "service_role";

grant truncate on table "public"."student_source" to "service_role";

grant update on table "public"."student_source" to "service_role";

grant delete on table "public"."student_users" to "anon";

grant insert on table "public"."student_users" to "anon";

grant references on table "public"."student_users" to "anon";

grant select on table "public"."student_users" to "anon";

grant trigger on table "public"."student_users" to "anon";

grant truncate on table "public"."student_users" to "anon";

grant update on table "public"."student_users" to "anon";

grant delete on table "public"."student_users" to "authenticated";

grant insert on table "public"."student_users" to "authenticated";

grant references on table "public"."student_users" to "authenticated";

grant select on table "public"."student_users" to "authenticated";

grant trigger on table "public"."student_users" to "authenticated";

grant truncate on table "public"."student_users" to "authenticated";

grant update on table "public"."student_users" to "authenticated";

grant delete on table "public"."student_users" to "service_role";

grant insert on table "public"."student_users" to "service_role";

grant references on table "public"."student_users" to "service_role";

grant select on table "public"."student_users" to "service_role";

grant trigger on table "public"."student_users" to "service_role";

grant truncate on table "public"."student_users" to "service_role";

grant update on table "public"."student_users" to "service_role";

grant delete on table "public"."students" to "anon";

grant insert on table "public"."students" to "anon";

grant references on table "public"."students" to "anon";

grant select on table "public"."students" to "anon";

grant trigger on table "public"."students" to "anon";

grant truncate on table "public"."students" to "anon";

grant update on table "public"."students" to "anon";

grant delete on table "public"."students" to "authenticated";

grant insert on table "public"."students" to "authenticated";

grant references on table "public"."students" to "authenticated";

grant select on table "public"."students" to "authenticated";

grant trigger on table "public"."students" to "authenticated";

grant truncate on table "public"."students" to "authenticated";

grant update on table "public"."students" to "authenticated";

grant delete on table "public"."students" to "service_role";

grant insert on table "public"."students" to "service_role";

grant references on table "public"."students" to "service_role";

grant select on table "public"."students" to "service_role";

grant trigger on table "public"."students" to "service_role";

grant truncate on table "public"."students" to "service_role";

grant update on table "public"."students" to "service_role";

grant delete on table "public"."supervisor_assignment" to "anon";

grant insert on table "public"."supervisor_assignment" to "anon";

grant references on table "public"."supervisor_assignment" to "anon";

grant select on table "public"."supervisor_assignment" to "anon";

grant trigger on table "public"."supervisor_assignment" to "anon";

grant truncate on table "public"."supervisor_assignment" to "anon";

grant update on table "public"."supervisor_assignment" to "anon";

grant delete on table "public"."supervisor_assignment" to "authenticated";

grant insert on table "public"."supervisor_assignment" to "authenticated";

grant references on table "public"."supervisor_assignment" to "authenticated";

grant select on table "public"."supervisor_assignment" to "authenticated";

grant trigger on table "public"."supervisor_assignment" to "authenticated";

grant truncate on table "public"."supervisor_assignment" to "authenticated";

grant update on table "public"."supervisor_assignment" to "authenticated";

grant delete on table "public"."supervisor_assignment" to "service_role";

grant insert on table "public"."supervisor_assignment" to "service_role";

grant references on table "public"."supervisor_assignment" to "service_role";

grant select on table "public"."supervisor_assignment" to "service_role";

grant trigger on table "public"."supervisor_assignment" to "service_role";

grant truncate on table "public"."supervisor_assignment" to "service_role";

grant update on table "public"."supervisor_assignment" to "service_role";

grant delete on table "public"."supervisor_users" to "anon";

grant insert on table "public"."supervisor_users" to "anon";

grant references on table "public"."supervisor_users" to "anon";

grant select on table "public"."supervisor_users" to "anon";

grant trigger on table "public"."supervisor_users" to "anon";

grant truncate on table "public"."supervisor_users" to "anon";

grant update on table "public"."supervisor_users" to "anon";

grant delete on table "public"."supervisor_users" to "authenticated";

grant insert on table "public"."supervisor_users" to "authenticated";

grant references on table "public"."supervisor_users" to "authenticated";

grant select on table "public"."supervisor_users" to "authenticated";

grant trigger on table "public"."supervisor_users" to "authenticated";

grant truncate on table "public"."supervisor_users" to "authenticated";

grant update on table "public"."supervisor_users" to "authenticated";

grant delete on table "public"."supervisor_users" to "service_role";

grant insert on table "public"."supervisor_users" to "service_role";

grant references on table "public"."supervisor_users" to "service_role";

grant select on table "public"."supervisor_users" to "service_role";

grant trigger on table "public"."supervisor_users" to "service_role";

grant truncate on table "public"."supervisor_users" to "service_role";

grant update on table "public"."supervisor_users" to "service_role";

grant delete on table "public"."transactions_bank" to "anon";

grant insert on table "public"."transactions_bank" to "anon";

grant references on table "public"."transactions_bank" to "anon";

grant select on table "public"."transactions_bank" to "anon";

grant trigger on table "public"."transactions_bank" to "anon";

grant truncate on table "public"."transactions_bank" to "anon";

grant update on table "public"."transactions_bank" to "anon";

grant delete on table "public"."transactions_bank" to "authenticated";

grant insert on table "public"."transactions_bank" to "authenticated";

grant references on table "public"."transactions_bank" to "authenticated";

grant select on table "public"."transactions_bank" to "authenticated";

grant trigger on table "public"."transactions_bank" to "authenticated";

grant truncate on table "public"."transactions_bank" to "authenticated";

grant update on table "public"."transactions_bank" to "authenticated";

grant delete on table "public"."transactions_bank" to "service_role";

grant insert on table "public"."transactions_bank" to "service_role";

grant references on table "public"."transactions_bank" to "service_role";

grant select on table "public"."transactions_bank" to "service_role";

grant trigger on table "public"."transactions_bank" to "service_role";

grant truncate on table "public"."transactions_bank" to "service_role";

grant update on table "public"."transactions_bank" to "service_role";


  create policy "Admin full access"
  on "public"."advance_payments"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Allow authenticated read access"
  on "public"."child_care_requests"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated update access"
  on "public"."child_care_requests"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Allow public insert access"
  on "public"."child_care_requests"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable insert for everyone"
  on "public"."client_service_history"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable read access for authenticated users only"
  on "public"."client_service_history"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Admin full access"
  on "public"."clients"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Anyone can insert"
  on "public"."clients"
  as permissive
  for insert
  to public
with check (true);



  create policy "Client can delete own row"
  on "public"."clients"
  as permissive
  for delete
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (id)::text));



  create policy "Client can read own row"
  on "public"."clients"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (id)::text));



  create policy "Client can update own row"
  on "public"."clients"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (id)::text))
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (id)::text));



  create policy "Admin full access"
  on "public"."crm_refund_payments"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable insert for everyone"
  on "public"."housemaid_requests"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable read access for authenticated users only"
  on "public"."housemaid_requests"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Admin full access"
  on "public"."individual_clients"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Anyone can insert"
  on "public"."individual_clients"
  as permissive
  for insert
  to public
with check (true);



  create policy "Client can delete own row"
  on "public"."individual_clients"
  as permissive
  for delete
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Client can read own row"
  on "public"."individual_clients"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Client can update own row"
  on "public"."individual_clients"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text))
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Admin full access"
  on "public"."nurses"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Nurse can delete own row"
  on "public"."nurses"
  as permissive
  for delete
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text));



  create policy "Nurse can insert own row"
  on "public"."nurses"
  as permissive
  for insert
  to public
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text));



  create policy "Nurse can read own row"
  on "public"."nurses"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text));



  create policy "Nurse can update own row"
  on "public"."nurses"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text))
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text));



  create policy "Admin full access"
  on "public"."organization_clients"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Anyone can insert"
  on "public"."organization_clients"
  as permissive
  for insert
  to public
with check (true);



  create policy "Client can delete own row"
  on "public"."organization_clients"
  as permissive
  for delete
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Client can read own row"
  on "public"."organization_clients"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Client can update own row"
  on "public"."organization_clients"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text))
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (client_id)::text));



  create policy "Enable insert for all users"
  on "public"."reassessment"
  as permissive
  for insert
  to public
with check (true);



  create policy "Admin full access"
  on "public"."salary_payments"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
with check ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "nurses can read own row"
  on "public"."salary_payments"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'id'::text) = (nurse_id)::text));



