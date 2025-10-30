-- ============================================================================
-- SHIFT-BASED ATTENDANCE SYSTEM MIGRATION
-- ============================================================================
-- Date: 2025-10-22
-- Description: Complete implementation of shift-based attendance tracking for
--              Tata Home Nursing employees alongside existing daily attendance
--              system for DearCare LLP employees.
-- 
-- Features:
--   - Dual attendance modes (daily vs shift-based)
--   - Automatic attendance calculation from shift duration
--   - GPS location tracking for shift start/end
--   - RLS policies for secure access control
--   - Reporting views for active and completed shifts
-- ============================================================================

-- ============================================================================
-- STEP 1: Create ENUM type for attendance modes
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE attendance_mode AS ENUM ('daily', 'shift_based');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE attendance_mode IS 
'Attendance tracking mode: daily (DearCare LLP) or shift_based (Tata Home Nursing)';

-- ============================================================================
-- STEP 2: Add columns to nurse_client table
-- ============================================================================

-- Attendance mode column
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS attendance_mode attendance_mode DEFAULT 'daily';

COMMENT ON COLUMN public.nurse_client.attendance_mode IS 
'Determines how attendance is tracked: daily (check-in/out) or shift_based (start/end with auto-calculation)';

-- Shift start timestamp
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS shift_start_datetime timestamptz NULL;

COMMENT ON COLUMN public.nurse_client.shift_start_datetime IS 
'Timestamp when shift started (shift-based mode only). NULL indicates shift not yet started.';

-- Shift end timestamp
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS shift_end_datetime timestamptz NULL;

COMMENT ON COLUMN public.nurse_client.shift_end_datetime IS 
'Timestamp when shift ended (shift-based mode only). NULL indicates ongoing or not-started shift.';

-- Calculated attendance days
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS calculated_attendance_days numeric(10,2) DEFAULT 0;

COMMENT ON COLUMN public.nurse_client.calculated_attendance_days IS 
'Auto-calculated attendance days from shift duration. Used for salary calculation in shift-based mode.';

-- GPS location for shift start
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS shift_start_location jsonb NULL;

COMMENT ON COLUMN public.nurse_client.shift_start_location IS 
'GPS coordinates where shift was started: {latitude, longitude, timestamp, accuracy}';

-- GPS location for shift end
ALTER TABLE public.nurse_client 
ADD COLUMN IF NOT EXISTS shift_end_location jsonb NULL;

COMMENT ON COLUMN public.nurse_client.shift_end_location IS 
'GPS coordinates where shift was ended: {latitude, longitude, timestamp, accuracy}';

-- ============================================================================
-- STEP 3: Add constraints
-- ============================================================================

-- Ensure shift end is after shift start
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_shift_end_after_start'
        AND table_name = 'nurse_client'
    ) THEN
        ALTER TABLE public.nurse_client DROP CONSTRAINT check_shift_end_after_start;
    END IF;
END $$;

ALTER TABLE public.nurse_client
ADD CONSTRAINT check_shift_end_after_start
CHECK (
    shift_end_datetime IS NULL OR
    shift_start_datetime IS NULL OR
    shift_end_datetime > shift_start_datetime
);

-- Ensure shift dates are within assignment period
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_shift_dates_in_assignment_period'
        AND table_name = 'nurse_client'
    ) THEN
        ALTER TABLE public.nurse_client
        ADD CONSTRAINT check_shift_dates_in_assignment_period
        CHECK (
            shift_start_datetime IS NULL OR
            (shift_start_datetime::date >= start_date AND shift_start_datetime::date <= end_date)
        );
    END IF;
END $$;

-- Ensure calculated days is non-negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_calculated_days_non_negative'
        AND table_name = 'nurse_client'
    ) THEN
        ALTER TABLE public.nurse_client
        ADD CONSTRAINT check_calculated_days_non_negative
        CHECK (calculated_attendance_days >= 0);
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Index for querying by attendance mode
CREATE INDEX IF NOT EXISTS idx_nurse_client_attendance_mode 
ON public.nurse_client(attendance_mode);

-- Index for active shifts (started but not ended)
CREATE INDEX IF NOT EXISTS idx_nurse_client_active_shifts 
ON public.nurse_client(nurse_id, shift_start_datetime) 
WHERE shift_start_datetime IS NOT NULL AND shift_end_datetime IS NULL;

-- Index for completed shifts
CREATE INDEX IF NOT EXISTS idx_nurse_client_completed_shifts 
ON public.nurse_client(nurse_id, shift_end_datetime) 
WHERE shift_end_datetime IS NOT NULL;

-- ============================================================================
-- STEP 5: Create functions
-- ============================================================================

