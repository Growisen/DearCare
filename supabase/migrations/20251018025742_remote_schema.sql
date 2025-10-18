

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admission_type" AS ENUM (
    'Tata_Homenursing',
    'Dearcare_Llp'
);


ALTER TYPE "public"."admission_type" OWNER TO "postgres";


CREATE TYPE "public"."assigned_type" AS ENUM (
    'individual',
    'organization'
);


ALTER TYPE "public"."assigned_type" OWNER TO "postgres";


CREATE TYPE "public"."client_category" AS ENUM (
    'DearCare LLP',
    'Tata HomeNursing'
);


ALTER TYPE "public"."client_category" OWNER TO "postgres";


CREATE TYPE "public"."client_status" AS ENUM (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'assigned'
);


ALTER TYPE "public"."client_status" OWNER TO "postgres";


CREATE TYPE "public"."client_type" AS ENUM (
    'individual',
    'organization',
    'hospital',
    'carehome'
);


ALTER TYPE "public"."client_type" OWNER TO "postgres";


CREATE TYPE "public"."complaint_source" AS ENUM (
    'client',
    'nurse'
);


ALTER TYPE "public"."complaint_source" OWNER TO "postgres";


CREATE TYPE "public"."complaint_status" AS ENUM (
    'open',
    'under_review',
    'resolved'
);


ALTER TYPE "public"."complaint_status" OWNER TO "postgres";


CREATE TYPE "public"."gender_type" AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE "public"."gender_type" OWNER TO "postgres";


CREATE TYPE "public"."leave_mode" AS ENUM (
    'full_day',
    'half_day_morning',
    'half_day_afternoon'
);


ALTER TYPE "public"."leave_mode" OWNER TO "postgres";


CREATE TYPE "public"."leave_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."leave_status" OWNER TO "postgres";


CREATE TYPE "public"."leave_type" AS ENUM (
    'sick',
    'annual',
    'personal',
    'casual',
    'maternity',
    'paternity',
    'unpaid'
);


ALTER TYPE "public"."leave_type" OWNER TO "postgres";


CREATE TYPE "public"."mode_of_pay" AS ENUM (
    'cash',
    'upi',
    'account_transfer'
);


ALTER TYPE "public"."mode_of_pay" OWNER TO "postgres";


CREATE TYPE "public"."nurse_status" AS ENUM (
    'unassigned',
    'assigned',
    'leave'
);


ALTER TYPE "public"."nurse_status" OWNER TO "postgres";


CREATE TYPE "public"."pay_type" AS ENUM (
    'incoming',
    'outgoing'
);


ALTER TYPE "public"."pay_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'paid',
    'un_paid'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."relation_type" AS ENUM (
    'self',
    'spouse',
    'child',
    'parent',
    'sibling',
    'other',
    'son_in_law',
    'daughter_in_law',
    'son',
    'daughter'
);


