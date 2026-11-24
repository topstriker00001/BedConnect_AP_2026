-- ============================================================
-- BedConnect - Database Queries
-- PostgreSQL
-- Tables: users, hospitals, resource_availability, bed_requests
--   R1–R22 : READ queries  (22)
--   W1–W8  : WRITE queries (8)
-- ============================================================


-- ============================================================
-- READ QUERIES (R1–R22)
-- ============================================================

-- R1 -- READ: Find user by email for login
SELECT user_id, name, email, password_hash, role
FROM users
WHERE email = 'rahul@example.com';

-- R2 -- READ: Get user profile by user_id
SELECT user_id, name, email, role, created_at
FROM users
WHERE user_id = 1;

-- R3 -- READ: Get all registered patients
SELECT user_id, name, email, created_at
FROM users
WHERE role = 'PATIENT'
ORDER BY created_at DESC;

-- R4 -- READ: Get all hospitals
SELECT hospital_id, hospital_name, city, address, phone
FROM hospitals
ORDER BY hospital_name;

-- R5 -- READ: Search hospitals by city
SELECT hospital_id, hospital_name, city, address, phone
FROM hospitals
WHERE LOWER(city) = LOWER('Delhi')
ORDER BY hospital_name;

-- R6 -- READ: Get hospitals managed by a specific admin
SELECT h.hospital_id, h.hospital_name, h.city, h.address, h.phone
FROM hospitals h
WHERE h.admin_id = 2;

-- R7 -- READ: Get all resources of a hospital
SELECT resource_id, resource_type, total_count,
       available_count, updated_at
FROM resource_availability
WHERE hospital_id = 1
ORDER BY resource_type;

-- R8 -- READ: Search available resources by city and resource type
SELECT h.hospital_id, h.hospital_name, h.city,
       h.address, h.phone,
       r.resource_id, r.resource_type,
       r.total_count, r.available_count
FROM hospitals h
JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE LOWER(h.city) = LOWER('Delhi')
  AND r.resource_type = 'ICU'
  AND r.available_count > 0
ORDER BY r.available_count DESC;

-- R9 -- READ: Search hospitals with available ventilators
SELECT h.hospital_name, h.city, h.phone,
       r.total_count, r.available_count
FROM hospitals h
JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE r.resource_type = 'VENTILATOR'
  AND r.available_count > 0
ORDER BY r.available_count DESC;

-- R10 -- READ: Get total available resources by type
SELECT resource_type,
       SUM(total_count) AS total_resources,
       SUM(available_count) AS available_resources
FROM resource_availability
GROUP BY resource_type
ORDER BY resource_type;

-- R11 -- READ: Get all bed requests made by a patient
SELECT br.request_id, h.hospital_name,
       r.resource_type, br.request_date, br.status
FROM bed_requests br
JOIN hospitals h
    ON br.hospital_id = h.hospital_id
JOIN resource_availability r
    ON br.resource_id = r.resource_id
WHERE br.patient_id = 1
ORDER BY br.request_date DESC;

-- R12 -- READ: Get pending bed requests for a hospital
SELECT br.request_id, u.name AS patient_name,
       u.email, r.resource_type, br.request_date
FROM bed_requests br
JOIN users u
    ON br.patient_id = u.user_id
JOIN resource_availability r
    ON br.resource_id = r.resource_id
WHERE br.hospital_id = 1
  AND br.status = 'PENDING'
ORDER BY br.request_date ASC;

-- R13 -- READ: Get resource summary for a hospital
SELECT h.hospital_name,
       r.resource_type,
       r.total_count,
       r.available_count,
       (r.total_count - r.available_count) AS occupied_count
FROM hospitals h
JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE h.hospital_id = 1
ORDER BY r.resource_type;

-- R14 -- READ: Get request statistics for a hospital
SELECT
    COUNT(*) AS total_requests,
    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_requests,
    COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_requests,
    COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected_requests,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_requests
FROM bed_requests
WHERE hospital_id = 1;

-- R15 -- READ: Get 20 most recent requests for a hospital
SELECT br.request_id, u.name AS patient_name,
       h.hospital_name, r.resource_type,
       br.status, br.request_date
FROM bed_requests br
JOIN users u
    ON br.patient_id = u.user_id
JOIN hospitals h
    ON br.hospital_id = h.hospital_id
JOIN resource_availability r
    ON br.resource_id = r.resource_id
WHERE br.hospital_id = 1
ORDER BY br.request_date DESC
LIMIT 20;

