-- Seed file for Blood Bank Management System

-- Initialize Inventory with 0 units for all groups if not present
INSERT INTO inventory (blood_group, units) VALUES
('A+', 15),
('A-', 5),
('B+', 20),
('B-', 4),
('AB+', 8),
('AB-', 2),
('O+', 25),
('O-', 10)
ON CONFLICT (blood_group) DO NOTHING;

-- Seed Users:
-- Admin: admin@bloodbank.com / admin123 (bcrypt hash: $2a$10$bh5bykyCrnhz.i5kn6PeF.GKaoi95.4O/c9NM7nDAdqWqmdoGAGgC)
-- User: user@bloodbank.com / user123 (bcrypt hash: $2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56)
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@bloodbank.com', '$2a$10$bh5bykyCrnhz.i5kn6PeF.GKaoi95.4O/c9NM7nDAdqWqmdoGAGgC', 'admin'),
('Dorian Vance', 'dorian@example.com', '$2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56', 'user'),
('Clara Sterling', 'clara@example.com', '$2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56', 'user')
ON CONFLICT (email) DO NOTHING;

-- Seed Donors (linked to Clara and independent ones)
INSERT INTO donors (name, age, blood_group, phone, city, last_donation, user_id) VALUES
('Declan Vance', 34, 'O+', '555-0101', 'Hill Valley', '2026-03-15', NULL),
('Clara Sterling', 28, 'A+', '555-0102', 'Metro City', '2026-02-10', 3),
('Julian Mercer', 45, 'B+', '555-0103', 'River Heights', '2025-11-20', NULL),
('Fiona Beckett', 22, 'AB-', '555-0104', 'Emerald Bay', NULL, NULL),
('Gideon Cross', 31, 'O-', '555-0105', 'Silverpine', '2026-04-01', NULL);

-- Seed Requests
INSERT INTO requests (hospital, blood_group, units, status, user_id) VALUES
('Metro City Station', 'O+', 5, 'approved', 2),
('Aether Bio-Network', 'A-', 2, 'pending', 3),
('Nova Care Station', 'B+', 3, 'rejected', 2),
('Mercy Outpost Node', 'AB+', 1, 'pending', 2);