-- Function: Automatically set attendance_mode based on nurse organization
CREATE OR REPLACE FUNCTION public.set_attendance_mode()
RETURNS TRIGGER AS $$
DECLARE
    v_admitted_type TEXT;
BEGIN
    -- Get nurse's organization type
    SELECT admitted_type INTO v_admitted_type
    FROM public.nurses
    WHERE nurse_id = NEW.nurse_id;
    
    -- Map to attendance mode
    IF v_admitted_type = 'Tata_Homenursing' THEN
        NEW.attendance_mode := 'shift_based';
    ELSE
        NEW.attendance_mode := 'daily';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_attendance_mode() IS 
'Trigger function: Sets attendance_mode based on nurse organization (Tata=shift_based, DearCare=daily)';

-- Function: Calculate attendance days from shift duration
CREATE OR REPLACE FUNCTION public.calculate_shift_attendance_days()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate when both start and end timestamps exist
    IF NEW.shift_start_datetime IS NOT NULL AND NEW.shift_end_datetime IS NOT NULL THEN
        -- Calculate duration in days (2 decimal precision)
        NEW.calculated_attendance_days := ROUND(
            EXTRACT(EPOCH FROM (NEW.shift_end_datetime - NEW.shift_start_datetime)) / 86400,
            2
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.calculate_shift_attendance_days() IS 
'Trigger function: Auto-calculates attendance days from shift duration for salary computation';

-- Function: Get shift status (not_started, in_progress, completed)
CREATE OR REPLACE FUNCTION public.get_shift_status(
    p_shift_start_datetime TIMESTAMPTZ,
    p_shift_end_datetime TIMESTAMPTZ
)
RETURNS TEXT AS $$
BEGIN
    IF p_shift_start_datetime IS NULL THEN
        RETURN 'not_started';
    ELSIF p_shift_end_datetime IS NULL THEN
        RETURN 'in_progress';
    ELSE
        RETURN 'completed';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.get_shift_status(TIMESTAMPTZ, TIMESTAMPTZ) IS 
'Helper function: Returns shift status based on start/end timestamps';

-- ============================================================================
-- STEP 6: Create triggers
-- ============================================================================

-- Drop existing triggers to ensure clean state
DROP TRIGGER IF EXISTS trigger_set_attendance_mode ON public.nurse_client;
DROP TRIGGER IF EXISTS trigger_auto_calculate_shift_days_insert ON public.nurse_client;
DROP TRIGGER IF EXISTS trigger_auto_calculate_shift_days_update ON public.nurse_client;

-- Trigger: Set attendance mode on INSERT
CREATE TRIGGER trigger_set_attendance_mode
    BEFORE INSERT ON public.nurse_client
    FOR EACH ROW
    EXECUTE FUNCTION public.set_attendance_mode();

-- Trigger: Calculate attendance days on INSERT (if shift already ended)
CREATE TRIGGER trigger_auto_calculate_shift_days_insert
    BEFORE INSERT ON public.nurse_client
    FOR EACH ROW
    WHEN (NEW.shift_end_datetime IS NOT NULL)
    EXECUTE FUNCTION public.calculate_shift_attendance_days();

-- Trigger: Calculate attendance days on UPDATE (when shift ends)
CREATE TRIGGER trigger_auto_calculate_shift_days_update
    BEFORE UPDATE ON public.nurse_client
    FOR EACH ROW
    WHEN (NEW.shift_end_datetime IS NOT NULL AND OLD.shift_end_datetime IS DISTINCT FROM NEW.shift_end_datetime)
    EXECUTE FUNCTION public.calculate_shift_attendance_days();

-- ============================================================================
-- STEP 7: Create RLS policies
-- ============================================================================

-- Enable RLS on nurse_client table
ALTER TABLE public.nurse_client ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all assignments
DROP POLICY IF EXISTS "Allow authenticated users to view assignments" ON public.nurse_client;

CREATE POLICY "Allow authenticated users to view assignments"
    ON public.nurse_client
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to update assignments (including shifts)
DROP POLICY IF EXISTS "Allow authenticated users to update shifts" ON public.nurse_client;

CREATE POLICY "Allow authenticated users to update shifts"
    ON public.nurse_client
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to create assignments
DROP POLICY IF EXISTS "Allow authenticated users to create assignments" ON public.nurse_client;

CREATE POLICY "Allow authenticated users to create assignments"
    ON public.nurse_client
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- STEP 8: Create reporting views
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.active_shift_attendance;
DROP VIEW IF EXISTS public.completed_shift_attendance;

-- View: Active shifts (in progress)
CREATE VIEW public.active_shift_attendance AS
SELECT 
    nc.id AS assignment_id,
    nc.nurse_id,
    n.first_name || ' ' || n.last_name AS nurse_name,
    n.nurse_reg_no,
    nc.client_id,
    COALESCE(
        ic.patient_name,
        oc.organization_name,
        'Unknown Client'
    ) AS client_name,
    nc.shift_start_datetime,
    nc.shift_start_location,
    nc.attendance_mode,
    ROUND(EXTRACT(EPOCH FROM (NOW() - nc.shift_start_datetime)) / 3600, 2) AS current_duration_hours,
    ROUND(EXTRACT(EPOCH FROM (NOW() - nc.shift_start_datetime)) / 86400, 2) AS current_attendance_days,
    nc.salary_per_day,
    nc.start_date AS assignment_start_date,
    nc.end_date AS assignment_end_date
FROM public.nurse_client nc
INNER JOIN public.nurses n ON nc.nurse_id = n.nurse_id
LEFT JOIN public.clients c ON nc.client_id = c.id
LEFT JOIN public.individual_clients ic ON c.id = ic.client_id AND c.client_type = 'individual'
LEFT JOIN public.organization_clients oc ON c.id = oc.client_id AND c.client_type = 'organization'
WHERE nc.attendance_mode = 'shift_based'
    AND nc.shift_start_datetime IS NOT NULL
    AND nc.shift_end_datetime IS NULL;

COMMENT ON VIEW public.active_shift_attendance IS 
'Shows all ongoing shifts with real-time duration and attendance calculations';

-- View: Completed shifts
CREATE VIEW public.completed_shift_attendance AS
SELECT 
    nc.id AS assignment_id,
    nc.nurse_id,
    n.first_name || ' ' || n.last_name AS nurse_name,
    n.nurse_reg_no,
    nc.client_id,
    COALESCE(
        ic.patient_name,
        oc.organization_name,
        'Unknown Client'
    ) AS client_name,
    nc.shift_start_datetime,
    nc.shift_end_datetime,
    nc.calculated_attendance_days,
    nc.shift_start_location,
    nc.shift_end_location,
    nc.attendance_mode,
    ROUND(EXTRACT(EPOCH FROM (nc.shift_end_datetime - nc.shift_start_datetime)) / 3600, 2) AS duration_hours,
    nc.salary_per_day,
    ROUND((nc.salary_per_day * nc.calculated_attendance_days)::numeric, 2) AS calculated_salary,
    nc.start_date AS assignment_start_date,
    nc.end_date AS assignment_end_date
FROM public.nurse_client nc
INNER JOIN public.nurses n ON nc.nurse_id = n.nurse_id
LEFT JOIN public.clients c ON nc.client_id = c.id
LEFT JOIN public.individual_clients ic ON c.id = ic.client_id AND c.client_type = 'individual'
LEFT JOIN public.organization_clients oc ON c.id = oc.client_id AND c.client_type = 'organization'
WHERE nc.attendance_mode = 'shift_based'
    AND nc.shift_start_datetime IS NOT NULL
    AND nc.shift_end_datetime IS NOT NULL;

COMMENT ON VIEW public.completed_shift_attendance IS 
'Shows all completed shifts with calculated attendance days and salary';

-- ============================================================================
-- STEP 9: Update existing data
-- ============================================================================

-- Set attendance_mode for all existing assignments based on nurse organization
UPDATE public.nurse_client nc
SET attendance_mode = CASE 
    WHEN n.admitted_type = 'Tata_Homenursing' THEN 'shift_based'::attendance_mode
    ELSE 'daily'::attendance_mode
END
FROM public.nurses n
WHERE nc.nurse_id = n.nurse_id
    AND nc.attendance_mode IS NULL;

-- ============================================================================
-- STEP 10: Verification and summary
-- ============================================================================

DO $$
DECLARE
    null_count INTEGER;
    daily_count INTEGER;
    shift_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Check for NULL values
    SELECT COUNT(*) INTO null_count
    FROM public.nurse_client
    WHERE attendance_mode IS NULL;
    
    -- Get counts by mode
    SELECT COUNT(*) INTO daily_count 
    FROM public.nurse_client 
    WHERE attendance_mode = 'daily';
    
    SELECT COUNT(*) INTO shift_count 
    FROM public.nurse_client 
    WHERE attendance_mode = 'shift_based';
    
    SELECT COUNT(*) INTO total_count 
    FROM public.nurse_client;
    
    -- Report results
    IF null_count > 0 THEN
        RAISE WARNING '% assignments still have NULL attendance_mode', null_count;
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHIFT-BASED ATTENDANCE MIGRATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total assignments: %', total_count;
    RAISE NOTICE 'Daily attendance mode: %', daily_count;
    RAISE NOTICE 'Shift-based mode: %', shift_count;
    RAISE NOTICE '========================================';
END $$;
