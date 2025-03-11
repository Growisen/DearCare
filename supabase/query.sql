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