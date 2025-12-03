-- PostgreSQL compatible SQL for Supabase
-- Converted from MySQL dump

-- Create admin table
CREATE TABLE admin (
  admin_id SERIAL PRIMARY KEY,
  admin_name VARCHAR(255) NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Insert admin data
INSERT INTO admin (admin_id, admin_name, admin_username, admin_password, admin_email, created_at, last_login) VALUES
(1, 'Red John', 'redjohn@gmail.com', '$2b$10$SHxzYMbasQ8BSpaN9ln07.Gc2HofuCYunrNhSrcU.X.jO3cSrYZRi', 'redjohn@gmail.com', '2025-11-30 07:41:12', '2025-11-30 07:41:12'),
(2, 'Robert Kun', 'robertk@gmail.com', '$2b$10$f2F9koJIqO.0bDVgYtMdIuPnYN2PdqQT7YqomTG9h78S5aY2NkDR6', 'robertk@gmail.com', '2025-11-15 15:44:06', '2025-11-15 15:44:06'),
(3, 'Rick Grimes', 'rickg@gmail.com', '$2b$10$.KtTPLeg0sU4ZTYycwMaIuxJnpkRE9AlfX2LMheXj3jymLEKxtTMy', 'rickg@gmail.com', '2025-11-17 03:43:33', '2025-11-17 03:43:33'),
(4, 'Jenny D', 'jennyd@gmail.com', '$2b$10$YQ96PXHT9yqnX05wDMmRHevTmyQ0/aiaGrpKSw7An.34pw.hD..Km', 'jennyd@gmail.com', '2025-11-16 05:16:46', '2025-11-16 05:16:46'),
(5, 'Jack D', 'jackd', '$2b$10$zjTUQqKNlq6njUmFa7v5AOw/.SNEGulUJ1GDST7r7dHxR8OUh0Rn6', 'jackd@gmail.com', '2025-11-16 06:43:23', '2025-11-16 06:43:23'),
(6, 'Mary Rose', 'Maryrose123@gmail.com', '$2b$10$5CeFJh2utGoQBdpsC8hJNerwZiEQUOm5xDt0ubbth844x1wgGYzd6', 'Maryrose123@gmail.com', '2025-11-17 08:11:27', '2025-11-17 08:11:27');

-- Create inventory table
CREATE TABLE inventory (
  inventory_id SERIAL PRIMARY KEY,
  stock_quantity INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('normal', 'low stock', 'out of stock')) NOT NULL,
  product_id INTEGER NOT NULL,
  last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
  invoice_id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue')),
  subtotal DECIMAL(10,2) DEFAULT 0.00,
  tax DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Insert invoices data
INSERT INTO invoices (invoice_id, invoice_number, customer_name, customer_email, customer_phone, customer_address, invoice_date, due_date, status, subtotal, tax, total, notes, created_at) VALUES
(3, 'INV-1764584759005-9586', 'Walk-in Customer', NULL, NULL, NULL, '2025-08-01', '2025-08-01', 'Paid', 180.00, 0.00, 180.00, 'Imported from Motorparts Sales - AUG - SEP.csv', '2025-12-01 10:25:59'),
(4, 'INV-1764584759017-2724', 'Walk-in Customer', NULL, NULL, NULL, '2025-08-01', '2025-08-01', 'Paid', 30.00, 0.00, 30.00, 'Imported from Motorparts Sales - AUG - SEP.csv', '2025-12-01 10:25:59'),
(5, 'INV-1764584759031-8661', 'Walk-in Customer', NULL, NULL, NULL, '2025-08-01', '2025-08-01', 'Paid', 550.00, 0.00, 550.00, 'Imported from Motorparts Sales - AUG - SEP.csv', '2025-12-01 10:25:59'),
(6, 'INV-1764584759039-6265', 'Walk-in Customer', NULL, NULL, NULL, '20