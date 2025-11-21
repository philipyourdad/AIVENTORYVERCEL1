-- AIventory Database Schema for Supabase (PostgreSQL)
-- This is a converted version of your MySQL database

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS stock_movement CASCADE;
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS orders_from_supplier CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Admin Table
CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    admin_username VARCHAR(255) NOT NULL UNIQUE,
    admin_password VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    staff_username VARCHAR(255) NOT NULL UNIQUE,
    staff_password VARCHAR(255) NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    staff_email VARCHAR(255) NOT NULL UNIQUE,
    staff_role VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Table
CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contactnum VARCHAR(30) NOT NULL,
    supplier_email VARCHAR(255) NOT NULL,
    supplier_address VARCHAR(255) NOT NULL,
    supplier_rating DECIMAL(10,0) NOT NULL
);

-- Product Table
CREATE TABLE product (
    Product_id SERIAL PRIMARY KEY,
    Product_name VARCHAR(255) NOT NULL,
    Product_sku VARCHAR(100) NOT NULL,
    Product_description VARCHAR(255),
    Product_price DECIMAL(10,0) NOT NULL,
    Product_stock INT DEFAULT 0,
    Product_status VARCHAR(20) DEFAULT 'Active',
    Product_category VARCHAR(255) NOT NULL,
    reorder_level INT NOT NULL,
    supplier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
);

-- Orders from Supplier Table
CREATE TABLE orders_from_supplier (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supplier_id INT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE
);