ALTER TYPE "public"."relation_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_nurse_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
    raw_user_meta_data,     -- User metadata including custom role and nurse_id
    is_super_admin,         -- Not a super admin
    created_at,             -- Current timestamp
    updated_at,             -- Current timestamp
    confirmation_token,     -- Not needed since email is confirmed
    recovery_token,         -- Not needed initially
    email_change_token_new, -- Not needed initially
    email_change           -- Not needed initially
  ) VALUES (
    uid,                    -- Generated UUID
    default_instance_id,    -- Use default UUID
    NEW.email,              -- From the nurse table
    crypt('Nurse@123', gen_salt('bf')), -- Encrypted default password
    NOW(),                  -- Confirm email immediately
    'authenticated',        -- Standard audience for authenticated users
    'authenticated',        -- Standard role
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(     -- Build JSON object with role and nurse_id
      'role', 'nurse',
      'nurse_id', NEW.nurse_id
    ),
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
$$;


ALTER FUNCTION "public"."create_nurse_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_student_user_on_confirm"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF LOWER(NEW.status) = 'confirmed' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.student_users (student_id, email, password)
    SELECT s.id, s.email, 'Password@1'
    FROM public.students s
    WHERE s.id = NEW.student_id
    ON CONFLICT (student_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_student_user_on_confirm"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_days_worked"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_nurse_id bigint;
BEGIN
    -- Get the nurse_id from nurse_client table
    SELECT nc.nurse_id INTO v_nurse_id
    FROM public.nurse_client nc
    WHERE nc.id = OLD.assigned_id;

    -- Only decrement if no other attendance exists for this nurse, assignment, shift, and date
    IF NOT EXISTS (
        SELECT 1
        FROM public.attendence_individual a
        JOIN public.nurse_client nc2 ON nc2.id = a.assigned_id
        WHERE nc2.nurse_id = v_nurse_id
          AND a.assigned_id = OLD.assigned_id
          AND a.id = OLD.id
          AND a.date = OLD.date
          AND a.id <> OLD.id
    ) THEN
        -- Decrement days_worked in shift_summary (avoid negative values)
        UPDATE public.shift_summary ss
        SET days_worked = GREATEST(ss.days_worked - 1, 0)
        WHERE ss.nurse_id = v_nurse_id
          AND ss.assigned_id = OLD.assigned_id;
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_days_worked"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_student_user_on_student_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- No manual delete needed due to cascade; still returning for compliance
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_student_user_on_student_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_faculty_reg_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_prefix text := to_char(NEW.join_date, 'YY');
    next_number int;
BEGIN
    INSERT INTO faculty_register_seq(year, last_number)
    VALUES (cast(to_char(NEW.join_date, 'YYYY') as int), 1)
    ON CONFLICT (year)
    DO UPDATE SET last_number = faculty_register_seq.last_number + 1
    RETURNING last_number INTO next_number;

    NEW.register_no := year_prefix || 'FAC' || lpad(next_number::text, 3, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_faculty_reg_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_register_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    year_prefix TEXT;
    v_course_abbr TEXT;
    next_number INT;
BEGIN
    -- Only proceed if status is 'Confirmed'
    IF LOWER(NEW.status) = 'confirmed' THEN

        -- Get last two digits of the current year
        year_prefix := TO_CHAR(CURRENT_DATE, 'YY');

        -- Fetch course abbreviation
        SELECT ca.abbreviation
        INTO v_course_abbr
        FROM course_abbreviations ca
        WHERE ca.course_name = (
            SELECT s.course
            FROM students s
            WHERE s.id = NEW.student_id
        );

        IF v_course_abbr IS NULL THEN
            RAISE EXCEPTION 'No abbreviation found for student course.';
        END IF;

        -- Check if an entry exists in student_register_seq
        SELECT last_number
        INTO next_number
        FROM student_register_seq
        WHERE CAST(year AS TEXT) = year_prefix
          AND course_abbr = v_course_abbr
        FOR UPDATE;

        IF NOT FOUND THEN
            -- Insert the new sequence record starting at 1
            INSERT INTO student_register_seq (year, course_abbr, last_number)
            VALUES (year_prefix::INTEGER, v_course_abbr, 1);
            next_number := 1;
        ELSE
            -- Increment the sequence number
            UPDATE student_register_seq
            SET last_number = last_number + 1
            WHERE CAST(year AS TEXT) = year_prefix
              AND course_abbr = v_course_abbr;

            -- Retrieve the updated last_number
            SELECT last_number
            INTO next_number
            FROM student_register_seq
            WHERE CAST(year AS TEXT) = year_prefix
              AND course_abbr = v_course_abbr;
        END IF;

        -- Update register_no in the students table
        UPDATE students
        SET register_no = year_prefix || v_course_abbr || LPAD(next_number::TEXT, 4, '0')
        WHERE id = NEW.student_id;

    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."generate_register_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_attendance_data"("curr_date" "date") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total', COALESCE((
            SELECT count(DISTINCT nurse_id) 
            FROM nurse_client 
            WHERE start_date <= curr_date AND end_date >= curr_date
        ), 0),
        'present', COALESCE((
            SELECT count(DISTINCT assigned_id) 
            FROM attendence_individual 
            WHERE date = curr_date AND start_time IS NOT NULL
        ), 0),
        'onLeave', COALESCE((
            SELECT count(DISTINCT nurse_id) 
            FROM nurse_leave_requests 
            WHERE status = 'approved' 
                AND start_date <= curr_date 
                AND end_date >= curr_date
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_attendance_data"("curr_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_salary_date"("initial_date" "date", "interval_days" integer) RETURNS "date"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN initial_date + (
    CEIL((CURRENT_DATE - initial_date)::numeric / interval_days) * interval_days
  )::integer;
END;
$$;


ALTER FUNCTION "public"."get_next_salary_date"("initial_date" "date", "interval_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_registration_counter"("p_category" "text", "p_type" "text", "p_year" "text") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_counter INTEGER;
BEGIN
  -- Insert if not exists, otherwise increment
  INSERT INTO registration_counters (category, type, year, counter)
  VALUES (p_category, p_type, p_year, 1)
  ON CONFLICT (category, type, year) 
  DO UPDATE SET counter = registration_counters.counter + 1
  RETURNING counter INTO new_counter;
  
  RETURN new_counter;
END;
$$;


ALTER FUNCTION "public"."increment_registration_counter"("p_category" "text", "p_type" "text", "p_year" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_supervisor_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.supervisor_users (supervisor_id, email, password)
    VALUES (NEW.id, NEW.email, 'Password@1');
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- Deletion handled by ON DELETE CASCADE
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."manage_supervisor_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_clients"("search_term" "text") RETURNS TABLE("client_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id
  FROM clients c
  LEFT JOIN individual_clients ic ON c.id = ic.client_id
  LEFT JOIN organization_clients oc ON c.id = oc.client_id
  WHERE
    -- Individual client conditions
    ic.patient_name ILIKE search_term OR
    ic.requestor_phone ILIKE search_term OR
    ic.requestor_name ILIKE search_term OR
    ic.complete_address ILIKE search_term OR
    -- Organization client conditions
    oc.organization_name ILIKE search_term OR
    oc.contact_phone ILIKE search_term OR
    oc.contact_person_name ILIKE search_term OR
    oc.organization_address ILIKE search_term;
END;
$$;


ALTER FUNCTION "public"."search_clients"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_days_worked"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_nurse_id bigint;
BEGIN
    -- Get the nurse_id from nurse_client table
    SELECT nc.nurse_id INTO v_nurse_id
    FROM public.nurse_client nc
    WHERE nc.id = NEW.assigned_id;

    -- Only increment if there is no existing attendance for this nurse, assignment, shift, and date
    IF NOT EXISTS (
        SELECT 1
        FROM public.attendence_individual a
        JOIN public.nurse_client nc2 ON nc2.id = a.assigned_id
        WHERE nc2.nurse_id = v_nurse_id
          AND a.assigned_id = NEW.assigned_id
          AND a.id = NEW.id
          AND a.date = NEW.date
          AND a.id <> NEW.id
    ) THEN
        -- Increment days_worked in shift_summary
        UPDATE public.shift_summary ss
        SET days_worked = ss.days_worked + 1
        WHERE ss.nurse_id = v_nurse_id
          AND ss.assigned_id = NEW.assigned_id;

        -- If no row exists in shift_summary, insert one with days_worked = 1
        IF NOT FOUND THEN
            INSERT INTO public.shift_summary (nurse_id, assigned_id, days_worked)
            VALUES (v_nurse_id, NEW.assigned_id, 1);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_days_worked"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_salary_calculation_runs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_salary_calculation_runs_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."academy_enquiries" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying,
    "email" character varying,
    "phone_no" character varying,
    "course" character varying,
    "hide" boolean,
    "age" smallint,
    "dob" "date",
    "address" "text",
    "gender" character varying,
    "religion" character varying,
    "caste" character varying,
    "aadhaar_no" character varying,
    "guardian_name" character varying,
    "highest_qualification" character varying,
    "year_of_passing" integer,
    "message" "text"
);


ALTER TABLE "public"."academy_enquiries" OWNER TO "postgres";


ALTER TABLE "public"."academy_enquiries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Enquiries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_courses" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "course_name" character varying NOT NULL,
    "course_fees" double precision,
    "reg_fees" double precision,
    "first_installment" double precision,
    "second_installment" double precision,
    "third_installment" double precision
);


ALTER TABLE "public"."academy_courses" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_courses" IS 'details of various courses in dearCare academy';



ALTER TABLE "public"."academy_courses" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_courses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_faculties" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying,
    "join_date" "date",
    "department" character varying,
    "email" character varying,
    "phone_no" character varying,
    "role" character varying,
    "dob" "date",
    "martialstatus" "text",
    "address" "text",
    "gender" "text",
    "register_no" character varying
);


ALTER TABLE "public"."academy_faculties" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_faculties" IS 'details of faculties in the dear care academy';



ALTER TABLE "public"."academy_faculties" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_faculties_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_rejects" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "reason" character varying
);


ALTER TABLE "public"."academy_rejects" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_rejects" IS 'reject reasons for student registration';



ALTER TABLE "public"."academy_rejects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_rejects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uid" character varying,
    "role" character varying
);


ALTER TABLE "public"."academy_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_roles" IS 'specify the roles of users in dearcare academy auth';



ALTER TABLE "public"."academy_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_student_attendance" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "date" "date",
    "fn_theory" boolean,
    "an_theory" boolean,
    "fn_practical" boolean,
    "an_practical" boolean
);


ALTER TABLE "public"."academy_student_attendance" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_student_attendance" IS 'attendance details of the students in the dearcare academy';



ALTER TABLE "public"."academy_student_attendance" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_student_attendance_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."academy_supervisors" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying,
    "join_date" "date",
    "department" character varying,
    "email" character varying,
    "phone_no" character varying,
    "role" character varying,
    "dob" "date",
    "martialstatus" "text",
    "address" "text",
    "gender" "text"
);


ALTER TABLE "public"."academy_supervisors" OWNER TO "postgres";


COMMENT ON TABLE "public"."academy_supervisors" IS 'details of supervisors in the dear care academy';



ALTER TABLE "public"."academy_supervisors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."academy_supervisors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."admin_dashboard_todos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "time" "text" NOT NULL,
    "date" "text" NOT NULL,
    "location" "text" NOT NULL,
    "urgent" boolean DEFAULT false,
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_dashboard_todos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendence_individual" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_id" bigint NOT NULL,
    "location" "text",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "total_hours" "text",
    "date" "date" NOT NULL,
    "end_location" "text",
    "is_admin_action" boolean DEFAULT false
);


ALTER TABLE "public"."attendence_individual" OWNER TO "postgres";


ALTER TABLE "public"."attendence_individual" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."attendence_individual_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."client_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "url" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "tag" "text"
);


ALTER TABLE "public"."client_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_payment_line_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_record_id" bigint NOT NULL,
    "field_name" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL
);


ALTER TABLE "public"."client_payment_line_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_payment_records" (
    "id" bigint NOT NULL,
    "client_id" "uuid" NOT NULL,
    "payment_group_name" "text" NOT NULL,
    "total_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "date_added" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "show_to_client" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."client_payment_records" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."client_payment_records_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."client_payment_records_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."client_payment_records_id_seq" OWNED BY "public"."client_payment_records"."id";



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_type" "public"."client_type" NOT NULL,
    "client_category" "public"."client_category" NOT NULL,
    "status" "public"."client_status" DEFAULT 'pending'::"public"."client_status",
    "general_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "rejection_reason" "text",
    "otp_preference" boolean,
    "duty_period" "text",
    "duty_period_reason" "text",
    "registration_number" "text",
    "prev_registration_number" "text"
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_abbreviations" (
    "course_name" character varying NOT NULL,
    "abbreviation" character varying NOT NULL
);


