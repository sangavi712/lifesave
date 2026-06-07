-- Create tables for Blood Bank Management System

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast authentication searches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 65),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(15) NOT NULL,
    city VARCHAR(100) NOT NULL,
    last_donation DATE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on blood group and city for searching matching donors
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_city ON donors(city);

-- 3. Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    hospital VARCHAR(150) NOT NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INT NOT NULL CHECK (units > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on status and blood group
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- 4. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    blood_group VARCHAR(5) UNIQUE NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INT NOT NULL DEFAULT 0 CHECK (units >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
