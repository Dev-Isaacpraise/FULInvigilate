-- =====================================================================
-- FEDERAL UNIVERSITY LOKOJA (FUL)
-- AUTOMATED EXAMINATION INVIGILATOR ALLOCATION SYSTEM
-- Database Schema (ANSI SQL / PostgreSQL / SQLite / MySQL Compatible)
-- =====================================================================

-- 1. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    rank VARCHAR(50) NOT NULL, -- Professor, Associate Professor, Senior Lecturer, etc.
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    max_load INTEGER NOT NULL DEFAULT 4 CHECK (max_load >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. COURSE TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'CSC 301'
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    lecturer_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_lecturer FOREIGN KEY (lecturer_id) 
        REFERENCES staff(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 3. EXAM TABLE
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    expected_students INTEGER NOT NULL CHECK (expected_students > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_exam_time CHECK (start_time < end_time)
);

-- 4. VENUE TABLE
CREATE TABLE IF NOT EXISTS venues (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'Multi-Purpose Hall (MPH)'
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location VARCHAR(100) NOT NULL, -- e.g. 'Felele Permanent Site', 'Adankolo Campus'
    fixed_invigilator_count INTEGER NOT NULL DEFAULT 2 CHECK (fixed_invigilator_count > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXAM_VENUE JOIN TABLE (Splits exams across venues)
CREATE TABLE IF NOT EXISTS exam_venues (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    venue_id VARCHAR(36) NOT NULL,
    students_assigned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ev_exam FOREIGN KEY (exam_id) 
        REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ev_venue FOREIGN KEY (venue_id) 
        REFERENCES venues(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_exam_venue UNIQUE (exam_id, venue_id)
);

-- 6. ALLOCATION TABLE (Invigilator assignment records)
CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    venue_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('chief', 'assistant')),
    status VARCHAR(20) NOT NULL DEFAULT 'suggested' 
        CHECK (status IN ('suggested', 'approved', 'edited', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_exam FOREIGN KEY (exam_id) 
        REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_alloc_venue FOREIGN KEY (venue_id) 
        REFERENCES venues(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_alloc_staff FOREIGN KEY (staff_id) 
        REFERENCES staff(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_exam_venue_staff UNIQUE (exam_id, venue_id, staff_id)
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36)
);

-- 8. NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    allocation_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_datetime ON exams(date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_alloc_staff ON allocations(staff_id);
CREATE INDEX IF NOT EXISTS idx_alloc_exam_venue ON allocations(exam_id, venue_id);
CREATE INDEX IF NOT EXISTS idx_alloc_status ON allocations(status);
