create type "public"."tenant" as enum ('TATANursing', 'Dearcare', 'DearcareAcademy');

create sequence "public"."tatahomenursing_salary_calculation_runs_id_seq";

revoke delete on table "public"."academy_courses" from "anon";

revoke insert on table "public"."academy_courses" from "anon";

revoke references on table "public"."academy_courses" from "anon";

revoke select on table "public"."academy_courses" from "anon";

revoke trigger on table "public"."academy_courses" from "anon";

revoke truncate on table "public"."academy_courses" from "anon";

revoke update on table "public"."academy_courses" from "anon";

revoke delete on table "public"."academy_courses" from "authenticated";

revoke insert on table "public"."academy_courses" from "authenticated";

revoke references on table "public"."academy_courses" from "authenticated";

revoke select on table "public"."academy_courses" from "authenticated";

revoke trigger on table "public"."academy_courses" from "authenticated";

revoke truncate on table "public"."academy_courses" from "authenticated";

revoke update on table "public"."academy_courses" from "authenticated";

revoke delete on table "public"."academy_courses" from "service_role";

revoke insert on table "public"."academy_courses" from "service_role";

revoke references on table "public"."academy_courses" from "service_role";

revoke select on table "public"."academy_courses" from "service_role";

revoke trigger on table "public"."academy_courses" from "service_role";

revoke truncate on table "public"."academy_courses" from "service_role";

revoke update on table "public"."academy_courses" from "service_role";

revoke delete on table "public"."academy_enquiries" from "anon";

revoke insert on table "public"."academy_enquiries" from "anon";

revoke references on table "public"."academy_enquiries" from "anon";

revoke select on table "public"."academy_enquiries" from "anon";

revoke trigger on table "public"."academy_enquiries" from "anon";

revoke truncate on table "public"."academy_enquiries" from "anon";

revoke update on table "public"."academy_enquiries" from "anon";

revoke delete on table "public"."academy_enquiries" from "authenticated";

revoke insert on table "public"."academy_enquiries" from "authenticated";

revoke references on table "public"."academy_enquiries" from "authenticated";

revoke select on table "public"."academy_enquiries" from "authenticated";

revoke trigger on table "public"."academy_enquiries" from "authenticated";

revoke truncate on table "public"."academy_enquiries" from "authenticated";

revoke update on table "public"."academy_enquiries" from "authenticated";

revoke delete on table "public"."academy_enquiries" from "service_role";

revoke insert on table "public"."academy_enquiries" from "service_role";

revoke references on table "public"."academy_enquiries" from "service_role";

revoke select on table "public"."academy_enquiries" from "service_role";

revoke trigger on table "public"."academy_enquiries" from "service_role";

revoke truncate on table "public"."academy_enquiries" from "service_role";

revoke update on table "public"."academy_enquiries" from "service_role";

revoke delete on table "public"."academy_faculties" from "anon";

revoke insert on table "public"."academy_faculties" from "anon";

revoke references on table "public"."academy_faculties" from "anon";

revoke select on table "public"."academy_faculties" from "anon";

revoke trigger on table "public"."academy_faculties" from "anon";

revoke truncate on table "public"."academy_faculties" from "anon";

revoke update on table "public"."academy_faculties" from "anon";

revoke delete on table "public"."academy_faculties" from "authenticated";

revoke insert on table "public"."academy_faculties" from "authenticated";

revoke references on table "public"."academy_faculties" from "authenticated";

revoke select on table "public"."academy_faculties" from "authenticated";

revoke trigger on table "public"."academy_faculties" from "authenticated";

revoke truncate on table "public"."academy_faculties" from "authenticated";

revoke update on table "public"."academy_faculties" from "authenticated";

revoke delete on table "public"."academy_faculties" from "service_role";

revoke insert on table "public"."academy_faculties" from "service_role";

revoke references on table "public"."academy_faculties" from "service_role";

revoke select on table "public"."academy_faculties" from "service_role";

revoke trigger on table "public"."academy_faculties" from "service_role";

revoke truncate on table "public"."academy_faculties" from "service_role";

revoke update on table "public"."academy_faculties" from "service_role";

revoke delete on table "public"."academy_rejects" from "anon";

revoke insert on table "public"."academy_rejects" from "anon";

revoke references on table "public"."academy_rejects" from "anon";

revoke select on table "public"."academy_rejects" from "anon";

revoke trigger on table "public"."academy_rejects" from "anon";

revoke truncate on table "public"."academy_rejects" from "anon";

revoke update on table "public"."academy_rejects" from "anon";

revoke delete on table "public"."academy_rejects" from "authenticated";

revoke insert on table "public"."academy_rejects" from "authenticated";

revoke references on table "public"."academy_rejects" from "authenticated";

revoke select on table "public"."academy_rejects" from "authenticated";

revoke trigger on table "public"."academy_rejects" from "authenticated";

revoke truncate on table "public"."academy_rejects" from "authenticated";

revoke update on table "public"."academy_rejects" from "authenticated";

revoke delete on table "public"."academy_rejects" from "service_role";

revoke insert on table "public"."academy_rejects" from "service_role";

revoke references on table "public"."academy_rejects" from "service_role";

revoke select on table "public"."academy_rejects" from "service_role";

revoke trigger on table "public"."academy_rejects" from "service_role";

revoke truncate on table "public"."academy_rejects" from "service_role";

revoke update on table "public"."academy_rejects" from "service_role";

revoke delete on table "public"."academy_roles" from "anon";

revoke insert on table "public"."academy_roles" from "anon";

revoke references on table "public"."academy_roles" from "anon";

revoke select on table "public"."academy_roles" from "anon";

revoke trigger on table "public"."academy_roles" from "anon";

revoke truncate on table "public"."academy_roles" from "anon";

revoke update on table "public"."academy_roles" from "anon";

revoke delete on table "public"."academy_roles" from "authenticated";

revoke insert on table "public"."academy_roles" from "authenticated";

revoke references on table "public"."academy_roles" from "authenticated";

revoke select on table "public"."academy_roles" from "authenticated";

revoke trigger on table "public"."academy_roles" from "authenticated";

revoke truncate on table "public"."academy_roles" from "authenticated";

revoke update on table "public"."academy_roles" from "authenticated";

revoke delete on table "public"."academy_roles" from "service_role";

revoke insert on table "public"."academy_roles" from "service_role";

revoke references on table "public"."academy_roles" from "service_role";

revoke select on table "public"."academy_roles" from "service_role";

revoke trigger on table "public"."academy_roles" from "service_role";

revoke truncate on table "public"."academy_roles" from "service_role";

revoke update on table "public"."academy_roles" from "service_role";

revoke delete on table "public"."academy_student_attendance" from "anon";

revoke insert on table "public"."academy_student_attendance" from "anon";

revoke references on table "public"."academy_student_attendance" from "anon";

revoke select on table "public"."academy_student_attendance" from "anon";

revoke trigger on table "public"."academy_student_attendance" from "anon";

revoke truncate on table "public"."academy_student_attendance" from "anon";

revoke update on table "public"."academy_student_attendance" from "anon";

revoke delete on table "public"."academy_student_attendance" from "authenticated";

revoke insert on table "public"."academy_student_attendance" from "authenticated";

revoke references on table "public"."academy_student_attendance" from "authenticated";

revoke select on table "public"."academy_student_attendance" from "authenticated";

revoke trigger on table "public"."academy_student_attendance" from "authenticated";

revoke truncate on table "public"."academy_student_attendance" from "authenticated";

revoke update on table "public"."academy_student_attendance" from "authenticated";

revoke delete on table "public"."academy_student_attendance" from "service_role";

revoke insert on table "public"."academy_student_attendance" from "service_role";

revoke references on table "public"."academy_student_attendance" from "service_role";

revoke select on table "public"."academy_student_attendance" from "service_role";

revoke trigger on table "public"."academy_student_attendance" from "service_role";

revoke truncate on table "public"."academy_student_attendance" from "service_role";

revoke update on table "public"."academy_student_attendance" from "service_role";

revoke delete on table "public"."academy_supervisors" from "anon";

revoke insert on table "public"."academy_supervisors" from "anon";

revoke references on table "public"."academy_supervisors" from "anon";

revoke select on table "public"."academy_supervisors" from "anon";

revoke trigger on table "public"."academy_supervisors" from "anon";

revoke truncate on table "public"."academy_supervisors" from "anon";

revoke update on table "public"."academy_supervisors" from "anon";

revoke delete on table "public"."academy_supervisors" from "authenticated";

revoke insert on table "public"."academy_supervisors" from "authenticated";

revoke references on table "public"."academy_supervisors" from "authenticated";

revoke select on table "public"."academy_supervisors" from "authenticated";

revoke trigger on table "public"."academy_supervisors" from "authenticated";

revoke truncate on table "public"."academy_supervisors" from "authenticated";

revoke update on table "public"."academy_supervisors" from "authenticated";

revoke delete on table "public"."academy_supervisors" from "service_role";

revoke insert on table "public"."academy_supervisors" from "service_role";

revoke references on table "public"."academy_supervisors" from "service_role";

revoke select on table "public"."academy_supervisors" from "service_role";

revoke trigger on table "public"."academy_supervisors" from "service_role";

revoke truncate on table "public"."academy_supervisors" from "service_role";

revoke update on table "public"."academy_supervisors" from "service_role";

revoke delete on table "public"."admin_dashboard_todos" from "anon";

revoke insert on table "public"."admin_dashboard_todos" from "anon";

revoke references on table "public"."admin_dashboard_todos" from "anon";

revoke select on table "public"."admin_dashboard_todos" from "anon";

revoke trigger on table "public"."admin_dashboard_todos" from "anon";

revoke truncate on table "public"."admin_dashboard_todos" from "anon";

revoke update on table "public"."admin_dashboard_todos" from "anon";

revoke delete on table "public"."admin_dashboard_todos" from "authenticated";

revoke insert on table "public"."admin_dashboard_todos" from "authenticated";

revoke references on table "public"."admin_dashboard_todos" from "authenticated";

revoke select on table "public"."admin_dashboard_todos" from "authenticated";

revoke trigger on table "public"."admin_dashboard_todos" from "authenticated";

revoke truncate on table "public"."admin_dashboard_todos" from "authenticated";

revoke update on table "public"."admin_dashboard_todos" from "authenticated";

revoke delete on table "public"."admin_dashboard_todos" from "service_role";

