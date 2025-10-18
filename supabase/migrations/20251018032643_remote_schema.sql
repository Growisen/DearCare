alter table "public"."dearcare_salary_calculation_runs" drop constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."salary_payments" drop constraint "salary_payments_payment_status_check";

alter table "public"."dearcare_salary_calculation_runs" add constraint "dearcare_salary_calculation_runs_execution_status_check" CHECK (((execution_status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::text[]))) not valid;

alter table "public"."dearcare_salary_calculation_runs" validate constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."salary_payments" add constraint "salary_payments_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."salary_payments" validate constraint "salary_payments_payment_status_check";