ALTER TABLE "public"."course_abbreviations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."day_book" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id_in_out" "text" NOT NULL,
    "amount" bigint NOT NULL,
    "payment_type" "public"."pay_type" NOT NULL,
    "pay_status" "public"."payment_status" NOT NULL,
    "description" character varying,
    "mode_of_pay" "public"."mode_of_pay"
);


ALTER TABLE "public"."day_book" OWNER TO "postgres";


ALTER TABLE "public"."day_book" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."day_book_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."dearcare_complaint_resolutions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "resolved_by" "uuid",
    "resolution_date" timestamp with time zone,
    "resolution_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status_history" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."dearcare_complaint_resolutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dearcare_complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."complaint_status" DEFAULT 'open'::"public"."complaint_status" NOT NULL,
    "source" "public"."complaint_source" NOT NULL,
    "submitter_id" "text" NOT NULL,
    "admin_comment" "text",
    "resolution" "text",
    "submission_date" timestamp with time zone DEFAULT "timezone"('UTC'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('UTC'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('UTC'::"text", "now"()) NOT NULL,
    "media_files" "jsonb",
    "reported_id" "text"
);


ALTER TABLE "public"."dearcare_complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dearcare_salary_calculation_runs" (
    "id" integer NOT NULL,
    "run_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "pay_period_start" "date" NOT NULL,
    "pay_period_end" "date" NOT NULL,
    "total_nurses_calculated" integer DEFAULT 0 NOT NULL,
    "total_attendance_records" integer DEFAULT 0 NOT NULL,
    "total_salary_records_inserted" integer DEFAULT 0 NOT NULL,
    "execution_status" character varying(20) DEFAULT 'success'::character varying NOT NULL,
    "execution_duration_ms" integer,
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "dearcare_salary_calculation_runs_execution_status_check" CHECK ((("execution_status")::"text" = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::"text"[])))
);


ALTER TABLE "public"."dearcare_salary_calculation_runs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dearcare_salary_calculation_runs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."dearcare_salary_calculation_runs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dearcare_salary_calculation_runs_id_seq" OWNED BY "public"."dearcare_salary_calculation_runs"."id";



CREATE TABLE IF NOT EXISTS "public"."dearcare_services_enquiries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "location" "text" NOT NULL,
    "service" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dearcare_services_enquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dearcare_staff" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "profile_image" "text",
    "role" "text",
    "join_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "city" "text" NOT NULL,
    "district" "text" NOT NULL,
    "state" "text" NOT NULL,
    "pincode" "text" NOT NULL,
    "organization" "public"."client_category" DEFAULT 'DearCare LLP'::"public"."client_category" NOT NULL,
    "reg_no" character varying
);


ALTER TABLE "public"."dearcare_staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dearcare_web_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'staff'::"text" NOT NULL,
    "email" "text",
    "phone" "text",
    "profile_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "country" "text"
);


ALTER TABLE "public"."dearcare_web_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faculty_assignment" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "faculty_id" bigint
);


ALTER TABLE "public"."faculty_assignment" OWNER TO "postgres";


COMMENT ON TABLE "public"."faculty_assignment" IS 'lists the students assigned to each faculties in dear care academy';



ALTER TABLE "public"."faculty_assignment" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."faculty_assignment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."faculty_experiences" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization" "text",
    "posted_role" "text",
    "responsibilities" "text",
    "faculty_id" bigint,
    "duration" "text"
);


ALTER TABLE "public"."faculty_experiences" OWNER TO "postgres";


ALTER TABLE "public"."faculty_experiences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."faculty_experiences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."faculty_register_seq" (
    "year" integer NOT NULL,
    "last_number" integer DEFAULT 0
);


ALTER TABLE "public"."faculty_register_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."individual_clients" (
    "client_id" "uuid" NOT NULL,
    "requestor_name" character varying(255) NOT NULL,
    "requestor_phone" character varying(50) NOT NULL,
    "requestor_email" character varying(255) NOT NULL,
    "relation_to_patient" "public"."relation_type",
    "patient_name" character varying(255),
    "patient_age" "text",
    "patient_gender" "public"."gender_type",
    "patient_phone" character varying(50),
    "complete_address" "text",
    "service_required" character varying(50) NOT NULL,
    "care_duration" character varying(50),
    "start_date" "date" NOT NULL,
    "preferred_caregiver_gender" character varying(50),
    "requestor_profile_pic" "text",
    "patient_profile_pic" "text",
    "patient_address" "text",
    "patient_pincode" "text",
    "patient_district" "text",
    "patient_city" "text",
    "requestor_address" "text",
    "requestor_job_details" "text",
    "requestor_emergency_phone" "text",
    "requestor_pincode" "text",
    "requestor_district" "text",
    "requestor_city" "text",
    "requestor_state" "text",
    "patient_state" "text"
);


ALTER TABLE "public"."individual_clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nurse_client" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nurse_id" bigint NOT NULL,
    "client_id" "uuid" NOT NULL,
    "assigned_type" "public"."assigned_type" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "shift_start_time" character varying,
    "shift_end_time" character varying,
    "salary_hour" bigint,
    "salary_per_day" double precision,
    "shift_hours" character varying
);


ALTER TABLE "public"."nurse_client" OWNER TO "postgres";


ALTER TABLE "public"."nurse_client" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."nurse_client_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."nurse_health" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nurse_id" bigint,
    "health_status" character varying,
    "disability" character varying,
    "source" character varying
);


ALTER TABLE "public"."nurse_health" OWNER TO "postgres";


COMMENT ON TABLE "public"."nurse_health" IS 'information about nurse health status and disabilities if any';



ALTER TABLE "public"."nurse_health" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."nurse_health_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."nurse_leave_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nurse_id" bigint NOT NULL,
    "leave_type" "public"."leave_type" NOT NULL,
    "leave_mode" "public"."leave_mode" DEFAULT 'full_day'::"public"."leave_mode",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "days" numeric(5,1) NOT NULL,
    "reason" "text",
    "status" "public"."leave_status" DEFAULT 'pending'::"public"."leave_status",
    "rejection_reason" "text",
    "applied_on" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nurse_leave_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nurse_references" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nurse_id" bigint,
    "referer_name" character varying,
    "relation" character varying,
    "phone_number" character varying,
    "description" character varying,
    "family_references" "jsonb"
);


ALTER TABLE "public"."nurse_references" OWNER TO "postgres";


COMMENT ON TABLE "public"."nurse_references" IS 'references provided to nurses by other people';



ALTER TABLE "public"."nurse_references" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."nurse_references_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."nurses" (
    "nurse_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" character varying,
    "last_name" character varying,
    "gender" character varying,
    "date_of_birth" "date",
    "address" character varying,
    "city" character varying,
    "taluk" character varying,
    "state" character varying,
    "pin_code" integer,
    "phone_number" character varying,
    "languages" "json",
    "noc_status" character varying,
    "service_type" character varying,
    "shift_pattern" character varying,
    "category" character varying,
    "experience" smallint,
    "marital_status" character varying,
    "religion" character varying,
    "mother_tongue" character varying,
    "email" character varying,
    "status" "public"."nurse_status" DEFAULT 'unassigned'::"public"."nurse_status" NOT NULL,
    "nurse_reg_no" character varying,
    "admitted_type" "public"."admission_type" DEFAULT 'Tata_Homenursing'::"public"."admission_type",
    "nurse_prev_reg_no" "text",
    "joining_date" "text",
    "salary_per_month" real
);


ALTER TABLE "public"."nurses" OWNER TO "postgres";


COMMENT ON TABLE "public"."nurses" IS 'contains details about nurses';