revoke insert on table "public"."admin_dashboard_todos" from "service_role";

revoke references on table "public"."admin_dashboard_todos" from "service_role";

revoke select on table "public"."admin_dashboard_todos" from "service_role";

revoke trigger on table "public"."admin_dashboard_todos" from "service_role";

revoke truncate on table "public"."admin_dashboard_todos" from "service_role";

revoke update on table "public"."admin_dashboard_todos" from "service_role";

revoke delete on table "public"."attendence_individual" from "anon";

revoke insert on table "public"."attendence_individual" from "anon";

revoke references on table "public"."attendence_individual" from "anon";

revoke select on table "public"."attendence_individual" from "anon";

revoke trigger on table "public"."attendence_individual" from "anon";

revoke truncate on table "public"."attendence_individual" from "anon";

revoke update on table "public"."attendence_individual" from "anon";

revoke delete on table "public"."attendence_individual" from "authenticated";

revoke insert on table "public"."attendence_individual" from "authenticated";

revoke references on table "public"."attendence_individual" from "authenticated";

revoke select on table "public"."attendence_individual" from "authenticated";

revoke trigger on table "public"."attendence_individual" from "authenticated";

revoke truncate on table "public"."attendence_individual" from "authenticated";

revoke update on table "public"."attendence_individual" from "authenticated";

revoke delete on table "public"."attendence_individual" from "service_role";

revoke insert on table "public"."attendence_individual" from "service_role";

revoke references on table "public"."attendence_individual" from "service_role";

revoke select on table "public"."attendence_individual" from "service_role";

revoke trigger on table "public"."attendence_individual" from "service_role";

revoke truncate on table "public"."attendence_individual" from "service_role";

revoke update on table "public"."attendence_individual" from "service_role";

revoke delete on table "public"."client_files" from "anon";

revoke insert on table "public"."client_files" from "anon";

revoke references on table "public"."client_files" from "anon";

revoke select on table "public"."client_files" from "anon";

revoke trigger on table "public"."client_files" from "anon";

revoke truncate on table "public"."client_files" from "anon";

revoke update on table "public"."client_files" from "anon";

revoke delete on table "public"."client_files" from "authenticated";

revoke insert on table "public"."client_files" from "authenticated";

revoke references on table "public"."client_files" from "authenticated";

revoke select on table "public"."client_files" from "authenticated";

revoke trigger on table "public"."client_files" from "authenticated";

revoke truncate on table "public"."client_files" from "authenticated";

revoke update on table "public"."client_files" from "authenticated";

revoke delete on table "public"."client_files" from "service_role";

revoke insert on table "public"."client_files" from "service_role";

revoke references on table "public"."client_files" from "service_role";

revoke select on table "public"."client_files" from "service_role";

revoke trigger on table "public"."client_files" from "service_role";

revoke truncate on table "public"."client_files" from "service_role";

revoke update on table "public"."client_files" from "service_role";

revoke delete on table "public"."client_payment_line_items" from "anon";

revoke insert on table "public"."client_payment_line_items" from "anon";

revoke references on table "public"."client_payment_line_items" from "anon";

revoke select on table "public"."client_payment_line_items" from "anon";

revoke trigger on table "public"."client_payment_line_items" from "anon";

revoke truncate on table "public"."client_payment_line_items" from "anon";

revoke update on table "public"."client_payment_line_items" from "anon";

revoke delete on table "public"."client_payment_line_items" from "authenticated";

revoke insert on table "public"."client_payment_line_items" from "authenticated";

revoke references on table "public"."client_payment_line_items" from "authenticated";

revoke select on table "public"."client_payment_line_items" from "authenticated";

revoke trigger on table "public"."client_payment_line_items" from "authenticated";

revoke truncate on table "public"."client_payment_line_items" from "authenticated";

revoke update on table "public"."client_payment_line_items" from "authenticated";

revoke delete on table "public"."client_payment_line_items" from "service_role";

revoke insert on table "public"."client_payment_line_items" from "service_role";

revoke references on table "public"."client_payment_line_items" from "service_role";

revoke select on table "public"."client_payment_line_items" from "service_role";

revoke trigger on table "public"."client_payment_line_items" from "service_role";

revoke truncate on table "public"."client_payment_line_items" from "service_role";

revoke update on table "public"."client_payment_line_items" from "service_role";

revoke delete on table "public"."client_payment_records" from "anon";

revoke insert on table "public"."client_payment_records" from "anon";

revoke references on table "public"."client_payment_records" from "anon";

revoke select on table "public"."client_payment_records" from "anon";

revoke trigger on table "public"."client_payment_records" from "anon";

revoke truncate on table "public"."client_payment_records" from "anon";

revoke update on table "public"."client_payment_records" from "anon";

revoke delete on table "public"."client_payment_records" from "authenticated";

revoke insert on table "public"."client_payment_records" from "authenticated";

revoke references on table "public"."client_payment_records" from "authenticated";

revoke select on table "public"."client_payment_records" from "authenticated";

revoke trigger on table "public"."client_payment_records" from "authenticated";

revoke truncate on table "public"."client_payment_records" from "authenticated";

revoke update on table "public"."client_payment_records" from "authenticated";

revoke delete on table "public"."client_payment_records" from "service_role";

revoke insert on table "public"."client_payment_records" from "service_role";

revoke references on table "public"."client_payment_records" from "service_role";

revoke select on table "public"."client_payment_records" from "service_role";

revoke trigger on table "public"."client_payment_records" from "service_role";

revoke truncate on table "public"."client_payment_records" from "service_role";

revoke update on table "public"."client_payment_records" from "service_role";

revoke delete on table "public"."clients" from "anon";

revoke insert on table "public"."clients" from "anon";

revoke references on table "public"."clients" from "anon";

revoke select on table "public"."clients" from "anon";

revoke trigger on table "public"."clients" from "anon";

revoke truncate on table "public"."clients" from "anon";

revoke update on table "public"."clients" from "anon";

revoke delete on table "public"."clients" from "authenticated";

revoke insert on table "public"."clients" from "authenticated";

revoke references on table "public"."clients" from "authenticated";

revoke select on table "public"."clients" from "authenticated";

revoke trigger on table "public"."clients" from "authenticated";

revoke truncate on table "public"."clients" from "authenticated";

revoke update on table "public"."clients" from "authenticated";

revoke delete on table "public"."clients" from "service_role";

revoke insert on table "public"."clients" from "service_role";

revoke references on table "public"."clients" from "service_role";

revoke select on table "public"."clients" from "service_role";

revoke trigger on table "public"."clients" from "service_role";

revoke truncate on table "public"."clients" from "service_role";

revoke update on table "public"."clients" from "service_role";

revoke delete on table "public"."course_abbreviations" from "anon";

revoke insert on table "public"."course_abbreviations" from "anon";

revoke references on table "public"."course_abbreviations" from "anon";

revoke select on table "public"."course_abbreviations" from "anon";

revoke trigger on table "public"."course_abbreviations" from "anon";

revoke truncate on table "public"."course_abbreviations" from "anon";

revoke update on table "public"."course_abbreviations" from "anon";

revoke delete on table "public"."course_abbreviations" from "authenticated";

revoke insert on table "public"."course_abbreviations" from "authenticated";

revoke references on table "public"."course_abbreviations" from "authenticated";

revoke select on table "public"."course_abbreviations" from "authenticated";

revoke trigger on table "public"."course_abbreviations" from "authenticated";

revoke truncate on table "public"."course_abbreviations" from "authenticated";

revoke update on table "public"."course_abbreviations" from "authenticated";

revoke delete on table "public"."course_abbreviations" from "service_role";

revoke insert on table "public"."course_abbreviations" from "service_role";

revoke references on table "public"."course_abbreviations" from "service_role";

revoke select on table "public"."course_abbreviations" from "service_role";

revoke trigger on table "public"."course_abbreviations" from "service_role";

revoke truncate on table "public"."course_abbreviations" from "service_role";

revoke update on table "public"."course_abbreviations" from "service_role";

revoke delete on table "public"."day_book" from "anon";

revoke insert on table "public"."day_book" from "anon";

revoke references on table "public"."day_book" from "anon";

revoke select on table "public"."day_book" from "anon";

revoke trigger on table "public"."day_book" from "anon";

revoke truncate on table "public"."day_book" from "anon";

revoke update on table "public"."day_book" from "anon";

revoke delete on table "public"."day_book" from "authenticated";

revoke insert on table "public"."day_book" from "authenticated";

revoke references on table "public"."day_book" from "authenticated";

revoke select on table "public"."day_book" from "authenticated";

revoke trigger on table "public"."day_book" from "authenticated";

revoke truncate on table "public"."day_book" from "authenticated";

revoke update on table "public"."day_book" from "authenticated";

revoke delete on table "public"."day_book" from "service_role";

revoke insert on table "public"."day_book" from "service_role";

revoke references on table "public"."day_book" from "service_role";

revoke select on table "public"."day_book" from "service_role";

revoke trigger on table "public"."day_book" from "service_role";

revoke truncate on table "public"."day_book" from "service_role";

revoke update on table "public"."day_book" from "service_role";

revoke delete on table "public"."dearcare_complaint_resolutions" from "anon";

revoke insert on table "public"."dearcare_complaint_resolutions" from "anon";

revoke references on table "public"."dearcare_complaint_resolutions" from "anon";

revoke select on table "public"."dearcare_complaint_resolutions" from "anon";

revoke trigger on table "public"."dearcare_complaint_resolutions" from "anon";

revoke truncate on table "public"."dearcare_complaint_resolutions" from "anon";

revoke update on table "public"."dearcare_complaint_resolutions" from "anon";

revoke delete on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke insert on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke references on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke select on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke trigger on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke truncate on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke update on table "public"."dearcare_complaint_resolutions" from "authenticated";

revoke delete on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke insert on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke references on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke select on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke trigger on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke truncate on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke update on table "public"."dearcare_complaint_resolutions" from "service_role";

revoke delete on table "public"."dearcare_complaints" from "anon";

revoke insert on table "public"."dearcare_complaints" from "anon";

revoke references on table "public"."dearcare_complaints" from "anon";

revoke select on table "public"."dearcare_complaints" from "anon";

revoke trigger on table "public"."dearcare_complaints" from "anon";

revoke truncate on table "public"."dearcare_complaints" from "anon";

revoke update on table "public"."dearcare_complaints" from "anon";