-- R16 -- READ: Get total platform statistics
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM hospitals) AS total_hospitals,
    (SELECT COUNT(*) FROM bed_requests) AS total_requests,
    (SELECT COUNT(*) FROM bed_requests
     WHERE status = 'PENDING') AS pending_requests;

-- R17 -- READ: Get hospital count by city
SELECT city, COUNT(*) AS hospital_count
FROM hospitals
GROUP BY city
ORDER BY hospital_count DESC;

-- R18 -- READ: Get total and occupied resource availability across all hospitals
SELECT
    resource_type,
    SUM(total_count) AS total_count,
    SUM(available_count) AS available_count,
    SUM(total_count - available_count) AS occupied_count
FROM resource_availability
GROUP BY resource_type
ORDER BY resource_type;

-- R19 -- READ: Get most requested hospitals
SELECT h.hospital_id, h.hospital_name, h.city,
       COUNT(br.request_id) AS total_requests
FROM hospitals h
LEFT JOIN bed_requests br
    ON h.hospital_id = br.hospital_id
GROUP BY h.hospital_id, h.hospital_name, h.city
ORDER BY total_requests DESC;

-- R20 -- READ: Find hospitals with no resource records
SELECT h.hospital_id, h.hospital_name, h.city
FROM hospitals h
LEFT JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE r.resource_id IS NULL;

-- R21 -- READ: Find resource records with zero availability
SELECT h.hospital_name, h.city,
       r.resource_type, r.total_count
FROM resource_availability r
JOIN hospitals h
    ON r.hospital_id = h.hospital_id
WHERE r.available_count = 0;

-- R22 -- READ: Get all bed requests with patient and hospital details
SELECT br.request_id,
       u.name AS patient_name,
       h.hospital_name,
       h.city,
       r.resource_type,
       br.request_date,
       br.status
FROM bed_requests br
JOIN users u
    ON br.patient_id = u.user_id
JOIN hospitals h
    ON br.hospital_id = h.hospital_id
JOIN resource_availability r
    ON br.resource_id = r.resource_id
ORDER BY br.request_date DESC;


-- ============================================================
-- WRITE QUERIES (W1–W8)
-- ============================================================

-- W1 -- WRITE: Register a new patient
INSERT INTO users (name, email, password_hash, role)
VALUES ('Ananya Verma', 'ananya.new@example.com', 'hashed_password', 'PATIENT')
RETURNING user_id, name, email, role;

-- W2 -- WRITE: Register a new hospital
INSERT INTO hospitals (admin_id, hospital_name, city, address, phone)
VALUES (2, 'City Care Hospital', 'Delhi',
        'Sector 10, Delhi', '9876543210')
RETURNING hospital_id, hospital_name, city;

-- W3 -- WRITE: Add resource availability for a hospital
INSERT INTO resource_availability
    (hospital_id, resource_type, total_count, available_count)
VALUES
    (500, 'GENERAL', 100, 50)
RETURNING *;

-- W4 -- WRITE: Update resource availability for a hospital
UPDATE resource_availability
SET total_count = 120,
    available_count = 60,
    updated_at = CURRENT_TIMESTAMP
WHERE hospital_id = 1
  AND resource_type = 'GENERAL'
  AND 60 <= 120
RETURNING *;

-- W5 -- WRITE: Create a bed request
INSERT INTO bed_requests (patient_id, hospital_id, resource_id)
VALUES (1, 1, 1)
RETURNING request_id, patient_id, hospital_id, resource_id,
          request_date, status;

-- W6 -- WRITE: Approve a pending request and decrement available resource count
WITH reserved AS (
    UPDATE resource_availability r
    SET available_count = r.available_count - 1,
        updated_at = CURRENT_TIMESTAMP
    FROM bed_requests br
    WHERE br.request_id = 1
      AND br.status = 'PENDING'
      AND r.resource_id = br.resource_id
      AND r.available_count > 0
    RETURNING br.request_id
)
UPDATE bed_requests br
SET status = 'APPROVED'
FROM reserved
WHERE br.request_id = reserved.request_id
  AND br.status = 'PENDING'
RETURNING br.request_id, br.status;

-- W7 -- WRITE: Reject a pending bed request
UPDATE bed_requests
SET status = 'REJECTED'
WHERE request_id = 1
  AND status = 'PENDING'
RETURNING *;

-- W8 -- WRITE: Cancel a pending bed request
UPDATE bed_requests
SET status = 'CANCELLED'
WHERE request_id = 1
  AND status = 'PENDING'
RETURNING *;