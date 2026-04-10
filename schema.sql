CREATE DATABASE IF NOT EXISTS hostel_management;
USE hostel_management;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_type VARCHAR(31) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'WARDEN', 'ADMIN') NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT uk_application_student UNIQUE (student_id),
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS allocations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL UNIQUE,
    room_id BIGINT NOT NULL,
    allocated_at DATETIME NOT NULL,
    CONSTRAINT fk_allocation_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_allocation_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    CONSTRAINT uk_attendance_student_date UNIQUE (student_id, attendance_date),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    description VARCHAR(1000) NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_complaint_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('UNPAID', 'PAID') NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_bill_student FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    paid_at DATETIME NOT NULL,
    CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
);

INSERT IGNORE INTO users (id, user_type, name, email, password, role) VALUES
(1, 'ADMIN', 'System Admin', 'admin@hostel.com', 'admin123', 'ADMIN'),
(2, 'WARDEN', 'Main Warden', 'warden@hostel.com', 'warden123', 'WARDEN'),
(3, 'STUDENT', 'Rajat Student', 'student@hostel.com', 'student123', 'STUDENT');

INSERT IGNORE INTO rooms (id, room_number, capacity, status) VALUES
(1, '101', 2, 'AVAILABLE'),
(2, '102', 3, 'AVAILABLE'),
(3, '103', 2, 'MAINTENANCE');

INSERT IGNORE INTO bills (id, student_id, amount, status, created_at) VALUES
(1, 3, 12000.00, 'UNPAID', NOW());