revoke delete on table "public"."dearcare_complaints" from "authenticated";

revoke insert on table "public"."dearcare_complaints" from "authenticated";

revoke references on table "public"."dearcare_complaints" from "authenticated";

revoke select on table "public"."dearcare_complaints" from "authenticated";

revoke trigger on table "public"."dearcare_complaints" from "authenticated";

revoke truncate on table "public"."dearcare_complaints" from "authenticated";

revoke update on table "public"."dearcare_complaints" from "authenticated";

revoke delete on table "public"."dearcare_complaints" from "service_role";

revoke insert on table "public"."dearcare_complaints" from "service_role";

revoke references on table "public"."dearcare_complaints" from "service_role";

revoke select on table "public"."dearcare_complaints" from "service_role";

revoke trigger on table "public"."dearcare_complaints" from "service_role";

revoke truncate on table "public"."dearcare_complaints" from "service_role";

revoke update on table "public"."dearcare_complaints" from "service_role";

revoke delete on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke insert on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke references on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke select on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke trigger on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke truncate on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke update on table "public"."dearcare_salary_calculation_runs" from "anon";

revoke delete on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke insert on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke references on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke select on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke trigger on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke truncate on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke update on table "public"."dearcare_salary_calculation_runs" from "authenticated";

revoke delete on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke insert on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke references on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke select on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke trigger on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke truncate on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke update on table "public"."dearcare_salary_calculation_runs" from "service_role";

revoke delete on table "public"."dearcare_services_enquiries" from "anon";

revoke insert on table "public"."dearcare_services_enquiries" from "anon";

revoke references on table "public"."dearcare_services_enquiries" from "anon";

revoke select on table "public"."dearcare_services_enquiries" from "anon";

revoke trigger on table "public"."dearcare_services_enquiries" from "anon";

revoke truncate on table "public"."dearcare_services_enquiries" from "anon";

revoke update on table "public"."dearcare_services_enquiries" from "anon";

revoke delete on table "public"."dearcare_services_enquiries" from "authenticated";

revoke insert on table "public"."dearcare_services_enquiries" from "authenticated";

revoke references on table "public"."dearcare_services_enquiries" from "authenticated";

revoke select on table "public"."dearcare_services_enquiries" from "authenticated";

revoke trigger on table "public"."dearcare_services_enquiries" from "authenticated";

revoke truncate on table "public"."dearcare_services_enquiries" from "authenticated";

revoke update on table "public"."dearcare_services_enquiries" from "authenticated";

revoke delete on table "public"."dearcare_services_enquiries" from "service_role";

revoke insert on table "public"."dearcare_services_enquiries" from "service_role";

revoke references on table "public"."dearcare_services_enquiries" from "service_role";

revoke select on table "public"."dearcare_services_enquiries" from "service_role";

revoke trigger on table "public"."dearcare_services_enquiries" from "service_role";

revoke truncate on table "public"."dearcare_services_enquiries" from "service_role";

revoke update on table "public"."dearcare_services_enquiries" from "service_role";

revoke delete on table "public"."dearcare_staff" from "anon";

revoke insert on table "public"."dearcare_staff" from "anon";

revoke references on table "public"."dearcare_staff" from "anon";

revoke select on table "public"."dearcare_staff" from "anon";

revoke trigger on table "public"."dearcare_staff" from "anon";

revoke truncate on table "public"."dearcare_staff" from "anon";

revoke update on table "public"."dearcare_staff" from "anon";

revoke delete on table "public"."dearcare_staff" from "authenticated";

revoke insert on table "public"."dearcare_staff" from "authenticated";

revoke references on table "public"."dearcare_staff" from "authenticated";

revoke select on table "public"."dearcare_staff" from "authenticated";

revoke trigger on table "public"."dearcare_staff" from "authenticated";

revoke truncate on table "public"."dearcare_staff" from "authenticated";

revoke update on table "public"."dearcare_staff" from "authenticated";

revoke delete on table "public"."dearcare_staff" from "service_role";

revoke insert on table "public"."dearcare_staff" from "service_role";

revoke references on table "public"."dearcare_staff" from "service_role";

revoke select on table "public"."dearcare_staff" from "service_role";

revoke trigger on table "public"."dearcare_staff" from "service_role";

revoke truncate on table "public"."dearcare_staff" from "service_role";

revoke update on table "public"."dearcare_staff" from "service_role";

revoke delete on table "public"."dearcare_web_notifications" from "anon";

revoke insert on table "public"."dearcare_web_notifications" from "anon";

revoke references on table "public"."dearcare_web_notifications" from "anon";

revoke select on table "public"."dearcare_web_notifications" from "anon";

revoke trigger on table "public"."dearcare_web_notifications" from "anon";

revoke truncate on table "public"."dearcare_web_notifications" from "anon";

revoke update on table "public"."dearcare_web_notifications" from "anon";

revoke delete on table "public"."dearcare_web_notifications" from "authenticated";

revoke insert on table "public"."dearcare_web_notifications" from "authenticated";

revoke references on table "public"."dearcare_web_notifications" from "authenticated";

revoke select on table "public"."dearcare_web_notifications" from "authenticated";

revoke trigger on table "public"."dearcare_web_notifications" from "authenticated";

revoke truncate on table "public"."dearcare_web_notifications" from "authenticated";

revoke update on table "public"."dearcare_web_notifications" from "authenticated";

revoke delete on table "public"."dearcare_web_notifications" from "service_role";

revoke insert on table "public"."dearcare_web_notifications" from "service_role";

revoke references on table "public"."dearcare_web_notifications" from "service_role";

revoke select on table "public"."dearcare_web_notifications" from "service_role";

revoke trigger on table "public"."dearcare_web_notifications" from "service_role";

revoke truncate on table "public"."dearcare_web_notifications" from "service_role";

revoke update on table "public"."dearcare_web_notifications" from "service_role";

revoke delete on table "public"."dearcare_web_users" from "anon";

revoke insert on table "public"."dearcare_web_users" from "anon";

revoke references on table "public"."dearcare_web_users" from "anon";

revoke select on table "public"."dearcare_web_users" from "anon";

revoke trigger on table "public"."dearcare_web_users" from "anon";

revoke truncate on table "public"."dearcare_web_users" from "anon";

revoke update on table "public"."dearcare_web_users" from "anon";

revoke delete on table "public"."dearcare_web_users" from "authenticated";

revoke insert on table "public"."dearcare_web_users" from "authenticated";

revoke references on table "public"."dearcare_web_users" from "authenticated";

revoke select on table "public"."dearcare_web_users" from "authenticated";

revoke trigger on table "public"."dearcare_web_users" from "authenticated";

revoke truncate on table "public"."dearcare_web_users" from "authenticated";

revoke update on table "public"."dearcare_web_users" from "authenticated";

revoke delete on table "public"."dearcare_web_users" from "service_role";

revoke insert on table "public"."dearcare_web_users" from "service_role";

revoke references on table "public"."dearcare_web_users" from "service_role";

revoke select on table "public"."dearcare_web_users" from "service_role";

revoke trigger on table "public"."dearcare_web_users" from "service_role";

revoke truncate on table "public"."dearcare_web_users" from "service_role";

revoke update on table "public"."dearcare_web_users" from "service_role";

revoke delete on table "public"."faculty_assignment" from "anon";

revoke insert on table "public"."faculty_assignment" from "anon";

revoke references on table "public"."faculty_assignment" from "anon";

revoke select on table "public"."faculty_assignment" from "anon";

revoke trigger on table "public"."faculty_assignment" from "anon";

revoke truncate on table "public"."faculty_assignment" from "anon";

revoke update on table "public"."faculty_assignment" from "anon";

revoke delete on table "public"."faculty_assignment" from "authenticated";

revoke insert on table "public"."faculty_assignment" from "authenticated";

revoke references on table "public"."faculty_assignment" from "authenticated";

revoke select on table "public"."faculty_assignment" from "authenticated";

revoke trigger on table "public"."faculty_assignment" from "authenticated";

revoke truncate on table "public"."faculty_assignment" from "authenticated";

revoke update on table "public"."faculty_assignment" from "authenticated";

revoke delete on table "public"."faculty_assignment" from "service_role";

revoke insert on table "public"."faculty_assignment" from "service_role";

revoke references on table "public"."faculty_assignment" from "service_role";

revoke select on table "public"."faculty_assignment" from "service_role";

revoke trigger on table "public"."faculty_assignment" from "service_role";

revoke truncate on table "public"."faculty_assignment" from "service_role";

revoke update on table "public"."faculty_assignment" from "service_role";

revoke delete on table "public"."faculty_experiences" from "anon";

revoke insert on table "public"."faculty_experiences" from "anon";

revoke references on table "public"."faculty_experiences" from "anon";

revoke select on table "public"."faculty_experiences" from "anon";

revoke trigger on table "public"."faculty_experiences" from "anon";

revoke truncate on table "public"."faculty_experiences" from "anon";

revoke update on table "public"."faculty_experiences" from "anon";

revoke delete on table "public"."faculty_experiences" from "authenticated";

revoke insert on table "public"."faculty_experiences" from "authenticated";

revoke references on table "public"."faculty_experiences" from "authenticated";

revoke select on table "public"."faculty_experiences" from "authenticated";

revoke trigger on table "public"."faculty_experiences" from "authenticated";

revoke truncate on table "public"."faculty_experiences" from "authenticated";

revoke update on table "public"."faculty_experiences" from "authenticated";

revoke delete on table "public"."faculty_experiences" from "service_role";

revoke insert on table "public"."faculty_experiences" from "service_role";

revoke references on table "public"."faculty_experiences" from "service_role";

revoke select on table "public"."faculty_experiences" from "service_role";

revoke trigger on table "public"."faculty_experiences" from "service_role";

revoke truncate on table "public"."faculty_experiences" from "service_role";

revoke update on table "public"."faculty_experiences" from "service_role";

revoke delete on table "public"."faculty_register_seq" from "anon";

revoke insert on table "public"."faculty_register_seq" from "anon";

revoke references on table "public"."faculty_register_seq" from "anon";

revoke select on table "public"."faculty_register_seq" from "anon";

revoke trigger on table "public"."faculty_register_seq" from "anon";

revoke truncate on table "public"."faculty_register_seq" from "anon";

revoke update on table "public"."faculty_register_seq" from "anon";

revoke delete on table "public"."faculty_register_seq" from "authenticated";

