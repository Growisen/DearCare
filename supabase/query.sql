CREATE POLICY "Enable full access for admin users on nurses"
ON nurses
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');


CREATE POLICY "Enable full access for admin users on nurse_references"
ON nurse_references
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');


CREATE POLICY "Enable full access for admin users on nurse_health"
ON nurse_health
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');




-- clients section
-- Create enum types for static values
CREATE TYPE client_type AS ENUM ('individual', 'organization', 'hospital', 'carehome');
CREATE TYPE client_category AS ENUM ('DearCare', 'TataLife'); -- For DearCare vs Tata Life
CREATE TYPE client_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'assigned');

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE relation_type AS ENUM ('self', 'spouse', 'child', 'parent', 'sibling', 'other');

-- Base clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_type client_type NOT NULL,
    client_category client_category NOT NULL,
    status client_status DEFAULT 'pending',
    general_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE individual_clients (
    client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    requestor_name VARCHAR(255) NOT NULL,
    requestor_phone VARCHAR(50) NOT NULL,
    requestor_email VARCHAR(255) NOT NULL,
    relation_to_patient relation_type NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    patient_gender gender_type,
    patient_phone VARCHAR(50),
    complete_address TEXT NOT NULL,
    service_required VARCHAR(50) NOT NULL,
    care_duration VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    preferred_caregiver_gender VARCHAR
);

-- Organization client details
CREATE TABLE organization_clients (
    client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) DEFAULT '',
    contact_person_name VARCHAR(255) NOT NULL,
    contact_person_role VARCHAR(100) DEFAULT '',
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    organization_address TEXT NOT NULL,
    contract_duration VARCHAR(50)
);

-- Staff requirements table
CREATE TABLE staff_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    staff_type VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    shift_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client locations table for future geo-features
CREATE TABLE client_locations (
    client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking client-staff assignments
-- CREATE TABLE client_staff_assignments (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
--     staff_id UUID, -- Reference to your staff/users table
--     assignment_start_date DATE NOT NULL,
--     assignment_end_date DATE,
--     shift_type shift_type,
--     status VARCHAR(50) DEFAULT 'pending',
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_locations_updated_at
    BEFORE UPDATE ON client_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_staff_assignments_updated_at
    BEFORE UPDATE ON client_staff_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for client tables
CREATE POLICY "Enable read access for authenticated users on clients"
ON clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users on clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for admin users on clients"
ON clients
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Similar policies for other tables
-- ... (add more as needed)


-- Create patient assessments table
CREATE TABLE patient_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    guardian_occupation VARCHAR(100),
    marital_status VARCHAR(50),
    height VARCHAR(20),
    weight VARCHAR(20),
    pincode VARCHAR(20),
    district VARCHAR(100),
    city_town VARCHAR(100),
    current_status VARCHAR(50),
    chronic_illness VARCHAR(10),
    medical_history TEXT,
    surgical_history TEXT,
    medication_history TEXT,
    alertness_level TEXT,
    physical_behavior TEXT,
    speech_patterns TEXT,
    emotional_state TEXT,
    drugs_use TEXT,
    alcohol_use TEXT,
    tobacco_use TEXT,
    other_social_history TEXT,
    present_condition TEXT,
    blood_pressure VARCHAR(50),
    sugar_level VARCHAR(50),
    lab_investigations JSONB,
    final_diagnosis TEXT,
    foods_to_include TEXT,
    foods_to_avoid TEXT,
    patient_position VARCHAR(50),
    feeding_method VARCHAR(50),
    environment JSONB,
    equipment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for this table
CREATE POLICY "Enable select for authenticated users on patient_assessments"
ON patient_assessments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert and update for admin users on patient_assessments"
ON patient_assessments
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');