-- Order Item Table
CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    quantity INT NOT NULL,
    price INT NOT NULL,
    received_date DATE NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders_from_supplier(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(Product_id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items Table
CREATE TABLE invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    product_id INT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(Product_id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    item_name VARCHAR(255),
    action VARCHAR(255),
    user_name VARCHAR(255),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movement Table
CREATE TABLE stock_movement (
    stock_movement_id SERIAL PRIMARY KEY,
    stock_movement_type VARCHAR(10) NOT NULL,
    stock_movement_quantity INT NOT NULL,
    sm_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inventory_id INT NOT NULL,
    staff_id INT NOT NULL,
    FOREIGN KEY (inventory_id) REFERENCES product(Product_id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE settings (
    setting_id SERIAL PRIMARY KEY,
    notification_threshold INT NOT NULL,
    reorder_rule TEXT NOT NULL,
    staff_id INT NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Insert sample data
-- Sample Admin User
INSERT INTO admin (admin_id, admin_name, admin_username, admin_password, admin_email, created_at, last_login) VALUES
(1, 'Red John', 'redjohn@gmail.com', '$2b$10$KexQiu6ZkgJwNfeanQKKyepqVpokIRbTxE//cKXXKu3A5KWvnrloa', 'redjohn@gmail.com', '2025-11-08 17:49:00', '2025-11-08 17:49:00');

-- Sample Suppliers
INSERT INTO supplier (supplier_id, supplier_name, supplier_contactnum, supplier_email, supplier_address, supplier_rating) VALUES
(1, 'Los Pollos', '09348283721', 'gusfring@gmail.com', 'Mexico', 4),
(2, 'Tyrell Wellick', '09237461781', 'tyrellw@gmail.com', 'New York City', 5);

-- Sample Products
INSERT INTO product (Product_id, Product_name, Product_sku, Product_description, Product_price, Product_stock, Product_status, Product_category, reorder_level, supplier_id, created_at, updated_at) VALUES
(8, 'Brake Pads', 'BRK-PAD-004', '', 600, 41, 'Active', 'Brakes', 25, 1, '2025-11-06 17:34:25', '2025-11-06 17:34:25'),
(9, 'Engine Oil', 'OIL-10W40-002', '', 320, 34, 'Active', 'Lubricants', 20, 1, '2025-11-07 07:22:49', '2025-11-07 07:22:49'),
(10, 'Spark Plug (NGK)', 'Spark Plug (NGK)', '', 250, 71, 'Active', 'Electrical', 15, 1, '2025-11-08 15:58:57', '2025-11-08 16:27:43');

-- Sample Invoices
INSERT INTO invoices (invoice_id, invoice_number, customer_name, customer_email, customer_phone, customer_address, invoice_date, due_date, status, subtotal, tax, total, notes, created_at) VALUES
(4, 'INV-20251107-5829', 'Walter White', 'walterw@gmail.com', '09378718781', 'Mexico', '2025-11-07', '2025-11-08', 'Paid', 600.00, 30.00, 630.00, '', '2025-11-07 06:31:08'),
(5, 'INV-20251107-5254', 'Tony Stark', 'tonys@gmail.com', '09238781234', 'new york', '2025-11-07', '2025-11-08', 'Paid', 1800.00, 90.00, 1890.00, '', '2025-11-07 07:14:09'),
(6, 'INV-20251107-4086', 'Jeff Benz', 'jeffb@gmail.com', '09237817633', 'California', '2025-11-07', '2025-11-07', 'Paid', 3000.00, 150.00, 3150.00, '', '2025-11-07 07:20:17'),
(7, 'INV-20251107-7543', 'Sam Esmael', 'same@gmail.com', '09232123413', 'Japan', '2025-11-07', '2025-11-07', 'Paid', 1600.00, 80.00, 1680.00, '', '2025-11-07 07:24:33'),
(8, 'INV-20251107-8098', 'Rami Malik', NULL, '09352618751', NULL, '2025-11-07', '2025-11-07', 'Paid', 2400.00, 0.00, 2400.00, 'Generated from mobile sale via Cash', '2025-11-07 07:47:51'),
(9, 'INV-20251107-2192', 'Dexter Morgan', NULL, '09345482648', NULL, '2025-11-07', '2025-11-07', 'Paid', 1200.00, 0.00, 1200.00, 'Generated from mobile sale via Card', '2025-11-07 08:01:35'),
(10, 'INV-20251107-9738', 'Minato Kun', 'minatok@gmail.com', '09482878736', 'Hidden Leaf', '2025-11-07', '2025-11-07', 'Paid', 1800.00, 90.00, 1890.00, '', '2025-11-07 08:12:31'),
(11, 'INV-20251107-2835', 'Naruto Kun', NULL, '09684546499', NULL, '2025-11-07', '2025-11-07', 'Paid', 320.00, 0.00, 320.00, 'Generated from mobile sale via Cash', '2025-11-07 08:15:16'),
(12, 'INV-20251107-2102', 'Kakashi Kun', NULL, '09354618164', NULL, '2025-11-07', '2025-11-07', 'Paid', 600.00, 0.00, 600.00, 'Generated from mobile sale via Cash', '2025-11-07 13:36:04'),
(13, 'INV-20251109-2819', 'Bruce Wayne', NULL, '09484646499', NULL, '2025-11-08', '2025-11-08', 'Paid', 10250.00, 0.00, 10250.00, 'Generated from mobile sale via Cash', '2025-11-08 16:04:45'),
(14, 'INV-20251109-4909', 'Patrick Jane', NULL, '09684948945', NULL, '2025-11-08', '2025-11-08', 'Paid', 750.00, 0.00, 750.00, 'Generated from mobile sale via Cash', '2025-11-08 17:56:27');

-- Sample Invoice Items
INSERT INTO invoice_items (item_id, invoice_id, description, quantity, unit_price, product_id) VALUES
(7, 4, 'Brake Pads (BRK-PAD-004)', 1, 600.00, NULL),
(8, 5, 'Brake Pads (BRK-PAD-004)', 3, 600.00, NULL),
(9, 6, 'Brake Pads (BRK-PAD-004)', 5, 600.00, NULL),
(10, 7, 'Engine Oil (OIL-10W40-002)', 5, 320.00, NULL),
(11, 8, 'Brake Pads (BRK-PAD-004)', 4, 600.00, NULL),
(12, 9, 'Brake Pads (BRK-PAD-004)', 2, 600.00, NULL),
(13, 10, 'Brake Pads (BRK-PAD-004)', 3, 600.00, 8),
(14, 11, 'Engine Oil (OIL-10W40-002)', 1, 320.00, 9),
(15, 12, 'Brake Pads (BRK-PAD-004)', 1, 600.00, 8),
(16, 13, 'Spark Plug (NGK) (Spark Plug (NGK))', 41, 250.00, 10),
(17, 14, 'Spark Plug (NGK) (Spark Plug (NGK))', 3, 250.00, 10);

-- Sample Notifications
INSERT INTO notifications (id, title, message, item_name, action, user_name, user_id, created_at) VALUES
(1, 'Item Added', 'Engine Oil was added by Admin', 'Engine Oil', 'New item added to inventory', 'Admin', 1, '2025-11-07 07:22:49'),
(2, 'Item Added', 'Spark Plug (NGK) was added by Admin', 'Spark Plug (NGK)', 'New item added to inventory', 'Admin', 1, '2025-11-08 15:58:57');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_from_supplier_updated_at BEFORE UPDATE ON orders_from_supplier
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();