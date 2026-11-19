-- ============================================================
-- BedConnect - Database Queries
-- PostgreSQL
-- Tables: users, hospitals, resource_availability, bed_requests
-- ============================================================

-- Select the database schema
-- SET search_path TO public;


-- ============================================================
-- 1. USER AUTHENTICATION & MANAGEMENT
-- ============================================================

-- Q1. Register a new patient
INSERT INTO users (name, email, password_hash, role)
VALUES ('Rahul Sharma', 'rahul@example.com', 'hashed_password', 'PATIENT')
RETURNING user_id, name, email, role;

-- Q2. Find user by email for login
SELECT user_id, name, email, password_hash, role
FROM users
WHERE email = 'rahul@example.com';

-- Q3. Get user profile
SELECT user_id, name, email, role, created_at
FROM users
WHERE user_id = 1;

-- Q4. Get all registered patients
SELECT user_id, name, email, created_at
FROM users
WHERE role = 'PATIENT'
ORDER BY created_at DESC;


-- ============================================================
-- 2. HOSPITAL MANAGEMENT
-- ============================================================

-- Q5. Register a new hospital
INSERT INTO hospitals (admin_id, hospital_name, city, address, phone)
VALUES (2, 'City Care Hospital', 'Delhi',
        'Sector 10, Delhi', '9876543210')
RETURNING hospital_id, hospital_name, city;

-- Q6. Get all hospitals
SELECT hospital_id, hospital_name, city, address, phone
FROM hospitals
ORDER BY hospital_name;

-- Q7. Search hospitals by city
SELECT hospital_id, hospital_name, city, address, phone
FROM hospitals
WHERE LOWER(city) = LOWER('Delhi')
ORDER BY hospital_name;

-- Q8. Get hospitals managed by a particular admin
SELECT h.hospital_id, h.hospital_name, h.city, h.address, h.phone
FROM hospitals h
WHERE h.admin_id = 2;


-- ============================================================
-- 3. RESOURCE AVAILABILITY
-- ============================================================

-- Q9. Add resource availability for a hospital
INSERT INTO resource_availability
    (hospital_id, resource_type, total_count, available_count)
VALUES
    (1, 'GENERAL', 100, 50)
RETURNING *;

-- Q10. Get all resources of a hospital
SELECT resource_id, resource_type, total_count,
       available_count, updated_at
FROM resource_availability
WHERE hospital_id = 1
ORDER BY resource_type;

-- Q11. Search available resources by city and resource type
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

-- Q12. Search hospitals with available ventilators
SELECT h.hospital_name, h.city, h.phone,
       r.total_count, r.available_count
FROM hospitals h
JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE r.resource_type = 'VENTILATOR'
  AND r.available_count > 0
ORDER BY r.available_count DESC;

-- Q13. Update resource availability
UPDATE resource_availability
SET total_count = 120,
    available_count = 60,
    updated_at = CURRENT_TIMESTAMP
WHERE hospital_id = 1
  AND resource_type = 'GENERAL'
  AND 60 <= 120
RETURNING *;

-- Q14. Get total available resources by type
SELECT resource_type,
       SUM(total_count) AS total_resources,
       SUM(available_count) AS available_resources
FROM resource_availability
GROUP BY resource_type
ORDER BY resource_type;


-- ============================================================
-- 4. BED REQUEST MANAGEMENT
-- ============================================================

-- Q15. Create a bed request
INSERT INTO bed_requests (patient_id, hospital_id, resource_id)
VALUES (1, 1, 1)
RETURNING request_id, patient_id, hospital_id, resource_id,
          request_date, status;

-- Q16. Get all requests made by a patient
SELECT br.request_id, h.hospital_name,
       r.resource_type, br.request_date, br.status
FROM bed_requests br
JOIN hospitals h
    ON br.hospital_id = h.hospital_id
JOIN resource_availability r
    ON br.resource_id = r.resource_id
WHERE br.patient_id = 1
ORDER BY br.request_date DESC;

-- Q17. Get pending requests for a hospital
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

-- Q18. Approve a pending request and reserve one resource.
-- Run as a single transaction.
BEGIN;

DO $$
DECLARE
    v_resource_id INT;
    v_status VARCHAR(20);
BEGIN
    SELECT resource_id, status
    INTO v_resource_id, v_status
    FROM bed_requests
    WHERE request_id = 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bed request not found';
    END IF;

    IF v_status <> 'PENDING' THEN
        RAISE EXCEPTION 'Only pending requests can be approved';
    END IF;

    UPDATE resource_availability
    SET available_count = available_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE resource_id = v_resource_id
      AND available_count > 0;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No resources available';
    END IF;

    UPDATE bed_requests
    SET status = 'APPROVED'
    WHERE request_id = 1
      AND status = 'PENDING';
END $$;

COMMIT;

-- Q19. Reject a pending request
UPDATE bed_requests
SET status = 'REJECTED'
WHERE request_id = 1
  AND status = 'PENDING'
RETURNING *;

-- Q20. Cancel a pending request
UPDATE bed_requests
SET status = 'CANCELLED'
WHERE request_id = 1
  AND status = 'PENDING'
RETURNING *;


-- ============================================================
-- 5. HOSPITAL ADMIN DASHBOARD
-- ============================================================

-- Q21. Get resource summary for a hospital
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

-- Q22. Get request statistics for a hospital
SELECT
    COUNT(*) AS total_requests,
    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_requests,
    COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_requests,
    COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected_requests,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_requests
FROM bed_requests
WHERE hospital_id = 1;

-- Q23. Get recent requests for a hospital
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


-- ============================================================
-- 6. PLATFORM ADMIN ANALYTICS
-- ============================================================

-- Q24. Total platform statistics
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM hospitals) AS total_hospitals,
    (SELECT COUNT(*) FROM bed_requests) AS total_requests,
    (SELECT COUNT(*) FROM bed_requests
     WHERE status = 'PENDING') AS pending_requests;

-- Q25. Hospital count by city
SELECT city, COUNT(*) AS hospital_count
FROM hospitals
GROUP BY city
ORDER BY hospital_count DESC;

-- Q26. Total resource availability across all hospitals
SELECT
    resource_type,
    SUM(total_count) AS total_count,
    SUM(available_count) AS available_count,
    SUM(total_count - available_count) AS occupied_count
FROM resource_availability
GROUP BY resource_type
ORDER BY resource_type;

-- Q27. Most requested hospitals
SELECT h.hospital_id, h.hospital_name, h.city,
       COUNT(br.request_id) AS total_requests
FROM hospitals h
LEFT JOIN bed_requests br
    ON h.hospital_id = br.hospital_id
GROUP BY h.hospital_id, h.hospital_name, h.city
ORDER BY total_requests DESC;


-- ============================================================
-- 7. DATA VALIDATION & REPORTING
-- ============================================================

-- Q28. Find hospitals with no resource records
SELECT h.hospital_id, h.hospital_name, h.city
FROM hospitals h
LEFT JOIN resource_availability r
    ON h.hospital_id = r.hospital_id
WHERE r.resource_id IS NULL;

-- Q29. Find resource records with zero availability
SELECT h.hospital_name, h.city,
       r.resource_type, r.total_count
FROM resource_availability r
JOIN hospitals h
    ON r.hospital_id = h.hospital_id
WHERE r.available_count = 0;

-- Q30. Get all bed requests with patient and hospital details
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
-- END OF BedConnect QUERIES
-- ============================================================
