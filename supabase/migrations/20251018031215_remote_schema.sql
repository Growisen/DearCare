alter table "public"."dearcare_salary_calculation_runs" drop constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."salary_payments" drop constraint "salary_payments_payment_status_check";

alter table "public"."dearcare_salary_calculation_runs" add constraint "dearcare_salary_calculation_runs_execution_status_check" CHECK (((execution_status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::text[]))) not valid;

alter table "public"."dearcare_salary_calculation_runs" validate constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."salary_payments" add constraint "salary_payments_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."salary_payments" validate constraint "salary_payments_payment_status_check";



  create policy "Give access to all file to all user 8jdugz_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'dearcare'::text));



  create policy "Give access to all file to all user 8jdugz_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'dearcare'::text));



  create policy "Give all access to a students (testing) 9laymb_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'DearCare'::text) AND ((storage.foldername(name))[1] = 'Students'::text)));



  create policy "Give all access to a students (testing) 9laymb_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'DearCare'::text) AND ((storage.foldername(name))[1] = 'Students'::text)));



  create policy "Give all access to a students (testing) 9laymb_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'DearCare'::text) AND ((storage.foldername(name))[1] = 'Students'::text)));



  create policy "Give all access to a students (testing) 9laymb_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'DearCare'::text) AND ((storage.foldername(name))[1] = 'Students'::text)));



  create policy "Give anon users access to JPG images in folder 9laymb_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'DearCare'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 9laymb_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'DearCare'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 9laymb_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'DearCare'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 9laymb_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'DearCare'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "allow_submit_report_media 9laymb_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, anon, service_role
with check ((bucket_id = 'DearCare'::text));



  create policy "allow_submit_report_media 9laymb_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated, anon, service_role
using ((bucket_id = 'DearCare'::text));



  create policy "allow_submit_report_media 9laymb_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated, anon, service_role
using ((bucket_id = 'DearCare'::text));



  create policy "allow_submit_report_media 9laymb_3"
  on "storage"."objects"
  as permissive
  for update
  to authenticated, anon, service_role
using ((bucket_id = 'DearCare'::text));



  create policy "sample 9laymb_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'DearCare'::text));



  create policy "sample 9laymb_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'DearCare'::text));



  create policy "sample 9laymb_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'DearCare'::text));



  create policy "sample 9laymb_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'DearCare'::text));