ALTER TABLE "public"."nurses" ALTER COLUMN "nurse_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."nurses_nurse_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."organization_clients" (
    "client_id" "uuid" NOT NULL,
    "organization_name" character varying(255) NOT NULL,
    "organization_type" character varying(100) DEFAULT ''::character varying,
    "contact_person_name" character varying(255) NOT NULL,
    "contact_person_role" character varying(100) DEFAULT ''::character varying,
    "contact_phone" character varying(50) NOT NULL,
    "contact_email" character varying(255) NOT NULL,
    "organization_address" "text" NOT NULL,
    "start_date" "text",
    "organization_state" "text",
    "organization_district" "text",
    "organization_city" "text",
    "organization_pincode" "text"
);


ALTER TABLE "public"."organization_clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."otp" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nurse_id" bigint NOT NULL,
    "otp" bigint NOT NULL
);


ALTER TABLE "public"."otp" OWNER TO "postgres";


ALTER TABLE "public"."otp" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."otp_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_assessments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "guardian_occupation" character varying(100) DEFAULT ''::character varying,
    "marital_status" character varying(50),
    "height" character varying(20),
    "weight" character varying(20),
    "pincode" character varying(20),
    "district" character varying(100),
    "city_town" character varying(100),
    "current_status" character varying(50),
    "chronic_illness" character varying(10),
    "medical_history" "text",
    "surgical_history" "text",
    "medication_history" "text",
    "alertness_level" "text",
    "physical_behavior" "text",
    "speech_patterns" "text",
    "emotional_state" "text",
    "drugs_use" "text",
    "alcohol_use" "text",
    "tobacco_use" "text",
    "other_social_history" "text",
    "present_condition" "text",
    "blood_pressure" character varying(50),
    "sugar_level" character varying(50),
    "lab_investigations" "jsonb",
    "final_diagnosis" "text",
    "foods_to_include" "text",
    "foods_to_avoid" "text",
    "patient_position" character varying(50),
    "feeding_method" character varying(50),
    "environment" "jsonb",
    "equipment" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "family_members" "jsonb" DEFAULT '[]'::"jsonb",
    "recorder_info" "jsonb"
);


ALTER TABLE "public"."patient_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registration_counters" (
    "category" "text" NOT NULL,
    "type" "text" NOT NULL,
    "year" "text" NOT NULL,
    "counter" integer DEFAULT 0
);


ALTER TABLE "public"."registration_counters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reminders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "interval_days" integer NOT NULL,
    "last_sent_date" "date",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."salary_configurations" (
    "id" bigint NOT NULL,
    "nurse_id" bigint NOT NULL,
    "base_pay" numeric(10,2) DEFAULT 0,
    "hourly_rate" numeric(8,2) DEFAULT 0,
    "allowance" numeric(10,2) DEFAULT 0,
    "bonus" numeric(10,2) DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."salary_configurations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."salary_configurations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."salary_configurations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."salary_configurations_id_seq" OWNED BY "public"."salary_configurations"."id";



CREATE TABLE IF NOT EXISTS "public"."salary_payments" (
    "id" bigint NOT NULL,
    "nurse_id" bigint NOT NULL,
    "salary_config_id" bigint,
    "pay_period_start" "date" NOT NULL,
    "pay_period_end" "date" NOT NULL,
    "pay_date" "date" DEFAULT CURRENT_DATE,
    "base_pay" numeric(10,2) DEFAULT 0,
    "hourly_rate" numeric(8,2) DEFAULT 0,
    "hours_worked" numeric(6,2) DEFAULT 0,
    "hourly_pay" numeric(10,2) DEFAULT 0,
    "allowance" numeric(10,2) DEFAULT 0,
    "bonus" numeric(10,2) DEFAULT 0,
    "gross_salary" numeric(10,2),
    "deductions" numeric(10,2) DEFAULT 0,
    "net_salary" numeric(10,2),
    "payment_status" character varying(20) DEFAULT 'pending'::character varying,
    "payment_method" character varying(20) DEFAULT NULL::character varying,
    "transaction_reference" character varying(100),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "salary" numeric,
    "reviewed" boolean,
    "info" "text",
    "average_hourly_rate" numeric,
    "days_worked" bigint,
    "skipped_records_count" integer DEFAULT 0,
    "skipped_records_details" "jsonb",
    "deduction" real,
    CONSTRAINT "check_period_dates" CHECK (("pay_period_end" >= "pay_period_start")),
    CONSTRAINT "check_positive_amounts" CHECK ((("base_pay" >= (0)::numeric) AND ("hourly_rate" >= (0)::numeric) AND ("hours_worked" >= (0)::numeric) AND ("hourly_pay" >= (0)::numeric) AND ("allowance" >= (0)::numeric) AND ("bonus" >= (0)::numeric) AND ("gross_salary" >= (0)::numeric) AND ("deductions" >= (0)::numeric) AND ("net_salary" >= (0)::numeric))),
    CONSTRAINT "salary_payments_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."salary_payments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."salary_payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."salary_payments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."salary_payments_id_seq" OWNED BY "public"."salary_payments"."id";



CREATE TABLE IF NOT EXISTS "public"."scheduled_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "interval_days" integer NOT NULL,
    "notify_before_days" integer[] DEFAULT '{}'::integer[],
    "last_sent_date" "date",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "is_active" boolean NOT NULL
);


ALTER TABLE "public"."scheduled_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_summary" (
    "id" bigint NOT NULL,
    "assigned_id" bigint NOT NULL,
    "nurse_id" bigint NOT NULL,
    "days_worked" integer DEFAULT 0
);


ALTER TABLE "public"."shift_summary" OWNER TO "postgres";


ALTER TABLE "public"."shift_summary" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."shift_summary_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."staff_requirements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "staff_type" character varying(50) NOT NULL,
    "count" integer DEFAULT 1 NOT NULL,
    "shift_type" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."staff_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_academics" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "qualification" character varying,
    "institution" character varying,
    "year_of_passing" integer,
    "marks" character varying
);


ALTER TABLE "public"."student_academics" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_academics" IS 'academic information of students in dear care academy';



ALTER TABLE "public"."student_academics" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_academics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_experience" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "org_name" character varying,
    "role" character varying,
    "duration" integer,
    "responsibility" character varying
);


ALTER TABLE "public"."student_experience" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_experience" IS 'work experience details of students at dear care academy';



ALTER TABLE "public"."student_experience" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_experience_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_guardian" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "guardian_name" character varying,
    "relation" character varying,
    "mobile" character varying,
    "address" character varying,
    "aadhaar" character varying
);


ALTER TABLE "public"."student_guardian" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_guardian" IS 'details of parent/guardians of students at dear care academy';



ALTER TABLE "public"."student_guardian" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_guardian_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_leave_request" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "leave_type" character varying,
    "leave_mode" character varying,
    "start_date" "date",
    "end_date" "date",
    "days" integer,
    "reason" character varying,
    "status" character varying,
    "rejection_reason" character varying
);


ALTER TABLE "public"."student_leave_request" OWNER TO "postgres";


ALTER TABLE "public"."student_leave_request" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_leave_request_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_preferences" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "home_care" character varying,
    "delivery_care" character varying,
    "old_age_home" character varying,
    "hospital_care" character varying,
    "senior_citizen_assist" character varying,
    "icu_home_care" character varying,
    "critical_illness_care" character varying,
    "companionship" character varying,
    "clinical_assist" character varying
);


ALTER TABLE "public"."student_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_preferences" IS 'details of students preference about services';



ALTER TABLE "public"."student_preferences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_preferences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_register_seq" (
    "year" integer NOT NULL,
    "course_abbr" character varying NOT NULL,
    "last_number" integer DEFAULT 0
);


ALTER TABLE "public"."student_register_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_source" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "source_of_info" character varying,
    "assigning_agent" character varying,
    "priority" character varying,
    "status" character varying,
    "category" character varying,
    "sub_category" character varying
);


ALTER TABLE "public"."student_source" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_source" IS 'source and status information about students in dear care academy';



ALTER TABLE "public"."student_source" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."student_source_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."student_users" (
    "id" bigint NOT NULL,
    "student_id" bigint NOT NULL,
    "email" character varying NOT NULL,
    "password" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_users" OWNER TO "postgres";


