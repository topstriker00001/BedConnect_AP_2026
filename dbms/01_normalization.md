# BedConnect Database Normalization

## 1. Application Overview

BedConnect is a hospital resource availability platform.
Patients can search hospitals, view available resources,
request beds and track their requests. Hospital administrators
manage resource availability and process requests.

## 2. Proposed Initial Structure (UNF)

Initially, all information could be stored in one large table:

PATIENT_HOSPITAL_REQUEST(
    patient_id, patient_name, patient_email,
    hospital_id, hospital_name, hospital_city,
    admin_id, admin_email,
    resource_id, resource_type, available_count,
    request_id, request_date, request_status
)

This structure contains redundant hospital, patient and
resource information.

## 3. First Normal Form (1NF)

Rules:
- Each column contains atomic values.
- Each record is uniquely identifiable.
- No repeating groups or multiple values in one column.

The initial structure is divided into individual records,
with one resource type per record.

## 4. Second Normal Form (2NF)

Rules:
- Must satisfy 1NF.
- Every non-key attribute must depend on the complete candidate key.
- Remove partial dependencies.

We separate patient, hospital, resource and request information
into independent relations.

## 5. Third Normal Form (3NF)

Rules:
- Must satisfy 2NF.
- No transitive dependencies between non-key attributes.

Final proposed relations:

### USER
- user_id (PK)
- name
- email (UNIQUE)
- password_hash
- role
- created_at

Functional dependency:
user_id -> name, email, password_hash, role, created_at

### HOSPITAL
- hospital_id (PK)
- admin_id (FK -> USER.user_id)
- hospital_name
- city
- address
- phone

Functional dependency:
hospital_id -> admin_id, hospital_name, city, address, phone

### RESOURCE_AVAILABILITY
- resource_id (PK)
- hospital_id (FK -> HOSPITAL.hospital_id)
- resource_type
- total_count
- available_count
- updated_at

Functional dependency:
resource_id -> hospital_id, resource_type, total_count,
available_count, updated_at

### BED_REQUEST
- request_id (PK)
- patient_id (FK -> USER.user_id)
- hospital_id (FK -> HOSPITAL.hospital_id)
- resource_id (FK -> RESOURCE_AVAILABILITY.resource_id)
- request_date
- status

Functional dependency:
request_id -> patient_id, hospital_id, resource_id,
request_date, status

## 6. Why the Final Design Is in 3NF

1. Each table has a primary key.
2. Attributes contain atomic values.
3. Non-key attributes depend on the complete primary key.
4. Hospital details are not repeatedly stored in requests.
5. Patient details are stored separately from requests.
6. Resource availability is maintained independently.

## 7. Conclusion

The proposed design separates users, hospitals, resources
and bed requests into independent relations.

This reduces redundancy and improves data consistency.

Note: This is the proposed logical design and must be
validated against the final Prisma implementation.