revoke insert on table "public"."faculty_register_seq" from "authenticated";

revoke references on table "public"."faculty_register_seq" from "authenticated";

revoke select on table "public"."faculty_register_seq" from "authenticated";

revoke trigger on table "public"."faculty_register_seq" from "authenticated";

revoke truncate on table "public"."faculty_register_seq" from "authenticated";

revoke update on table "public"."faculty_register_seq" from "authenticated";

revoke delete on table "public"."faculty_register_seq" from "service_role";

revoke insert on table "public"."faculty_register_seq" from "service_role";

revoke references on table "public"."faculty_register_seq" from "service_role";

revoke select on table "public"."faculty_register_seq" from "service_role";

revoke trigger on table "public"."faculty_register_seq" from "service_role";

revoke truncate on table "public"."faculty_register_seq" from "service_role";

revoke update on table "public"."faculty_register_seq" from "service_role";

revoke delete on table "public"."individual_clients" from "anon";

revoke insert on table "public"."individual_clients" from "anon";

revoke references on table "public"."individual_clients" from "anon";

revoke select on table "public"."individual_clients" from "anon";

revoke trigger on table "public"."individual_clients" from "anon";

revoke truncate on table "public"."individual_clients" from "anon";

revoke update on table "public"."individual_clients" from "anon";

revoke delete on table "public"."individual_clients" from "authenticated";

revoke insert on table "public"."individual_clients" from "authenticated";

revoke references on table "public"."individual_clients" from "authenticated";

revoke select on table "public"."individual_clients" from "authenticated";

revoke trigger on table "public"."individual_clients" from "authenticated";

revoke truncate on table "public"."individual_clients" from "authenticated";

revoke update on table "public"."individual_clients" from "authenticated";

revoke delete on table "public"."individual_clients" from "service_role";

revoke insert on table "public"."individual_clients" from "service_role";

revoke references on table "public"."individual_clients" from "service_role";

revoke select on table "public"."individual_clients" from "service_role";

revoke trigger on table "public"."individual_clients" from "service_role";

revoke truncate on table "public"."individual_clients" from "service_role";

revoke update on table "public"."individual_clients" from "service_role";

revoke delete on table "public"."nurse_client" from "anon";

revoke insert on table "public"."nurse_client" from "anon";

revoke references on table "public"."nurse_client" from "anon";

revoke select on table "public"."nurse_client" from "anon";

revoke trigger on table "public"."nurse_client" from "anon";

revoke truncate on table "public"."nurse_client" from "anon";

revoke update on table "public"."nurse_client" from "anon";

revoke delete on table "public"."nurse_client" from "authenticated";

revoke insert on table "public"."nurse_client" from "authenticated";

revoke references on table "public"."nurse_client" from "authenticated";

revoke select on table "public"."nurse_client" from "authenticated";

revoke trigger on table "public"."nurse_client" from "authenticated";

revoke truncate on table "public"."nurse_client" from "authenticated";

revoke update on table "public"."nurse_client" from "authenticated";

revoke delete on table "public"."nurse_client" from "service_role";

revoke insert on table "public"."nurse_client" from "service_role";

revoke references on table "public"."nurse_client" from "service_role";

revoke select on table "public"."nurse_client" from "service_role";

revoke trigger on table "public"."nurse_client" from "service_role";

revoke truncate on table "public"."nurse_client" from "service_role";

revoke update on table "public"."nurse_client" from "service_role";

revoke delete on table "public"."nurse_health" from "anon";

revoke insert on table "public"."nurse_health" from "anon";

revoke references on table "public"."nurse_health" from "anon";

revoke select on table "public"."nurse_health" from "anon";

revoke trigger on table "public"."nurse_health" from "anon";

revoke truncate on table "public"."nurse_health" from "anon";

revoke update on table "public"."nurse_health" from "anon";

revoke delete on table "public"."nurse_health" from "authenticated";

revoke insert on table "public"."nurse_health" from "authenticated";

revoke references on table "public"."nurse_health" from "authenticated";

revoke select on table "public"."nurse_health" from "authenticated";

revoke trigger on table "public"."nurse_health" from "authenticated";

revoke truncate on table "public"."nurse_health" from "authenticated";

revoke update on table "public"."nurse_health" from "authenticated";

revoke delete on table "public"."nurse_health" from "service_role";

revoke insert on table "public"."nurse_health" from "service_role";

revoke references on table "public"."nurse_health" from "service_role";

revoke select on table "public"."nurse_health" from "service_role";

revoke trigger on table "public"."nurse_health" from "service_role";

revoke truncate on table "public"."nurse_health" from "service_role";

revoke update on table "public"."nurse_health" from "service_role";

revoke delete on table "public"."nurse_leave_requests" from "anon";

revoke insert on table "public"."nurse_leave_requests" from "anon";

revoke references on table "public"."nurse_leave_requests" from "anon";

revoke select on table "public"."nurse_leave_requests" from "anon";

revoke trigger on table "public"."nurse_leave_requests" from "anon";

revoke truncate on table "public"."nurse_leave_requests" from "anon";

revoke update on table "public"."nurse_leave_requests" from "anon";

revoke delete on table "public"."nurse_leave_requests" from "authenticated";

revoke insert on table "public"."nurse_leave_requests" from "authenticated";

revoke references on table "public"."nurse_leave_requests" from "authenticated";

revoke select on table "public"."nurse_leave_requests" from "authenticated";

revoke trigger on table "public"."nurse_leave_requests" from "authenticated";

revoke truncate on table "public"."nurse_leave_requests" from "authenticated";

revoke update on table "public"."nurse_leave_requests" from "authenticated";

revoke delete on table "public"."nurse_leave_requests" from "service_role";

revoke insert on table "public"."nurse_leave_requests" from "service_role";

revoke references on table "public"."nurse_leave_requests" from "service_role";

revoke select on table "public"."nurse_leave_requests" from "service_role";

revoke trigger on table "public"."nurse_leave_requests" from "service_role";

revoke truncate on table "public"."nurse_leave_requests" from "service_role";

revoke update on table "public"."nurse_leave_requests" from "service_role";

revoke delete on table "public"."nurse_references" from "anon";

revoke insert on table "public"."nurse_references" from "anon";

revoke references on table "public"."nurse_references" from "anon";

revoke select on table "public"."nurse_references" from "anon";

revoke trigger on table "public"."nurse_references" from "anon";

revoke truncate on table "public"."nurse_references" from "anon";

revoke update on table "public"."nurse_references" from "anon";

revoke delete on table "public"."nurse_references" from "authenticated";

revoke insert on table "public"."nurse_references" from "authenticated";

revoke references on table "public"."nurse_references" from "authenticated";

revoke select on table "public"."nurse_references" from "authenticated";

revoke trigger on table "public"."nurse_references" from "authenticated";

revoke truncate on table "public"."nurse_references" from "authenticated";

revoke update on table "public"."nurse_references" from "authenticated";

revoke delete on table "public"."nurse_references" from "service_role";

revoke insert on table "public"."nurse_references" from "service_role";

revoke references on table "public"."nurse_references" from "service_role";

revoke select on table "public"."nurse_references" from "service_role";

revoke trigger on table "public"."nurse_references" from "service_role";

revoke truncate on table "public"."nurse_references" from "service_role";

revoke update on table "public"."nurse_references" from "service_role";

revoke delete on table "public"."nurses" from "anon";

revoke insert on table "public"."nurses" from "anon";

revoke references on table "public"."nurses" from "anon";

revoke select on table "public"."nurses" from "anon";

revoke trigger on table "public"."nurses" from "anon";

revoke truncate on table "public"."nurses" from "anon";

revoke update on table "public"."nurses" from "anon";

revoke delete on table "public"."nurses" from "authenticated";

revoke insert on table "public"."nurses" from "authenticated";

revoke references on table "public"."nurses" from "authenticated";

revoke select on table "public"."nurses" from "authenticated";

revoke trigger on table "public"."nurses" from "authenticated";

revoke truncate on table "public"."nurses" from "authenticated";

revoke update on table "public"."nurses" from "authenticated";

revoke delete on table "public"."nurses" from "service_role";

revoke insert on table "public"."nurses" from "service_role";

revoke references on table "public"."nurses" from "service_role";

revoke select on table "public"."nurses" from "service_role";

revoke trigger on table "public"."nurses" from "service_role";

revoke truncate on table "public"."nurses" from "service_role";

revoke update on table "public"."nurses" from "service_role";

revoke delete on table "public"."organization_clients" from "anon";

revoke insert on table "public"."organization_clients" from "anon";

revoke references on table "public"."organization_clients" from "anon";

revoke select on table "public"."organization_clients" from "anon";

revoke trigger on table "public"."organization_clients" from "anon";

revoke truncate on table "public"."organization_clients" from "anon";

revoke update on table "public"."organization_clients" from "anon";

revoke delete on table "public"."organization_clients" from "authenticated";

revoke insert on table "public"."organization_clients" from "authenticated";

revoke references on table "public"."organization_clients" from "authenticated";

revoke select on table "public"."organization_clients" from "authenticated";

revoke trigger on table "public"."organization_clients" from "authenticated";

revoke truncate on table "public"."organization_clients" from "authenticated";

revoke update on table "public"."organization_clients" from "authenticated";

revoke delete on table "public"."organization_clients" from "service_role";

revoke insert on table "public"."organization_clients" from "service_role";

revoke references on table "public"."organization_clients" from "service_role";

revoke select on table "public"."organization_clients" from "service_role";

revoke trigger on table "public"."organization_clients" from "service_role";

revoke truncate on table "public"."organization_clients" from "service_role";

revoke update on table "public"."organization_clients" from "service_role";

revoke delete on table "public"."otp" from "anon";

revoke insert on table "public"."otp" from "anon";

revoke references on table "public"."otp" from "anon";

revoke select on table "public"."otp" from "anon";

revoke trigger on table "public"."otp" from "anon";

revoke truncate on table "public"."otp" from "anon";

revoke update on table "public"."otp" from "anon";

revoke delete on table "public"."otp" from "authenticated";

revoke insert on table "public"."otp" from "authenticated";

revoke references on table "public"."otp" from "authenticated";

revoke select on table "public"."otp" from "authenticated";

revoke trigger on table "public"."otp" from "authenticated";

revoke truncate on table "public"."otp" from "authenticated";

revoke update on table "public"."otp" from "authenticated";