ALTER TABLE "public"."student_users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."student_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying,
    "dob" "date",
    "age" smallint,
    "gender" character varying,
    "marital_status" character varying,
    "nationality" character varying,
    "state" character varying,
    "city" character varying,
    "taluk" character varying,
    "mother_tongue" character varying,
    "languages" "json",
    "religion" character varying,
    "category" character varying,
    "email" character varying,
    "mobile" character varying,
    "cur_address" character varying,
    "cur_pincode" character varying,
    "perm_address" character varying,
    "perm_pincode" character varying,
    "cur_health_status" character varying,
    "disability_details" character varying,
    "noc_status" character varying,
    "course" character varying,
    "payment_receipt" boolean,
    "auth_uid" character varying,
    "register_no" character varying,
    "batch" character varying,
    "roll_no" bigint
);


ALTER TABLE "public"."students" OWNER TO "postgres";


COMMENT ON TABLE "public"."students" IS 'contains information about the students in the dearcare academy';



COMMENT ON COLUMN "public"."students"."auth_uid" IS 'uid of the user in authentication';



ALTER TABLE "public"."students" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."students_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."supervisor_assignment" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_id" bigint,
    "supervisor_id" bigint
);


ALTER TABLE "public"."supervisor_assignment" OWNER TO "postgres";


COMMENT ON TABLE "public"."supervisor_assignment" IS 'connects the students  assigned to supervisors in the dear care academy';



ALTER TABLE "public"."supervisor_assignment" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."supervisor_assignment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."supervisor_users" (
    "id" bigint NOT NULL,
    "supervisor_id" bigint NOT NULL,
    "email" character varying NOT NULL,
    "password" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supervisor_users" OWNER TO "postgres";


ALTER TABLE "public"."supervisor_users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."supervisor_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."client_payment_records" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."client_payment_records_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."dearcare_salary_calculation_runs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dearcare_salary_calculation_runs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."salary_configurations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."salary_configurations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."salary_payments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."salary_payments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."academy_enquiries"
    ADD CONSTRAINT "Enquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_courses"
    ADD CONSTRAINT "academy_courses_course_name_key" UNIQUE ("course_name");



ALTER TABLE ONLY "public"."academy_courses"
    ADD CONSTRAINT "academy_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_faculties"
    ADD CONSTRAINT "academy_faculties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_faculties"
    ADD CONSTRAINT "academy_faculties_register_no_key" UNIQUE ("register_no");



ALTER TABLE ONLY "public"."academy_rejects"
    ADD CONSTRAINT "academy_rejects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_roles"
    ADD CONSTRAINT "academy_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_student_attendance"
    ADD CONSTRAINT "academy_student_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academy_supervisors"
    ADD CONSTRAINT "academy_supervisors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendence_individual"
    ADD CONSTRAINT "attendence_individual_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_files"
    ADD CONSTRAINT "client_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_payment_line_items"
    ADD CONSTRAINT "client_payment_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_payment_records"
    ADD CONSTRAINT "client_payment_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_abbreviations"
    ADD CONSTRAINT "course_abbreviations_pkey" PRIMARY KEY ("course_name");



ALTER TABLE ONLY "public"."day_book"
    ADD CONSTRAINT "day_book_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_complaint_resolutions"
    ADD CONSTRAINT "dearcare_complaint_resolutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_complaints"
    ADD CONSTRAINT "dearcare_complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_salary_calculation_runs"
    ADD CONSTRAINT "dearcare_salary_calculation_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_services_enquiries"
    ADD CONSTRAINT "dearcare_services_enquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_staff"
    ADD CONSTRAINT "dearcare_staff_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."dearcare_staff"
    ADD CONSTRAINT "dearcare_staff_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dearcare_staff"
    ADD CONSTRAINT "dearcare_staff_reg_no_key" UNIQUE ("reg_no");



ALTER TABLE ONLY "public"."dearcare_web_users"
    ADD CONSTRAINT "dearcare_web_users_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."dearcare_web_users"
    ADD CONSTRAINT "dearcare_web_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faculty_assignment"
    ADD CONSTRAINT "faculty_assignment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faculty_experiences"
    ADD CONSTRAINT "faculty_experiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faculty_register_seq"
    ADD CONSTRAINT "faculty_register_seq_pkey" PRIMARY KEY ("year");



ALTER TABLE ONLY "public"."individual_clients"
    ADD CONSTRAINT "individual_clients_pkey" PRIMARY KEY ("client_id");



ALTER TABLE ONLY "public"."nurse_client"
    ADD CONSTRAINT "nurse_client_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nurse_health"
    ADD CONSTRAINT "nurse_health_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nurse_leave_requests"
    ADD CONSTRAINT "nurse_leave_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nurse_references"
    ADD CONSTRAINT "nurse_references_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nurses"
    ADD CONSTRAINT "nurses_Nurse reg no_key" UNIQUE ("nurse_reg_no");



ALTER TABLE ONLY "public"."nurses"
    ADD CONSTRAINT "nurses_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."nurses"
    ADD CONSTRAINT "nurses_pkey" PRIMARY KEY ("nurse_id");



ALTER TABLE ONLY "public"."organization_clients"
    ADD CONSTRAINT "organization_clients_pkey" PRIMARY KEY ("client_id");



ALTER TABLE ONLY "public"."otp"
    ADD CONSTRAINT "otp_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_assessments"
    ADD CONSTRAINT "patient_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registration_counters"
    ADD CONSTRAINT "registration_counters_pkey" PRIMARY KEY ("category", "type", "year");



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."salary_configurations"
    ADD CONSTRAINT "salary_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."salary_payments"
    ADD CONSTRAINT "salary_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduled_notifications"
    ADD CONSTRAINT "scheduled_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_summary"
    ADD CONSTRAINT "shift_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_requirements"
    ADD CONSTRAINT "staff_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_academics"
    ADD CONSTRAINT "student_academics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_experience"
    ADD CONSTRAINT "student_experience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_guardian"
    ADD CONSTRAINT "student_guardian_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_leave_request"
    ADD CONSTRAINT "student_leave_request_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_preferences"
    ADD CONSTRAINT "student_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_register_seq"
    ADD CONSTRAINT "student_register_seq_pkey" PRIMARY KEY ("year", "course_abbr");



ALTER TABLE ONLY "public"."student_source"
    ADD CONSTRAINT "student_source_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_users"
    ADD CONSTRAINT "student_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."student_users"
    ADD CONSTRAINT "student_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_users"
    ADD CONSTRAINT "student_users_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_register_no_key" UNIQUE ("register_no");



ALTER TABLE ONLY "public"."supervisor_assignment"
    ADD CONSTRAINT "supervisor_assignment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supervisor_users"
    ADD CONSTRAINT "supervisor_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."supervisor_users"
    ADD CONSTRAINT "supervisor_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supervisor_users"
    ADD CONSTRAINT "supervisor_users_supervisor_id_key" UNIQUE ("supervisor_id");



ALTER TABLE ONLY "public"."admin_dashboard_todos"
    ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_client_files_client_id" ON "public"."client_files" USING "btree" ("client_id");



CREATE INDEX "idx_client_files_uploaded_at" ON "public"."client_files" USING "btree" ("client_id", "uploaded_at" DESC);



CREATE INDEX "idx_client_payment_line_items_record_id" ON "public"."client_payment_line_items" USING "btree" ("payment_record_id");



CREATE INDEX "idx_client_payment_records_client_id" ON "public"."client_payment_records" USING "btree" ("client_id");



CREATE INDEX "idx_client_payment_records_date_added" ON "public"."client_payment_records" USING "btree" ("date_added");



CREATE INDEX "idx_clients_client_type" ON "public"."clients" USING "btree" ("client_type");



CREATE INDEX "idx_clients_created_at" ON "public"."clients" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_clients_status" ON "public"."clients" USING "btree" ("status");



