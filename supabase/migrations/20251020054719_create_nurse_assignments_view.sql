CREATE OR REPLACE VIEW nurse_assignments_view AS
SELECT 
  nc.*,
  n.first_name AS nurse_first_name,
  n.last_name AS nurse_last_name,
  n.first_name || ' ' || n.last_name AS nurse_full_name,
  n.admitted_type,
  c.client_type,
  c.client_category,
  COALESCE(
    ic.requestor_name,
    ic.patient_name,
    oc.organization_name
  ) AS client_name,
  COALESCE(
    ic.patient_name,
    ''
  ) AS patient_name
FROM nurse_client nc
INNER JOIN nurses n ON nc.nurse_id = n.nurse_id
INNER JOIN clients c ON nc.client_id = c.id
LEFT JOIN individual_clients ic ON c.id = ic.client_id AND c.client_type = 'individual'
LEFT JOIN organization_clients oc ON c.id = oc.client_id AND c.client_type = 'organization';