revoke delete on table "public"."otp" from "service_role";

revoke insert on table "public"."otp" from "service_role";

revoke references on table "public"."otp" from "service_role";

revoke select on table "public"."otp" from "service_role";

revoke trigger on table "public"."otp" from "service_role";

revoke truncate on table "public"."otp" from "service_role";

revoke update on table "public"."otp" from "service_role";

revoke delete on table "public"."patient_assessments" from "anon";

revoke insert on table "public"."patient_assessments" from "anon";

revoke references on table "public"."patient_assessments" from "anon";

revoke select on table "public"."patient_assessments" from "anon";

revoke trigger on table "public"."patient_assessments" from "anon";

revoke truncate on table "public"."patient_assessments" from "anon";

revoke update on table "public"."patient_assessments" from "anon";

revoke delete on table "public"."patient_assessments" from "authenticated";

revoke insert on table "public"."patient_assessments" from "authenticated";

revoke references on table "public"."patient_assessments" from "authenticated";

revoke select on table "public"."patient_assessments" from "authenticated";

revoke trigger on table "public"."patient_assessments" from "authenticated";

revoke truncate on table "public"."patient_assessments" from "authenticated";

revoke update on table "public"."patient_assessments" from "authenticated";

revoke delete on table "public"."patient_assessments" from "service_role";

revoke insert on table "public"."patient_assessments" from "service_role";

revoke references on table "public"."patient_assessments" from "service_role";

revoke select on table "public"."patient_assessments" from "service_role";

revoke trigger on table "public"."patient_assessments" from "service_role";

revoke truncate on table "public"."patient_assessments" from "service_role";

revoke update on table "public"."patient_assessments" from "service_role";

revoke delete on table "public"."registration_counters" from "anon";

revoke insert on table "public"."registration_counters" from "anon";

revoke references on table "public"."registration_counters" from "anon";

revoke select on table "public"."registration_counters" from "anon";

revoke trigger on table "public"."registration_counters" from "anon";

revoke truncate on table "public"."registration_counters" from "anon";

revoke update on table "public"."registration_counters" from "anon";

revoke delete on table "public"."registration_counters" from "authenticated";

revoke insert on table "public"."registration_counters" from "authenticated";

revoke references on table "public"."registration_counters" from "authenticated";

revoke select on table "public"."registration_counters" from "authenticated";

revoke trigger on table "public"."registration_counters" from "authenticated";

revoke truncate on table "public"."registration_counters" from "authenticated";

revoke update on table "public"."registration_counters" from "authenticated";

revoke delete on table "public"."registration_counters" from "service_role";

revoke insert on table "public"."registration_counters" from "service_role";

revoke references on table "public"."registration_counters" from "service_role";

revoke select on table "public"."registration_counters" from "service_role";

revoke trigger on table "public"."registration_counters" from "service_role";

revoke truncate on table "public"."registration_counters" from "service_role";

revoke update on table "public"."registration_counters" from "service_role";

revoke delete on table "public"."reminders" from "anon";

revoke insert on table "public"."reminders" from "anon";

revoke references on table "public"."reminders" from "anon";

revoke select on table "public"."reminders" from "anon";

revoke trigger on table "public"."reminders" from "anon";

revoke truncate on table "public"."reminders" from "anon";

revoke update on table "public"."reminders" from "anon";

revoke delete on table "public"."reminders" from "authenticated";

revoke insert on table "public"."reminders" from "authenticated";

revoke references on table "public"."reminders" from "authenticated";

revoke select on table "public"."reminders" from "authenticated";

revoke trigger on table "public"."reminders" from "authenticated";

revoke truncate on table "public"."reminders" from "authenticated";

revoke update on table "public"."reminders" from "authenticated";

revoke delete on table "public"."reminders" from "service_role";

revoke insert on table "public"."reminders" from "service_role";

revoke references on table "public"."reminders" from "service_role";

revoke select on table "public"."reminders" from "service_role";

revoke trigger on table "public"."reminders" from "service_role";

revoke truncate on table "public"."reminders" from "service_role";

revoke update on table "public"."reminders" from "service_role";

revoke delete on table "public"."salary_configurations" from "anon";

revoke insert on table "public"."salary_configurations" from "anon";

revoke references on table "public"."salary_configurations" from "anon";

revoke select on table "public"."salary_configurations" from "anon";

revoke trigger on table "public"."salary_configurations" from "anon";

revoke truncate on table "public"."salary_configurations" from "anon";

revoke update on table "public"."salary_configurations" from "anon";

revoke delete on table "public"."salary_configurations" from "authenticated";

revoke insert on table "public"."salary_configurations" from "authenticated";

revoke references on table "public"."salary_configurations" from "authenticated";

revoke select on table "public"."salary_configurations" from "authenticated";

revoke trigger on table "public"."salary_configurations" from "authenticated";

revoke truncate on table "public"."salary_configurations" from "authenticated";

revoke update on table "public"."salary_configurations" from "authenticated";

revoke delete on table "public"."salary_configurations" from "service_role";

revoke insert on table "public"."salary_configurations" from "service_role";

revoke references on table "public"."salary_configurations" from "service_role";

revoke select on table "public"."salary_configurations" from "service_role";

revoke trigger on table "public"."salary_configurations" from "service_role";

revoke truncate on table "public"."salary_configurations" from "service_role";

revoke update on table "public"."salary_configurations" from "service_role";

revoke delete on table "public"."salary_payments" from "anon";

revoke insert on table "public"."salary_payments" from "anon";

revoke references on table "public"."salary_payments" from "anon";

revoke select on table "public"."salary_payments" from "anon";

revoke trigger on table "public"."salary_payments" from "anon";

revoke truncate on table "public"."salary_payments" from "anon";

revoke update on table "public"."salary_payments" from "anon";

revoke delete on table "public"."salary_payments" from "authenticated";

revoke insert on table "public"."salary_payments" from "authenticated";

revoke references on table "public"."salary_payments" from "authenticated";

revoke select on table "public"."salary_payments" from "authenticated";

revoke trigger on table "public"."salary_payments" from "authenticated";

revoke truncate on table "public"."salary_payments" from "authenticated";

revoke update on table "public"."salary_payments" from "authenticated";

revoke delete on table "public"."salary_payments" from "service_role";

revoke insert on table "public"."salary_payments" from "service_role";

revoke references on table "public"."salary_payments" from "service_role";

revoke select on table "public"."salary_payments" from "service_role";

revoke trigger on table "public"."salary_payments" from "service_role";

revoke truncate on table "public"."salary_payments" from "service_role";

revoke update on table "public"."salary_payments" from "service_role";

revoke delete on table "public"."scheduled_notifications" from "anon";

revoke insert on table "public"."scheduled_notifications" from "anon";

revoke references on table "public"."scheduled_notifications" from "anon";

revoke select on table "public"."scheduled_notifications" from "anon";

revoke trigger on table "public"."scheduled_notifications" from "anon";

revoke truncate on table "public"."scheduled_notifications" from "anon";

revoke update on table "public"."scheduled_notifications" from "anon";

revoke delete on table "public"."scheduled_notifications" from "authenticated";

revoke insert on table "public"."scheduled_notifications" from "authenticated";

revoke references on table "public"."scheduled_notifications" from "authenticated";

revoke select on table "public"."scheduled_notifications" from "authenticated";

revoke trigger on table "public"."scheduled_notifications" from "authenticated";

revoke truncate on table "public"."scheduled_notifications" from "authenticated";

revoke update on table "public"."scheduled_notifications" from "authenticated";

revoke delete on table "public"."scheduled_notifications" from "service_role";

revoke insert on table "public"."scheduled_notifications" from "service_role";

revoke references on table "public"."scheduled_notifications" from "service_role";

revoke select on table "public"."scheduled_notifications" from "service_role";

revoke trigger on table "public"."scheduled_notifications" from "service_role";

revoke truncate on table "public"."scheduled_notifications" from "service_role";

revoke update on table "public"."scheduled_notifications" from "service_role";

revoke delete on table "public"."shift_summary" from "anon";

revoke insert on table "public"."shift_summary" from "anon";

revoke references on table "public"."shift_summary" from "anon";

revoke select on table "public"."shift_summary" from "anon";

revoke trigger on table "public"."shift_summary" from "anon";

revoke truncate on table "public"."shift_summary" from "anon";

revoke update on table "public"."shift_summary" from "anon";

revoke delete on table "public"."shift_summary" from "authenticated";

revoke insert on table "public"."shift_summary" from "authenticated";

revoke references on table "public"."shift_summary" from "authenticated";

revoke select on table "public"."shift_summary" from "authenticated";

revoke trigger on table "public"."shift_summary" from "authenticated";

revoke truncate on table "public"."shift_summary" from "authenticated";

revoke update on table "public"."shift_summary" from "authenticated";

revoke delete on table "public"."shift_summary" from "service_role";

revoke insert on table "public"."shift_summary" from "service_role";

revoke references on table "public"."shift_summary" from "service_role";

revoke select on table "public"."shift_summary" from "service_role";

revoke trigger on table "public"."shift_summary" from "service_role";

revoke truncate on table "public"."shift_summary" from "service_role";

revoke update on table "public"."shift_summary" from "service_role";

revoke delete on table "public"."staff_requirements" from "anon";

revoke insert on table "public"."staff_requirements" from "anon";

revoke references on table "public"."staff_requirements" from "anon";

revoke select on table "public"."staff_requirements" from "anon";

revoke trigger on table "public"."staff_requirements" from "anon";

revoke truncate on table "public"."staff_requirements" from "anon";

revoke update on table "public"."staff_requirements" from "anon";

revoke delete on table "public"."staff_requirements" from "authenticated";

revoke insert on table "public"."staff_requirements" from "authenticated";

revoke references on table "public"."staff_requirements" from "authenticated";

revoke select on table "public"."staff_requirements" from "authenticated";

revoke trigger on table "public"."staff_requirements" from "authenticated";

revoke truncate on table "public"."staff_requirements" from "authenticated";

revoke update on table "public"."staff_requirements" from "authenticated";

revoke delete on table "public"."staff_requirements" from "service_role";

revoke insert on table "public"."staff_requirements" from "service_role";

revoke references on table "public"."staff_requirements" from "service_role";

revoke select on table "public"."staff_requirements" from "service_role";

revoke trigger on table "public"."staff_requirements" from "service_role";

revoke truncate on table "public"."staff_requirements" from "service_role";