CREATE INDEX "idx_clients_status_created_at" ON "public"."clients" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_complaints_source" ON "public"."dearcare_complaints" USING "btree" ("source");



CREATE INDEX "idx_complaints_status" ON "public"."dearcare_complaints" USING "btree" ("status");



CREATE INDEX "idx_complaints_submission_date" ON "public"."dearcare_complaints" USING "btree" ("submission_date");



CREATE INDEX "idx_complaints_submitter_id" ON "public"."dearcare_complaints" USING "btree" ("submitter_id");



CREATE INDEX "idx_individual_client_search" ON "public"."individual_clients" USING "btree" ("patient_name", "requestor_name", "requestor_phone");



CREATE INDEX "idx_individual_clients_client_id" ON "public"."individual_clients" USING "btree" ("client_id");



CREATE INDEX "idx_nurse_client_client_id" ON "public"."nurse_client" USING "btree" ("client_id");



CREATE INDEX "idx_nurse_client_nurse_id" ON "public"."nurse_client" USING "btree" ("nurse_id");



CREATE INDEX "idx_organization_client_search" ON "public"."organization_clients" USING "btree" ("organization_name", "contact_person_name", "contact_phone");



CREATE INDEX "idx_organization_clients_client_id" ON "public"."organization_clients" USING "btree" ("client_id");



CREATE INDEX "idx_patient_assessments_client_id" ON "public"."patient_assessments" USING "btree" ("client_id");



CREATE INDEX "idx_salary_calculation_runs_pay_period" ON "public"."dearcare_salary_calculation_runs" USING "btree" ("pay_period_start", "pay_period_end");



CREATE INDEX "idx_salary_calculation_runs_run_date" ON "public"."dearcare_salary_calculation_runs" USING "btree" ("run_date" DESC);



CREATE INDEX "idx_salary_calculation_runs_status" ON "public"."dearcare_salary_calculation_runs" USING "btree" ("execution_status");



CREATE INDEX "idx_salary_configurations_active" ON "public"."salary_configurations" USING "btree" ("nurse_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_salary_configurations_nurse_id" ON "public"."salary_configurations" USING "btree" ("nurse_id");



CREATE INDEX "idx_salary_payments_date" ON "public"."salary_payments" USING "btree" ("pay_date");



CREATE INDEX "idx_salary_payments_nurse_id" ON "public"."salary_payments" USING "btree" ("nurse_id");



CREATE INDEX "idx_salary_payments_period" ON "public"."salary_payments" USING "btree" ("nurse_id", "pay_period_start", "pay_period_end");



CREATE INDEX "idx_salary_payments_status" ON "public"."salary_payments" USING "btree" ("payment_status");



CREATE INDEX "idx_shift_summary_assigned_id" ON "public"."shift_summary" USING "btree" ("assigned_id");



CREATE INDEX "idx_shift_summary_nurse_id" ON "public"."shift_summary" USING "btree" ("nurse_id");



CREATE INDEX "idx_staff_requirements_client_id" ON "public"."staff_requirements" USING "btree" ("client_id");



CREATE OR REPLACE TRIGGER "after_insert_nurse" AFTER INSERT ON "public"."nurses" FOR EACH ROW EXECUTE FUNCTION "public"."create_nurse_auth_user"();



CREATE OR REPLACE TRIGGER "trg_create_student_user_on_confirm" AFTER UPDATE ON "public"."student_source" FOR EACH ROW EXECUTE FUNCTION "public"."create_student_user_on_confirm"();



CREATE OR REPLACE TRIGGER "trg_decrement_days_worked" AFTER DELETE ON "public"."attendence_individual" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_days_worked"();



CREATE OR REPLACE TRIGGER "trg_delete_student_user" AFTER DELETE ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."delete_student_user_on_student_delete"();



CREATE OR REPLACE TRIGGER "trg_faculty_register_no" BEFORE INSERT ON "public"."academy_faculties" FOR EACH ROW EXECUTE FUNCTION "public"."generate_faculty_reg_no"();



CREATE OR REPLACE TRIGGER "trg_generate_register_no" AFTER INSERT OR UPDATE OF "status" ON "public"."student_source" FOR EACH ROW EXECUTE FUNCTION "public"."generate_register_no"();



CREATE OR REPLACE TRIGGER "trg_manage_supervisor_user" AFTER INSERT OR DELETE ON "public"."academy_supervisors" FOR EACH ROW EXECUTE FUNCTION "public"."manage_supervisor_user"();



CREATE OR REPLACE TRIGGER "trg_update_days_worked" AFTER INSERT ON "public"."attendence_individual" FOR EACH ROW EXECUTE FUNCTION "public"."update_days_worked"();



CREATE OR REPLACE TRIGGER "trigger_update_salary_calculation_runs_updated_at" BEFORE UPDATE ON "public"."dearcare_salary_calculation_runs" FOR EACH ROW EXECUTE FUNCTION "public"."update_salary_calculation_runs_updated_at"();



CREATE OR REPLACE TRIGGER "update_salary_configurations_updated_at" BEFORE UPDATE ON "public"."salary_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_salary_payments_updated_at" BEFORE UPDATE ON "public"."salary_payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."academy_enquiries"
    ADD CONSTRAINT "academy_enquiries_course_fkey" FOREIGN KEY ("course") REFERENCES "public"."academy_courses"("course_name");



ALTER TABLE ONLY "public"."academy_rejects"
    ADD CONSTRAINT "academy_rejects_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."academy_student_attendance"
    ADD CONSTRAINT "academy_student_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."attendence_individual"
    ADD CONSTRAINT "attendence_individual_assigned_id_fkey" FOREIGN KEY ("assigned_id") REFERENCES "public"."nurse_client"("id");



ALTER TABLE ONLY "public"."client_files"
    ADD CONSTRAINT "client_files_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_payment_line_items"
    ADD CONSTRAINT "client_payment_line_items_payment_record_id_fkey" FOREIGN KEY ("payment_record_id") REFERENCES "public"."client_payment_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_payment_records"
    ADD CONSTRAINT "client_payment_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dearcare_complaint_resolutions"
    ADD CONSTRAINT "dearcare_complaint_resolutions_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."dearcare_complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faculty_assignment"
    ADD CONSTRAINT "faculty_assignment_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."academy_faculties"("id");



ALTER TABLE ONLY "public"."faculty_assignment"
    ADD CONSTRAINT "faculty_assignment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."faculty_experiences"
    ADD CONSTRAINT "faculty_experiences_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."academy_faculties"("id");



ALTER TABLE ONLY "public"."shift_summary"
    ADD CONSTRAINT "fk_assignment" FOREIGN KEY ("assigned_id") REFERENCES "public"."nurse_client"("id");



ALTER TABLE ONLY "public"."client_files"
    ADD CONSTRAINT "fk_client" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_summary"
    ADD CONSTRAINT "fk_employee" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."individual_clients"
    ADD CONSTRAINT "individual_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nurse_client"
    ADD CONSTRAINT "nurse_client_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."nurse_client"
    ADD CONSTRAINT "nurse_client_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."nurse_health"
    ADD CONSTRAINT "nurse_health_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."nurse_leave_requests"
    ADD CONSTRAINT "nurse_leave_requests_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."nurse_references"
    ADD CONSTRAINT "nurse_references_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."organization_clients"
    ADD CONSTRAINT "organization_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."otp"
    ADD CONSTRAINT "otp_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."otp"
    ADD CONSTRAINT "otp_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id");



ALTER TABLE ONLY "public"."patient_assessments"
    ADD CONSTRAINT "patient_assessments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."salary_configurations"
    ADD CONSTRAINT "salary_configurations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."salary_configurations"
    ADD CONSTRAINT "salary_configurations_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salary_configurations"
    ADD CONSTRAINT "salary_configurations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."salary_payments"
    ADD CONSTRAINT "salary_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."salary_payments"
    ADD CONSTRAINT "salary_payments_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "public"."nurses"("nurse_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salary_payments"
    ADD CONSTRAINT "salary_payments_salary_config_id_fkey" FOREIGN KEY ("salary_config_id") REFERENCES "public"."salary_configurations"("id");



