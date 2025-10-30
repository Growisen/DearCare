-- Create get_attendance_data_by_org function
-- This function returns attendance statistics filtered by organization

CREATE OR REPLACE FUNCTION "public"."get_attendance_data_by_org"(
  "curr_date" "date",
  "organization" "text"
) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total', COALESCE((
            SELECT count(DISTINCT nc.nurse_id) 
            FROM nurse_client nc
            INNER JOIN nurses n ON nc.nurse_id = n.nurse_id
            WHERE nc.start_date <= curr_date 
              AND nc.end_date >= curr_date
              AND n.admitted_type::text = organization
        ), 0),
        'present', COALESCE((
            SELECT count(DISTINCT ai.assigned_id) 
            FROM attendence_individual ai
            INNER JOIN nurse_client nc ON ai.assigned_id = nc.id
            INNER JOIN nurses n ON nc.nurse_id = n.nurse_id
            WHERE ai.date = curr_date 
              AND ai.start_time IS NOT NULL
              AND n.admitted_type::text = organization
        ), 0),
        'onLeave', COALESCE((
            SELECT count(DISTINCT nlr.nurse_id) 
            FROM nurse_leave_requests nlr
            INNER JOIN nurses n ON nlr.nurse_id = n.nurse_id
            WHERE nlr.status = 'approved' 
              AND nlr.start_date <= curr_date 
              AND nlr.end_date >= curr_date
              AND n.admitted_type::text = organization
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$;

ALTER FUNCTION "public"."get_attendance_data_by_org"("curr_date" "date", "organization" "text") OWNER TO "postgres";

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION "public"."get_attendance_data_by_org"("curr_date" "date", "organization" "text") TO "anon";
GRANT EXECUTE ON FUNCTION "public"."get_attendance_data_by_org"("curr_date" "date", "organization" "text") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."get_attendance_data_by_org"("curr_date" "date", "organization" "text") TO "service_role";