revoke update on table "public"."staff_requirements" from "service_role";

revoke delete on table "public"."student_academics" from "anon";

revoke insert on table "public"."student_academics" from "anon";

revoke references on table "public"."student_academics" from "anon";

revoke select on table "public"."student_academics" from "anon";

revoke trigger on table "public"."student_academics" from "anon";

revoke truncate on table "public"."student_academics" from "anon";

revoke update on table "public"."student_academics" from "anon";

revoke delete on table "public"."student_academics" from "authenticated";

revoke insert on table "public"."student_academics" from "authenticated";

revoke references on table "public"."student_academics" from "authenticated";

revoke select on table "public"."student_academics" from "authenticated";

revoke trigger on table "public"."student_academics" from "authenticated";

revoke truncate on table "public"."student_academics" from "authenticated";

revoke update on table "public"."student_academics" from "authenticated";

revoke delete on table "public"."student_academics" from "service_role";

revoke insert on table "public"."student_academics" from "service_role";

revoke references on table "public"."student_academics" from "service_role";

revoke select on table "public"."student_academics" from "service_role";

revoke trigger on table "public"."student_academics" from "service_role";

revoke truncate on table "public"."student_academics" from "service_role";

revoke update on table "public"."student_academics" from "service_role";

revoke delete on table "public"."student_experience" from "anon";

revoke insert on table "public"."student_experience" from "anon";

revoke references on table "public"."student_experience" from "anon";

revoke select on table "public"."student_experience" from "anon";

revoke trigger on table "public"."student_experience" from "anon";

revoke truncate on table "public"."student_experience" from "anon";

revoke update on table "public"."student_experience" from "anon";

revoke delete on table "public"."student_experience" from "authenticated";

revoke insert on table "public"."student_experience" from "authenticated";

revoke references on table "public"."student_experience" from "authenticated";

revoke select on table "public"."student_experience" from "authenticated";

revoke trigger on table "public"."student_experience" from "authenticated";

revoke truncate on table "public"."student_experience" from "authenticated";

revoke update on table "public"."student_experience" from "authenticated";

revoke delete on table "public"."student_experience" from "service_role";

revoke insert on table "public"."student_experience" from "service_role";

revoke references on table "public"."student_experience" from "service_role";

revoke select on table "public"."student_experience" from "service_role";

revoke trigger on table "public"."student_experience" from "service_role";

revoke truncate on table "public"."student_experience" from "service_role";

revoke update on table "public"."student_experience" from "service_role";

revoke delete on table "public"."student_guardian" from "anon";

revoke insert on table "public"."student_guardian" from "anon";

revoke references on table "public"."student_guardian" from "anon";

revoke select on table "public"."student_guardian" from "anon";

revoke trigger on table "public"."student_guardian" from "anon";

revoke truncate on table "public"."student_guardian" from "anon";

revoke update on table "public"."student_guardian" from "anon";

revoke delete on table "public"."student_guardian" from "authenticated";

revoke insert on table "public"."student_guardian" from "authenticated";

revoke references on table "public"."student_guardian" from "authenticated";

revoke select on table "public"."student_guardian" from "authenticated";

revoke trigger on table "public"."student_guardian" from "authenticated";

revoke truncate on table "public"."student_guardian" from "authenticated";

revoke update on table "public"."student_guardian" from "authenticated";

revoke delete on table "public"."student_guardian" from "service_role";

revoke insert on table "public"."student_guardian" from "service_role";

revoke references on table "public"."student_guardian" from "service_role";

revoke select on table "public"."student_guardian" from "service_role";

revoke trigger on table "public"."student_guardian" from "service_role";

revoke truncate on table "public"."student_guardian" from "service_role";

revoke update on table "public"."student_guardian" from "service_role";

revoke delete on table "public"."student_leave_request" from "anon";

revoke insert on table "public"."student_leave_request" from "anon";

revoke references on table "public"."student_leave_request" from "anon";

revoke select on table "public"."student_leave_request" from "anon";

revoke trigger on table "public"."student_leave_request" from "anon";

revoke truncate on table "public"."student_leave_request" from "anon";

revoke update on table "public"."student_leave_request" from "anon";

revoke delete on table "public"."student_leave_request" from "authenticated";

revoke insert on table "public"."student_leave_request" from "authenticated";

revoke references on table "public"."student_leave_request" from "authenticated";

revoke select on table "public"."student_leave_request" from "authenticated";

revoke trigger on table "public"."student_leave_request" from "authenticated";

revoke truncate on table "public"."student_leave_request" from "authenticated";

revoke update on table "public"."student_leave_request" from "authenticated";

revoke delete on table "public"."student_leave_request" from "service_role";

revoke insert on table "public"."student_leave_request" from "service_role";

revoke references on table "public"."student_leave_request" from "service_role";

revoke select on table "public"."student_leave_request" from "service_role";

revoke trigger on table "public"."student_leave_request" from "service_role";

revoke truncate on table "public"."student_leave_request" from "service_role";

revoke update on table "public"."student_leave_request" from "service_role";

revoke delete on table "public"."student_preferences" from "anon";

revoke insert on table "public"."student_preferences" from "anon";

revoke references on table "public"."student_preferences" from "anon";

revoke select on table "public"."student_preferences" from "anon";

revoke trigger on table "public"."student_preferences" from "anon";

revoke truncate on table "public"."student_preferences" from "anon";

revoke update on table "public"."student_preferences" from "anon";

revoke delete on table "public"."student_preferences" from "authenticated";

revoke insert on table "public"."student_preferences" from "authenticated";

revoke references on table "public"."student_preferences" from "authenticated";

revoke select on table "public"."student_preferences" from "authenticated";

revoke trigger on table "public"."student_preferences" from "authenticated";

revoke truncate on table "public"."student_preferences" from "authenticated";

revoke update on table "public"."student_preferences" from "authenticated";

revoke delete on table "public"."student_preferences" from "service_role";

revoke insert on table "public"."student_preferences" from "service_role";

revoke references on table "public"."student_preferences" from "service_role";

revoke select on table "public"."student_preferences" from "service_role";

revoke trigger on table "public"."student_preferences" from "service_role";

revoke truncate on table "public"."student_preferences" from "service_role";

revoke update on table "public"."student_preferences" from "service_role";

revoke delete on table "public"."student_register_seq" from "anon";

revoke insert on table "public"."student_register_seq" from "anon";

revoke references on table "public"."student_register_seq" from "anon";

revoke select on table "public"."student_register_seq" from "anon";

revoke trigger on table "public"."student_register_seq" from "anon";

revoke truncate on table "public"."student_register_seq" from "anon";

revoke update on table "public"."student_register_seq" from "anon";

revoke delete on table "public"."student_register_seq" from "authenticated";

revoke insert on table "public"."student_register_seq" from "authenticated";

revoke references on table "public"."student_register_seq" from "authenticated";

revoke select on table "public"."student_register_seq" from "authenticated";

revoke trigger on table "public"."student_register_seq" from "authenticated";

revoke truncate on table "public"."student_register_seq" from "authenticated";

revoke update on table "public"."student_register_seq" from "authenticated";

revoke delete on table "public"."student_register_seq" from "service_role";

revoke insert on table "public"."student_register_seq" from "service_role";

revoke references on table "public"."student_register_seq" from "service_role";

revoke select on table "public"."student_register_seq" from "service_role";

revoke trigger on table "public"."student_register_seq" from "service_role";

revoke truncate on table "public"."student_register_seq" from "service_role";

revoke update on table "public"."student_register_seq" from "service_role";

revoke delete on table "public"."student_source" from "anon";

revoke insert on table "public"."student_source" from "anon";

revoke references on table "public"."student_source" from "anon";

revoke select on table "public"."student_source" from "anon";

revoke trigger on table "public"."student_source" from "anon";

revoke truncate on table "public"."student_source" from "anon";

revoke update on table "public"."student_source" from "anon";

revoke delete on table "public"."student_source" from "authenticated";

revoke insert on table "public"."student_source" from "authenticated";

revoke references on table "public"."student_source" from "authenticated";

revoke select on table "public"."student_source" from "authenticated";

revoke trigger on table "public"."student_source" from "authenticated";

revoke truncate on table "public"."student_source" from "authenticated";

revoke update on table "public"."student_source" from "authenticated";

revoke delete on table "public"."student_source" from "service_role";

revoke insert on table "public"."student_source" from "service_role";

revoke references on table "public"."student_source" from "service_role";

revoke select on table "public"."student_source" from "service_role";

revoke trigger on table "public"."student_source" from "service_role";

revoke truncate on table "public"."student_source" from "service_role";

revoke update on table "public"."student_source" from "service_role";

revoke delete on table "public"."student_users" from "anon";

revoke insert on table "public"."student_users" from "anon";

revoke references on table "public"."student_users" from "anon";

revoke select on table "public"."student_users" from "anon";

revoke trigger on table "public"."student_users" from "anon";

revoke truncate on table "public"."student_users" from "anon";

revoke update on table "public"."student_users" from "anon";

revoke delete on table "public"."student_users" from "authenticated";

revoke insert on table "public"."student_users" from "authenticated";

revoke references on table "public"."student_users" from "authenticated";

revoke select on table "public"."student_users" from "authenticated";

revoke trigger on table "public"."student_users" from "authenticated";

revoke truncate on table "public"."student_users" from "authenticated";

revoke update on table "public"."student_users" from "authenticated";

revoke delete on table "public"."student_users" from "service_role";

revoke insert on table "public"."student_users" from "service_role";

revoke references on table "public"."student_users" from "service_role";

revoke select on table "public"."student_users" from "service_role";

revoke trigger on table "public"."student_users" from "service_role";

revoke truncate on table "public"."student_users" from "service_role";

revoke update on table "public"."student_users" from "service_role";

revoke delete on table "public"."students" from "anon";

revoke insert on table "public"."students" from "anon";

revoke references on table "public"."students" from "anon";

revoke select on table "public"."students" from "anon";

revoke trigger on table "public"."students" from "anon";

revoke truncate on table "public"."students" from "anon";

revoke update on table "public"."students" from "anon";

revoke delete on table "public"."students" from "authenticated";

revoke insert on table "public"."students" from "authenticated";

revoke references on table "public"."students" from "authenticated";

revoke select on table "public"."students" from "authenticated";

revoke trigger on table "public"."students" from "authenticated";

revoke truncate on table "public"."students" from "authenticated";

