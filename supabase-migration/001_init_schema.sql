-- AIventory Database Setup Script (PostgreSQL version for Supabase)
-- This script creates the database tables with proper structure for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS orders_from_supplier CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS stock_movement CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Admin Table
CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    admin_username VARCHAR(50) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    admin_email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    staff_username VARCHAR(50) UNIQUE NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    staff_email VARCHAR(100) UNIQUE NOT NULL,
    staff_role VARCHAR(20) DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Table
CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_contactnum VARCHAR(30),
    supplier_email VARCHAR(100),
    supplier_address TEXT,
    supplier_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Table
CREATE TABLE product (
    Product_id SERIAL PRIMARY KEY,
    Product_name VARCHAR(100) NOT NULL,
    Product_description TEXT,
    Product_sku VARCHAR(50),
    Product_price DECIMAL(10,2) NOT NULL,
    Product_stock INT DEFAULT 0,
    Product_category VARCHAR(50),
    reorder_level INT DEFAULT 10,
    supplier_id INT,
    Product_status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
);

-- Orders from Supplier Table
CREATE TABLE orders_from_supplier (
    order_id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL,
    order_status VARCHAR(20) DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    supplier_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE
);

-- Order Item Table
CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    received_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders_from_supplier(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(Product_id) ON DELETE CASCADE
);

-- Invoice Table
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
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
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
    product_id INT NULL,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movement Table
CREATE TABLE stock_movement (
    stock_movement_id SERIAL PRIMARY KEY,
    stock_movement_type VARCHAR(10) NOT NULL,
    stock_movement_quantity INT NOT NULL,
    inventory_id INT NOT NULL,
    staff_id INT NOT NULL,
    sm_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES product(Product_id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    notification_threshold INT DEFAULT 10,
    reorder_rule VARCHAR(50) DEFAULT 'default',
    staff_id INT,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Insert sample data
-- Sample Admin User (password: admin123 - bcrypt hashed)
INSERT INTO admin (admin_name, admin_username, admin_password, admin_email) 
VALUES ('Administrator', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@aiventory.com');

-- Sample Staff User (password: staff123 - bcrypt hashed)
INSERT INTO staff (staff_name, staff_username, staff_password, staff_email, staff_role) 
VALUES ('Staff User', 'staff', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff@aiventory.com', 'Staff');

-- Sample Suppliers
INSERT INTO supplier (supplier_name, supplier_contactnum, supplier_email, supplier_address, supplier_rating) VALUES
('TechSupply Co.', '+1234567890', 'contact@techsupply.com', '123 Tech Street, Silicon Valley', 4.5),
('Office Essentials', '+0987654321', 'sales@officeessentials.com', '456 Business Ave, Downtown', 4.2),
('Global Electronics', '+1122334455', 'info@globalelectronics.com', '789 Electronics Blvd, Tech City', 4.8);

-- Sample Products
INSERT INTO product (Product_name, Product_sku, Product_price, Product_stock, Product_category, reorder_level, supplier_id, Product_status) VALUES
('Laptop Computer', 'LAP001', 899.99, 25, 'Electronics', 5, 1, 'Active'),
('Office Chair', 'CHAIR001', 199.99, 15, 'Furniture', 3, 2, 'Active'),
('Wireless Mouse', 'MOUSE001', 29.99, 50, 'Electronics', 10, 3, 'Active'),
('Desk Lamp', 'LAMP001', 49.99, 20, 'Furniture', 5, 2, 'Active'),
('Brake Pads', 'BRK-PAD-004', 250.00, 60, 'Motorcycle Parts', 10, 3, 'Active'),
('Motorcycle Battery', 'BAT-YTX-001', 1850.00, 20, 'Motorcycle Parts', 5, 1, 'Active'),
('LED Headlight Bulb', 'MC-ELC-004', 450.00, 40, 'Motorcycle Parts', 8, 3, 'Active'),
('Engine Oil (10W-40)', 'OIL-10W40-002', 320.00, 100, 'Lubricants', 15, 2, 'Active'),
('Drive Chain', 'CHN-520-003', 620.00, 35, 'Motorcycle Parts', 5, 1, 'Active');

-- Sample Invoices
INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, customer_address, invoice_date, due_date, status, subtotal, tax, total, notes)
VALUES
('INV-1001', 'Atlas Moto Supply', 'sales@atlasmoto.com', '+63 917 555 1234', '123 M.C. Briones St, Cebu City, Philippines', '2025-11-05', '2025-11-20', 'Pending', 32750, 1638, 34388, 'Thank you for your business! Please settle within 15 days.'),
('INV-0998', 'RideSafe Motors', 'support@ridesafe.ph', '+63 32 222 4488', 'Unit 204, Oakridge Business Park, Mandaue City', '2025-10-24', '2025-11-08', 'Paid', 20240, 1012, 21252, 'Paid via bank transfer on Nov 02, 2025.');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, product_id) VALUES
(1, 'Brake Pads (BRK-PAD-004)', 30, 250, (SELECT Product_id FROM product WHERE Product_sku = 'BRK-PAD-004')),
(1, 'Motorcycle Battery (BAT-YTX-001)', 10, 1850, (SELECT Product_id FROM product WHERE Product_sku = 'BAT-YTX-001')),
(1, 'LED Headlight Bulb', 15, 450, (SELECT Product_id FROM product WHERE Product_name = 'LED Headlight Bulb')),
(2, 'Engine Oil (10W-40)', 40, 320, (SELECT Product_id FROM product WHERE Product_name = 'Engine Oil (10W-40)')),
(2, 'Drive Chain (CHN-520-003)', 12, 620, (SELECT Product_id FROM product WHERE Product_sku = 'CHN-520-003'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_supplier_updated_at BEFORE UPDATE ON supplier
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON orders_from_supplier
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();