ALTER TABLE ONLY "public"."salary_payments"
    ADD CONSTRAINT "salary_payments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scheduled_notifications"
    ADD CONSTRAINT "scheduled_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."staff_requirements"
    ADD CONSTRAINT "staff_requirements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_academics"
    ADD CONSTRAINT "student_academics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_experience"
    ADD CONSTRAINT "student_experience_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_guardian"
    ADD CONSTRAINT "student_guardian_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_leave_request"
    ADD CONSTRAINT "student_leave_request_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_preferences"
    ADD CONSTRAINT "student_preferences_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_source"
    ADD CONSTRAINT "student_source_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."student_users"
    ADD CONSTRAINT "student_users_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_course_fkey" FOREIGN KEY ("course") REFERENCES "public"."academy_courses"("course_name");



ALTER TABLE ONLY "public"."supervisor_assignment"
    ADD CONSTRAINT "supervisor_assignment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."supervisor_assignment"
    ADD CONSTRAINT "supervisor_assignment_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."academy_supervisors"("id");



ALTER TABLE ONLY "public"."supervisor_users"
    ADD CONSTRAINT "supervisor_users_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."academy_supervisors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_dashboard_todos"
    ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin users have full access to leave requests" ON "public"."nurse_leave_requests" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow all authenticated users to read" ON "public"."nurse_client" FOR SELECT USING (true);



CREATE POLICY "Allow all authenticated users to read" ON "public"."nurse_leave_requests" FOR SELECT USING (true);



CREATE POLICY "Allow all authenticated users to read" ON "public"."nurses" FOR SELECT USING (true);



CREATE POLICY "Allow nurses to insert their own leave requests" ON "public"."nurse_leave_requests" FOR INSERT WITH CHECK ((("nurse_id")::"text" = "current_setting"('app.current_user_id'::"text", true)));



CREATE POLICY "Allow nurses to read their own data" ON "public"."nurses" FOR SELECT USING (("lower"(TRIM(BOTH FROM "auth"."email"())) = "lower"(TRIM(BOTH FROM "email"))));



CREATE POLICY "Authenticated users have full access" ON "public"."attendence_individual" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."client_files" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."clients" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."dearcare_complaint_resolutions" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."dearcare_complaints" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."dearcare_services_enquiries" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."dearcare_staff" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."dearcare_web_users" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."individual_clients" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."nurse_leave_requests" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."nurses" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."organization_clients" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."otp" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."patient_assessments" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users have full access" ON "public"."registration_counters" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable full access for admin users on nurse_client" ON "public"."nurse_client" TO "authenticated" USING ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Enable full access for admin users on nurse_health" ON "public"."nurse_health" TO "authenticated" USING ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Enable full access for admin users on nurse_references" ON "public"."nurse_references" TO "authenticated" USING ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Enable full access for admin users on nurses" ON "public"."nurses" TO "authenticated" USING ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Enable insert and update for admin users on patient_assessments" ON "public"."patient_assessments" TO "authenticated" USING ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'user_metadata'::"text"))::"jsonb" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."academy_courses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."dearcare_salary_calculation_runs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable select for authenticated users on patient_assessments" ON "public"."patient_assessments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public can insert enquiries" ON "public"."dearcare_services_enquiries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Temporary allow all inserts" ON "public"."attendence_individual" FOR INSERT WITH CHECK (true);