revoke update on table "public"."students" from "authenticated";

revoke delete on table "public"."students" from "service_role";

revoke insert on table "public"."students" from "service_role";

revoke references on table "public"."students" from "service_role";

revoke select on table "public"."students" from "service_role";

revoke trigger on table "public"."students" from "service_role";

revoke truncate on table "public"."students" from "service_role";

revoke update on table "public"."students" from "service_role";

revoke delete on table "public"."supervisor_assignment" from "anon";

revoke insert on table "public"."supervisor_assignment" from "anon";

revoke references on table "public"."supervisor_assignment" from "anon";

revoke select on table "public"."supervisor_assignment" from "anon";

revoke trigger on table "public"."supervisor_assignment" from "anon";

revoke truncate on table "public"."supervisor_assignment" from "anon";

revoke update on table "public"."supervisor_assignment" from "anon";

revoke delete on table "public"."supervisor_assignment" from "authenticated";

revoke insert on table "public"."supervisor_assignment" from "authenticated";

revoke references on table "public"."supervisor_assignment" from "authenticated";

revoke select on table "public"."supervisor_assignment" from "authenticated";

revoke trigger on table "public"."supervisor_assignment" from "authenticated";

revoke truncate on table "public"."supervisor_assignment" from "authenticated";

revoke update on table "public"."supervisor_assignment" from "authenticated";

revoke delete on table "public"."supervisor_assignment" from "service_role";

revoke insert on table "public"."supervisor_assignment" from "service_role";

revoke references on table "public"."supervisor_assignment" from "service_role";

revoke select on table "public"."supervisor_assignment" from "service_role";

revoke trigger on table "public"."supervisor_assignment" from "service_role";

revoke truncate on table "public"."supervisor_assignment" from "service_role";

revoke update on table "public"."supervisor_assignment" from "service_role";

revoke delete on table "public"."supervisor_users" from "anon";

revoke insert on table "public"."supervisor_users" from "anon";

revoke references on table "public"."supervisor_users" from "anon";

revoke select on table "public"."supervisor_users" from "anon";

revoke trigger on table "public"."supervisor_users" from "anon";

revoke truncate on table "public"."supervisor_users" from "anon";

revoke update on table "public"."supervisor_users" from "anon";

revoke delete on table "public"."supervisor_users" from "authenticated";

revoke insert on table "public"."supervisor_users" from "authenticated";

revoke references on table "public"."supervisor_users" from "authenticated";

revoke select on table "public"."supervisor_users" from "authenticated";

revoke trigger on table "public"."supervisor_users" from "authenticated";

revoke truncate on table "public"."supervisor_users" from "authenticated";

revoke update on table "public"."supervisor_users" from "authenticated";

revoke delete on table "public"."supervisor_users" from "service_role";

revoke insert on table "public"."supervisor_users" from "service_role";

revoke references on table "public"."supervisor_users" from "service_role";

revoke select on table "public"."supervisor_users" from "service_role";

revoke trigger on table "public"."supervisor_users" from "service_role";

revoke truncate on table "public"."supervisor_users" from "service_role";

revoke update on table "public"."supervisor_users" from "service_role";

alter table "public"."shift_summary" drop constraint "fk_employee";

alter table "public"."dearcare_salary_calculation_runs" drop constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."nurse_health" drop constraint "nurse_health_nurse_id_fkey";

alter table "public"."nurse_leave_requests" drop constraint "nurse_leave_requests_nurse_id_fkey";

alter table "public"."nurse_references" drop constraint "nurse_references_nurse_id_fkey";

alter table "public"."salary_payments" drop constraint "salary_payments_payment_status_check";

drop view if exists "public"."nurse_assignments_view";

create table "public"."advance_payments" (
    "id" uuid not null default gen_random_uuid(),
    "nurse_id" integer not null,
    "date" date not null,
    "advance_amount" numeric(10,2) not null,
    "return_type" text not null,
    "return_amount" numeric(10,2),
    "remaining_amount" numeric(10,2) not null,
    "deductions" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "installment_amount" numeric
);


alter table "public"."advance_payments" enable row level security;

create table "public"."result" (
    "json_build_object" json
);


create table "public"."tatahomenursing_salary_calculation_runs" (
    "id" integer not null default nextval('tatahomenursing_salary_calculation_runs_id_seq'::regclass),
    "run_date" date not null default CURRENT_DATE,
    "pay_period_start" date not null,
    "pay_period_end" date not null,
    "total_nurses_calculated" integer not null default 0,
    "total_attendance_records" integer not null default 0,
    "total_salary_records_inserted" integer not null default 0,
    "execution_status" character varying(20) not null default 'success'::character varying,
    "execution_duration_ms" integer,
    "error_message" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tatahomenursing_salary_calculation_runs" enable row level security;

alter table "public"."admin_dashboard_todos" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."client_files" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."client_files" alter column "url" drop not null;

alter table "public"."client_payment_line_items" add column "amount_with_gst" double precision;

alter table "public"."client_payment_line_items" add column "gst" bigint default '0'::bigint;

alter table "public"."client_payment_records" add column "end_date" date;

alter table "public"."client_payment_records" add column "mode_of_payment" text;

alter table "public"."client_payment_records" add column "nurse_sal" text;

alter table "public"."client_payment_records" add column "start_date" date;

alter table "public"."clients" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."day_book" drop column "id_in_out";

alter table "public"."day_book" add column "client_id" uuid;

alter table "public"."day_book" add column "nurse_id" bigint;

alter table "public"."day_book" add column "nurse_sal" bigint;

alter table "public"."day_book" add column "receipt" text;

alter table "public"."day_book" add column "tenant" tenant;

alter table "public"."day_book" alter column "amount" set data type double precision using "amount"::double precision;

alter table "public"."dearcare_complaint_resolutions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dearcare_services_enquiries" add column "organization" text default 'DearCare LLP'::text;

alter table "public"."dearcare_services_enquiries" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dearcare_staff" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dearcare_web_notifications" add column "organization" text;

alter table "public"."dearcare_web_users" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."individual_clients" add column "patient_location_link" text;

alter table "public"."individual_clients" add column "requestor_location_link" text;

alter table "public"."nurse_leave_requests" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."nurse_references" add column "staff_reference" jsonb;

alter table "public"."patient_assessments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."reminders" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."salary_payments" add column "is_advance" boolean default false;

alter table "public"."salary_payments" add column "receipt_url" text;

alter table "public"."scheduled_notifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."staff_requirements" alter column "id" set default extensions.uuid_generate_v4();

alter sequence "public"."tatahomenursing_salary_calculation_runs_id_seq" owned by "public"."tatahomenursing_salary_calculation_runs"."id";

CREATE UNIQUE INDEX advance_payments_pkey ON public.advance_payments USING btree (id);

CREATE INDEX idx_advance_payments_created_at ON public.advance_payments USING btree (created_at DESC);

CREATE INDEX idx_advance_payments_date ON public.advance_payments USING btree (date DESC);

CREATE INDEX idx_advance_payments_deductions ON public.advance_payments USING gin (deductions);

CREATE INDEX idx_advance_payments_nurse_id ON public.advance_payments USING btree (nurse_id);

CREATE INDEX idx_advance_payments_remaining_amount ON public.advance_payments USING btree (remaining_amount) WHERE (remaining_amount > (0)::numeric);

CREATE UNIQUE INDEX tatahomenursing_salary_calculation_runs_pkey ON public.tatahomenursing_salary_calculation_runs USING btree (id);

alter table "public"."advance_payments" add constraint "advance_payments_pkey" PRIMARY KEY using index "advance_payments_pkey";

alter table "public"."tatahomenursing_salary_calculation_runs" add constraint "tatahomenursing_salary_calculation_runs_pkey" PRIMARY KEY using index "tatahomenursing_salary_calculation_runs_pkey";

alter table "public"."advance_payments" add constraint "advance_payments_advance_amount_check" CHECK ((advance_amount > (0)::numeric)) not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_advance_amount_check";

alter table "public"."advance_payments" add constraint "advance_payments_check" CHECK (((return_amount > (0)::numeric) AND (return_amount < advance_amount))) not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_check";

alter table "public"."advance_payments" add constraint "advance_payments_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) ON DELETE CASCADE not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_nurse_id_fkey";

alter table "public"."advance_payments" add constraint "advance_payments_remaining_amount_check" CHECK ((remaining_amount >= (0)::numeric)) not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_remaining_amount_check";

alter table "public"."advance_payments" add constraint "advance_payments_return_type_check" CHECK ((return_type = ANY (ARRAY[('full'::character varying)::text, ('installments'::character varying)::text]))) not valid;

alter table "public"."advance_payments" validate constraint "advance_payments_return_type_check";

alter table "public"."day_book" add constraint "day_book_client_id_fkey" FOREIGN KEY (client_id) REFERENCES individual_clients(client_id) not valid;

alter table "public"."day_book" validate constraint "day_book_client_id_fkey";

alter table "public"."day_book" add constraint "day_book_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) not valid;

alter table "public"."day_book" validate constraint "day_book_nurse_id_fkey";

alter table "public"."day_book" add constraint "day_book_nurse_sal_fkey" FOREIGN KEY (nurse_sal) REFERENCES salary_payments(id) not valid;

alter table "public"."day_book" validate constraint "day_book_nurse_sal_fkey";

alter table "public"."shift_summary" add constraint "shift_summary_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) ON DELETE CASCADE not valid;

alter table "public"."shift_summary" validate constraint "shift_summary_nurse_id_fkey";

alter table "public"."tatahomenursing_salary_calculation_runs" add constraint "tatahomenursing_salary_calculation_runs_execution_status_check" CHECK (((execution_status)::text = ANY (ARRAY[('success'::character varying)::text, ('failed'::character varying)::text, ('skipped'::character varying)::text]))) not valid;

alter table "public"."tatahomenursing_salary_calculation_runs" validate constraint "tatahomenursing_salary_calculation_runs_execution_status_check";

alter table "public"."dearcare_salary_calculation_runs" add constraint "dearcare_salary_calculation_runs_execution_status_check" CHECK (((execution_status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'skipped'::character varying])::text[]))) not valid;

alter table "public"."dearcare_salary_calculation_runs" validate constraint "dearcare_salary_calculation_runs_execution_status_check";

alter table "public"."nurse_health" add constraint "nurse_health_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) ON DELETE CASCADE not valid;

