-- ABUAD Farms Database Fix Script
-- Run this in pgAdmin or PostgreSQL

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with correct structure
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Verify products table has featured products
UPDATE products SET featured = true WHERE id IN (1, 2, 3, 4, 5);

-- Check if products exist
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as featured_products FROM products WHERE featured = true;

-- Show sample products
SELECT id, name, price, featured FROM products LIMIT 10;