CREATE POLICY "Temporary allow all inserts" ON "public"."nurse_leave_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can delete own entries" ON "public"."client_payment_line_items" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete own entries" ON "public"."client_payment_records" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete their own reminders" ON "public"."scheduled_notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own todos" ON "public"."admin_dashboard_todos" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own entries" ON "public"."client_payment_line_items" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert own entries" ON "public"."client_payment_records" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert their own reminders" ON "public"."scheduled_notifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own todos" ON "public"."admin_dashboard_todos" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can modify salary configurations" ON "public"."salary_configurations" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can modify salary payments" ON "public"."salary_payments" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update own entries" ON "public"."client_payment_line_items" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update own entries" ON "public"."client_payment_records" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update their own reminders" ON "public"."scheduled_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own todos" ON "public"."admin_dashboard_todos" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own entries" ON "public"."client_payment_line_items" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view own entries" ON "public"."client_payment_records" USING ((("auth"."uid"() IS NOT NULL) AND ("client_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'client_id'::"text"))::"uuid") AND ("show_to_client" = true)));



CREATE POLICY "Users can view salary configurations" ON "public"."salary_configurations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view salary payments" ON "public"."salary_payments" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view their own reminders" ON "public"."scheduled_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own todos" ON "public"."admin_dashboard_todos" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."academy_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_dashboard_todos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_payment_line_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_payment_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_complaint_resolutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_salary_calculation_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_services_enquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_staff" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dearcare_web_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nurse_client" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nurse_health" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nurse_references" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "nurses can view own entries" ON "public"."salary_payments" USING ((("auth"."uid"() IS NOT NULL) AND ("nurse_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'nurse_id'::"text"))::bigint)));



ALTER TABLE "public"."registration_counters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salary_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salary_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scheduled_notifications" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."attendence_individual";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON FUNCTION "public"."create_nurse_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_nurse_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_nurse_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_student_user_on_confirm"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_student_user_on_confirm"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_student_user_on_confirm"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_days_worked"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_days_worked"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_days_worked"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_student_user_on_student_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_student_user_on_student_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_student_user_on_student_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_faculty_reg_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_faculty_reg_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_faculty_reg_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_register_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_register_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_register_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_attendance_data"("curr_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_attendance_data"("curr_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_attendance_data"("curr_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_next_salary_date"("initial_date" "date", "interval_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_next_salary_date"("initial_date" "date", "interval_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_salary_date"("initial_date" "date", "interval_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_registration_counter"("p_category" "text", "p_type" "text", "p_year" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_registration_counter"("p_category" "text", "p_type" "text", "p_year" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_registration_counter"("p_category" "text", "p_type" "text", "p_year" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_supervisor_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."manage_supervisor_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_supervisor_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_clients"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_clients"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_clients"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_days_worked"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_days_worked"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_days_worked"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_salary_calculation_runs_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_salary_calculation_runs_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_salary_calculation_runs_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."academy_enquiries" TO "anon";
GRANT ALL ON TABLE "public"."academy_enquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_enquiries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Enquiries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Enquiries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Enquiries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_courses" TO "anon";
GRANT ALL ON TABLE "public"."academy_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_courses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_courses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_courses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_courses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_faculties" TO "anon";
GRANT ALL ON TABLE "public"."academy_faculties" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_faculties" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_faculties_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_faculties_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_faculties_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_rejects" TO "anon";
GRANT ALL ON TABLE "public"."academy_rejects" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_rejects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_rejects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_rejects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_rejects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_roles" TO "anon";
GRANT ALL ON TABLE "public"."academy_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_student_attendance" TO "anon";
GRANT ALL ON TABLE "public"."academy_student_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_student_attendance" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_student_attendance_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_student_attendance_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_student_attendance_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."academy_supervisors" TO "anon";
GRANT ALL ON TABLE "public"."academy_supervisors" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_supervisors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."academy_supervisors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."academy_supervisors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."academy_supervisors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."admin_dashboard_todos" TO "anon";
GRANT ALL ON TABLE "public"."admin_dashboard_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_dashboard_todos" TO "service_role";



GRANT ALL ON TABLE "public"."attendence_individual" TO "anon";
GRANT ALL ON TABLE "public"."attendence_individual" TO "authenticated";
GRANT ALL ON TABLE "public"."attendence_individual" TO "service_role";



GRANT ALL ON SEQUENCE "public"."attendence_individual_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."attendence_individual_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."attendence_individual_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."client_files" TO "anon";
GRANT ALL ON TABLE "public"."client_files" TO "authenticated";
GRANT ALL ON TABLE "public"."client_files" TO "service_role";



GRANT ALL ON TABLE "public"."client_payment_line_items" TO "anon";
GRANT ALL ON TABLE "public"."client_payment_line_items" TO "authenticated";
GRANT ALL ON TABLE "public"."client_payment_line_items" TO "service_role";



GRANT ALL ON TABLE "public"."client_payment_records" TO "anon";
GRANT ALL ON TABLE "public"."client_payment_records" TO "authenticated";
GRANT ALL ON TABLE "public"."client_payment_records" TO "service_role";



GRANT ALL ON SEQUENCE "public"."client_payment_records_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."client_payment_records_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."client_payment_records_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."course_abbreviations" TO "anon";
GRANT ALL ON TABLE "public"."course_abbreviations" TO "authenticated";
GRANT ALL ON TABLE "public"."course_abbreviations" TO "service_role";



GRANT ALL ON TABLE "public"."day_book" TO "anon";
GRANT ALL ON TABLE "public"."day_book" TO "authenticated";
GRANT ALL ON TABLE "public"."day_book" TO "service_role";



GRANT ALL ON SEQUENCE "public"."day_book_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."day_book_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."day_book_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_complaint_resolutions" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_complaint_resolutions" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_complaint_resolutions" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_complaints" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_complaints" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_complaints" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_salary_calculation_runs" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_salary_calculation_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_salary_calculation_runs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dearcare_salary_calculation_runs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dearcare_salary_calculation_runs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dearcare_salary_calculation_runs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_services_enquiries" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_services_enquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_services_enquiries" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_staff" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_staff" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_staff" TO "service_role";



GRANT ALL ON TABLE "public"."dearcare_web_users" TO "anon";
GRANT ALL ON TABLE "public"."dearcare_web_users" TO "authenticated";
GRANT ALL ON TABLE "public"."dearcare_web_users" TO "service_role";



GRANT ALL ON TABLE "public"."faculty_assignment" TO "anon";
GRANT ALL ON TABLE "public"."faculty_assignment" TO "authenticated";
GRANT ALL ON TABLE "public"."faculty_assignment" TO "service_role";



GRANT ALL ON SEQUENCE "public"."faculty_assignment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."faculty_assignment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."faculty_assignment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."faculty_experiences" TO "anon";
GRANT ALL ON TABLE "public"."faculty_experiences" TO "authenticated";
GRANT ALL ON TABLE "public"."faculty_experiences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."faculty_experiences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."faculty_experiences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."faculty_experiences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."faculty_register_seq" TO "anon";
GRANT ALL ON TABLE "public"."faculty_register_seq" TO "authenticated";
GRANT ALL ON TABLE "public"."faculty_register_seq" TO "service_role";



GRANT ALL ON TABLE "public"."individual_clients" TO "anon";
GRANT ALL ON TABLE "public"."individual_clients" TO "authenticated";
GRANT ALL ON TABLE "public"."individual_clients" TO "service_role";



GRANT ALL ON TABLE "public"."nurse_client" TO "anon";
GRANT ALL ON TABLE "public"."nurse_client" TO "authenticated";
GRANT ALL ON TABLE "public"."nurse_client" TO "service_role";



GRANT ALL ON SEQUENCE "public"."nurse_client_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."nurse_client_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."nurse_client_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."nurse_health" TO "anon";
GRANT ALL ON TABLE "public"."nurse_health" TO "authenticated";
GRANT ALL ON TABLE "public"."nurse_health" TO "service_role";



GRANT ALL ON SEQUENCE "public"."nurse_health_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."nurse_health_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."nurse_health_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."nurse_leave_requests" TO "anon";
GRANT ALL ON TABLE "public"."nurse_leave_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."nurse_leave_requests" TO "service_role";



GRANT ALL ON TABLE "public"."nurse_references" TO "anon";
GRANT ALL ON TABLE "public"."nurse_references" TO "authenticated";
GRANT ALL ON TABLE "public"."nurse_references" TO "service_role";



GRANT ALL ON SEQUENCE "public"."nurse_references_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."nurse_references_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."nurse_references_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."nurses" TO "anon";
GRANT ALL ON TABLE "public"."nurses" TO "authenticated";
GRANT ALL ON TABLE "public"."nurses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."nurses_nurse_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."nurses_nurse_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."nurses_nurse_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organization_clients" TO "anon";
GRANT ALL ON TABLE "public"."organization_clients" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_clients" TO "service_role";



GRANT ALL ON TABLE "public"."otp" TO "anon";
GRANT ALL ON TABLE "public"."otp" TO "authenticated";
GRANT ALL ON TABLE "public"."otp" TO "service_role";



GRANT ALL ON SEQUENCE "public"."otp_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."otp_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."otp_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_assessments" TO "anon";
GRANT ALL ON TABLE "public"."patient_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."registration_counters" TO "anon";
GRANT ALL ON TABLE "public"."registration_counters" TO "authenticated";
GRANT ALL ON TABLE "public"."registration_counters" TO "service_role";



GRANT ALL ON TABLE "public"."reminders" TO "anon";
GRANT ALL ON TABLE "public"."reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."reminders" TO "service_role";



GRANT ALL ON TABLE "public"."salary_configurations" TO "anon";
GRANT ALL ON TABLE "public"."salary_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."salary_configurations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."salary_configurations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."salary_configurations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."salary_configurations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."salary_payments" TO "anon";
GRANT ALL ON TABLE "public"."salary_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."salary_payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."salary_payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."salary_payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."salary_payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_notifications" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."shift_summary" TO "anon";
GRANT ALL ON TABLE "public"."shift_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_summary" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shift_summary_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shift_summary_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shift_summary_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."staff_requirements" TO "anon";
GRANT ALL ON TABLE "public"."staff_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."student_academics" TO "anon";
GRANT ALL ON TABLE "public"."student_academics" TO "authenticated";
GRANT ALL ON TABLE "public"."student_academics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_academics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_academics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_academics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_experience" TO "anon";
GRANT ALL ON TABLE "public"."student_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."student_experience" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_experience_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_experience_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_experience_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_guardian" TO "anon";
GRANT ALL ON TABLE "public"."student_guardian" TO "authenticated";
GRANT ALL ON TABLE "public"."student_guardian" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_guardian_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_guardian_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_guardian_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_leave_request" TO "anon";
GRANT ALL ON TABLE "public"."student_leave_request" TO "authenticated";
GRANT ALL ON TABLE "public"."student_leave_request" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_leave_request_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_leave_request_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_leave_request_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_preferences" TO "anon";
GRANT ALL ON TABLE "public"."student_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."student_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_register_seq" TO "anon";
GRANT ALL ON TABLE "public"."student_register_seq" TO "authenticated";
GRANT ALL ON TABLE "public"."student_register_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_source" TO "anon";
GRANT ALL ON TABLE "public"."student_source" TO "authenticated";
GRANT ALL ON TABLE "public"."student_source" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_source_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_source_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_source_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_users" TO "anon";
GRANT ALL ON TABLE "public"."student_users" TO "authenticated";
GRANT ALL ON TABLE "public"."student_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."students_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."supervisor_assignment" TO "anon";
GRANT ALL ON TABLE "public"."supervisor_assignment" TO "authenticated";
GRANT ALL ON TABLE "public"."supervisor_assignment" TO "service_role";



GRANT ALL ON SEQUENCE "public"."supervisor_assignment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supervisor_assignment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supervisor_assignment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."supervisor_users" TO "anon";
GRANT ALL ON TABLE "public"."supervisor_users" TO "authenticated";
GRANT ALL ON TABLE "public"."supervisor_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."supervisor_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supervisor_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supervisor_users_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