alter table "public"."nurse_health" validate constraint "nurse_health_nurse_id_fkey";

alter table "public"."nurse_leave_requests" add constraint "nurse_leave_requests_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) ON DELETE CASCADE not valid;

alter table "public"."nurse_leave_requests" validate constraint "nurse_leave_requests_nurse_id_fkey";

alter table "public"."nurse_references" add constraint "nurse_references_nurse_id_fkey" FOREIGN KEY (nurse_id) REFERENCES nurses(nurse_id) ON DELETE CASCADE not valid;

alter table "public"."nurse_references" validate constraint "nurse_references_nurse_id_fkey";

alter table "public"."salary_payments" add constraint "salary_payments_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."salary_payments" validate constraint "salary_payments_payment_status_check";

set check_function_bodies = off;

create or replace view "public"."approved_clients_view" as  SELECT c.id AS client_id,
    c.client_type,
    c.client_category,
    c.registration_number,
    c.status,
    c.created_at,
    c.updated_at,
    ic.requestor_name,
    ic.requestor_phone,
    ic.requestor_email,
    ic.requestor_address,
    ic.requestor_city,
    ic.requestor_district,
    ic.requestor_pincode,
    ic.requestor_state,
    ic.requestor_job_details,
    ic.requestor_emergency_phone,
    ic.requestor_profile_pic,
    ic.patient_name,
    ic.patient_age,
    ic.patient_gender,
    ic.patient_phone,
    ic.patient_address,
    ic.patient_city,
    ic.patient_district,
    ic.patient_pincode,
    ic.patient_state,
    ic.patient_profile_pic,
    ic.relation_to_patient,
    ic.service_required,
    ic.care_duration,
    ic.start_date,
    ic.preferred_caregiver_gender,
    ic.complete_address
   FROM (clients c
     JOIN individual_clients ic ON ((c.id = ic.client_id)))
  WHERE (c.status = 'approved'::client_status);


create or replace view "public"."attendance_with_nurse" as  SELECT ai.id AS attendance_id,
    ai.date,
    ai.start_time,
    ai.end_time,
    ai.total_hours,
    ai.location,
    ai.assigned_id,
    nc.id AS nurse_client_id,
    nc.nurse_id,
    nc.shift_start_time AS scheduled_start_time,
    nc.shift_end_time AS scheduled_end_time,
    n.first_name,
    n.last_name,
    n.full_name,
    n.nurse_reg_no,
    n.nurse_prev_reg_no,
    n.admitted_type
   FROM ((attendence_individual ai
     JOIN nurse_client nc ON ((ai.assigned_id = nc.id)))
     JOIN nurses n ON ((nc.nurse_id = n.nurse_id)));


create or replace view "public"."clients_view_unified" as  SELECT c.id,
    c.client_type,
    c.status,
    c.created_at,
    c.client_category,
    ic.requestor_email,
    ic.requestor_phone,
    ic.requestor_name,
    ic.patient_name,
    ic.service_required,
    ic.start_date,
    oc.organization_name,
    oc.contact_email,
    oc.contact_phone,
    lower(concat_ws(' '::text, ic.requestor_name, ic.patient_name, ic.requestor_email, ic.requestor_phone, oc.organization_name, oc.contact_email, oc.contact_phone)) AS search_text
   FROM ((clients c
     LEFT JOIN individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::client_type))))
     LEFT JOIN organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::client_type))))
  WHERE ((ic.client_id IS NOT NULL) OR (oc.client_id IS NOT NULL));


CREATE OR REPLACE FUNCTION public.get_attendance_data_by_org(curr_date date, organization admission_type)
 RETURNS json
 LANGUAGE plpgsql
AS $function$DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total', COALESCE((
            -- Total unique nurses with an active assignment today
            SELECT count(DISTINCT nc.nurse_id) 
            FROM nurse_client nc
            INNER JOIN nurses n ON nc.nurse_id = n.nurse_id
            WHERE nc.start_date <= curr_date 
              AND nc.end_date >= curr_date
              AND n.admitted_type = organization
        ), 0),
        
        'present', COALESCE((
            -- Total unique nurses who clocked in for an active assignment today
            SELECT count(DISTINCT nc.nurse_id)  -- <-- ****** THE MAIN FIX IS HERE ******
            FROM attendence_individual ai
            INNER JOIN nurse_client nc ON ai.assigned_id = nc.id
            INNER JOIN nurses n ON nc.nurse_id = n.nurse_id
            WHERE ai.date = curr_date 
              AND ai.start_time IS NOT NULL
              AND n.admitted_type = organization
              -- Logical fix: Ensure we only count attendance for a currently active assignment
              AND nc.start_date <= curr_date 
              AND nc.end_date >= curr_date
        ), 0),
        
        'onLeave', COALESCE((
            -- Total unique nurses who are on approved leave AND have an active assignment
            SELECT count(DISTINCT nlr.nurse_id) 
            FROM nurse_leave_requests nlr
            INNER JOIN nurses n ON nlr.nurse_id = n.nurse_id
            WHERE nlr.status = 'approved' 
              AND nlr.start_date <= curr_date 
              AND nlr.end_date >= curr_date
              AND n.admitted_type = organization
              -- Logical fix: Only count if this nurse is part of the 'total' pool
              AND EXISTS (
                SELECT 1
                FROM nurse_client nc
                WHERE nc.nurse_id = n.nurse_id
                  AND nc.start_date <= curr_date 
                  AND nc.end_date >= curr_date
              )
        ), 0)
    ) INTO result;
    
    RETURN result;
END;$function$
;

create or replace view "public"."nurse_assignments_view_with_reg_no" as  SELECT nc.id,
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
    c.client_type,
    c.client_category,
    COALESCE(ic.requestor_name, ic.patient_name, oc.organization_name) AS client_name,
    COALESCE(ic.patient_name, ''::character varying) AS patient_name
   FROM ((((nurse_client nc
     JOIN nurses n ON ((nc.nurse_id = n.nurse_id)))
     JOIN clients c ON ((nc.client_id = c.id)))
     LEFT JOIN individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::client_type))))
     LEFT JOIN organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::client_type))));


create or replace view "public"."nurse_assignments_view_with_salary" as  SELECT nc.id,
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
    COALESCE(ic.patient_name, ''::character varying) AS patient_name
   FROM ((((nurse_client nc
     JOIN nurses n ON ((nc.nurse_id = n.nurse_id)))
     JOIN clients c ON ((nc.client_id = c.id)))
     LEFT JOIN individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::client_type))))
     LEFT JOIN organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::client_type))));


create or replace view "public"."nurse_attendance_view" as  SELECT ai.id AS attendance_id,
    ai.date,
    ai.start_time,
    ai.end_time,
    ai.total_hours,
    ai.location,
    ai.assigned_id,
    ai.created_at,
    nc.id AS nurse_client_id,
    nc.nurse_id,
    nc.shift_start_time AS scheduled_start_time,
    nc.shift_end_time AS scheduled_end_time,
    n.first_name,
    n.last_name,
    n.full_name,
    n.nurse_reg_no,
    n.nurse_prev_reg_no,
    n.admitted_type
   FROM ((attendence_individual ai
     JOIN nurse_client nc ON ((ai.assigned_id = nc.id)))
     JOIN nurses n ON ((nc.nurse_id = n.nurse_id)));


create or replace view "public"."unified_payment_records_view" as  SELECT p.id,
    p.client_id,
    p.payment_group_name,
    p.total_amount,
    p.date_added,
    p.mode_of_payment,
    c.client_category,
    c.client_type,
    c.status AS client_status,
    COALESCE(org.organization_name, ind.requestor_name, 'Unknown Client'::character varying) AS client_display_name
   FROM (((client_payment_records p
     JOIN clients c ON ((p.client_id = c.id)))
     LEFT JOIN individual_clients ind ON ((c.id = ind.client_id)))
     LEFT JOIN organization_clients org ON ((c.id = org.client_id)));


CREATE OR REPLACE FUNCTION public.create_nurse_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_student_user_on_confirm()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_days_worked()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_student_user_on_student_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- No manual delete needed due to cascade; still returning for compliance
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_faculty_reg_no()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.generate_register_no()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_attendance_data(curr_date date)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_salary_date(initial_date date, interval_days integer)
 RETURNS date
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN initial_date + (
    CEIL((CURRENT_DATE - initial_date)::numeric / interval_days) * interval_days
  )::integer;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_registration_counter(p_category text, p_type text, p_year text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.manage_supervisor_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."nurse_assignments_view" as  SELECT nc.id,
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
    c.client_type,
    c.client_category,
    COALESCE(ic.requestor_name, ic.patient_name, oc.organization_name) AS client_name,
    COALESCE(ic.patient_name, ''::character varying) AS patient_name
   FROM ((((nurse_client nc
     JOIN nurses n ON ((nc.nurse_id = n.nurse_id)))
     JOIN clients c ON ((nc.client_id = c.id)))
     LEFT JOIN individual_clients ic ON (((c.id = ic.client_id) AND (c.client_type = 'individual'::client_type))))
     LEFT JOIN organization_clients oc ON (((c.id = oc.client_id) AND (c.client_type = 'organization'::client_type))));


CREATE OR REPLACE FUNCTION public.search_clients(search_term text)
 RETURNS TABLE(client_id uuid)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_days_worked()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_salary_calculation_runs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

create policy "Authenticated users can delete advance payments"
on "public"."advance_payments"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can insert advance payments"
on "public"."advance_payments"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read advance payments"
on "public"."advance_payments"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update advance payments"
on "public"."advance_payments"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."tatahomenursing_salary_calculation_runs"
as permissive
for insert
to authenticated
with check (true);


CREATE TRIGGER tatahomenursing_trigger_update_salary_calculation_runs_updated_ BEFORE UPDATE ON public.tatahomenursing_salary_calculation_runs FOR EACH ROW EXECUTE FUNCTION update_salary_calculation_runs_updated_at();



  create policy "Give anon users access to JPG images in folder 1fh3xb9_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using (((bucket_id = 'Daybook'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 1fh3xb9_1"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check (((bucket_id = 'Daybook'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 1fh3xb9_2"
  on "storage"."objects"
  as permissive
  for update
  to anon
using (((bucket_id = 'Daybook'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give anon users access to JPG images in folder 1fh3xb9_3"
  on "storage"."objects"
  as permissive
  for delete
  to anon
using (((bucket_id = 'Daybook'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



