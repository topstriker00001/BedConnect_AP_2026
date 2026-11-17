CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('PATIENT', 'HOSPITAL_ADMIN', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES users(user_id),
    hospital_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20)
);

CREATE TABLE resource_availability (
    resource_id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals(hospital_id),
    resource_type VARCHAR(30) NOT NULL
        CHECK (resource_type IN
        ('GENERAL', 'ICU', 'OXYGEN', 'VENTILATOR')),
    total_count INT NOT NULL CHECK (total_count >= 0),
    available_count INT NOT NULL CHECK
        (available_count >= 0 AND available_count <= total_count),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, resource_type)
);

CREATE TABLE bed_requests (
    request_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(user_id),
    hospital_id INT NOT NULL REFERENCES hospitals(hospital_id),
    resource_id INT NOT NULL REFERENCES resource_availability(resource_id),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);
