/**
 * db-seed-data.js — Sample Database for SQL Training Modules
 *
 * Provides SQL CREATE TABLE + INSERT statements to seed an in-memory
 * SQLite database via sql.js. Used by SQLTerminal.js across all
 * database district modules.
 *
 * Tables: employees, departments, customers, orders, products, order_items
 */

const DB_SEED_SQL = `
-- Departments
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    budget REAL NOT NULL
);

INSERT INTO departments VALUES (1, 'Engineering', 'Building A', 950000);
INSERT INTO departments VALUES (2, 'Marketing', 'Building B', 420000);
INSERT INTO departments VALUES (3, 'Sales', 'Building B', 680000);
INSERT INTO departments VALUES (4, 'Human Resources', 'Building C', 310000);
INSERT INTO departments VALUES (5, 'Finance', 'Building A', 520000);
INSERT INTO departments VALUES (6, 'Operations', 'Building D', 740000);

-- Employees
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    salary REAL NOT NULL,
    hire_date TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id)
);

INSERT INTO employees VALUES (1, 'Sarah', 'Chen', 'schen@meridian.io', 1, 125000, '2019-03-15', NULL);
INSERT INTO employees VALUES (2, 'James', 'Rodriguez', 'jrodriguez@meridian.io', 1, 110000, '2020-01-10', 1);
INSERT INTO employees VALUES (3, 'Aisha', 'Patel', 'apatel@meridian.io', 1, 105000, '2020-06-22', 1);
INSERT INTO employees VALUES (4, 'Marcus', 'Webb', 'mwebb@meridian.io', 2, 85000, '2021-02-14', NULL);
INSERT INTO employees VALUES (5, 'Elena', 'Vasquez', 'evasquez@meridian.io', 2, 78000, '2021-08-01', 4);
INSERT INTO employees VALUES (6, 'David', 'Kim', 'dkim@meridian.io', 3, 92000, '2019-11-30', NULL);
INSERT INTO employees VALUES (7, 'Fatima', 'Al-Hassan', 'falhassan@meridian.io', 3, 88000, '2020-04-18', 6);
INSERT INTO employees VALUES (8, 'Ryan', 'O''Brien', 'robrien@meridian.io', 3, 76000, '2022-01-05', 6);
INSERT INTO employees VALUES (9, 'Priya', 'Sharma', 'psharma@meridian.io', 4, 95000, '2018-09-20', NULL);
INSERT INTO employees VALUES (10, 'Carlos', 'Mendez', 'cmendez@meridian.io', 5, 102000, '2019-07-08', NULL);
INSERT INTO employees VALUES (11, 'Lin', 'Zhang', 'lzhang@meridian.io', 1, 98000, '2021-03-12', 1);
INSERT INTO employees VALUES (12, 'Nadia', 'Okafor', 'nokafor@meridian.io', 6, 89000, '2020-10-25', NULL);
INSERT INTO employees VALUES (13, 'Alex', 'Thompson', 'athompson@meridian.io', 1, 115000, '2019-05-01', 1);
INSERT INTO employees VALUES (14, 'Maria', 'Santos', 'msantos@meridian.io', 3, 82000, '2022-06-15', 6);
INSERT INTO employees VALUES (15, 'Jordan', 'Lee', 'jlee@meridian.io', 5, 91000, '2021-11-08', 10);
INSERT INTO employees VALUES (16, 'Zara', 'Williams', 'zwilliams@meridian.io', 2, 72000, '2023-01-20', 4);
INSERT INTO employees VALUES (17, 'Omar', 'Hassan', 'ohassan@meridian.io', 6, 84000, '2022-03-10', 12);
INSERT INTO employees VALUES (18, 'Yuki', 'Tanaka', 'ytanaka@meridian.io', 1, 108000, '2020-08-14', 1);
INSERT INTO employees VALUES (19, 'Ben', 'Carter', 'bcarter@meridian.io', 4, 68000, '2023-04-01', 9);
INSERT INTO employees VALUES (20, 'Sophie', 'Martin', 'smartin@meridian.io', 6, 78000, '2022-09-18', 12);

-- Customers
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TEXT NOT NULL
);

INSERT INTO customers VALUES (1, 'Nexus Corp', 'orders@nexuscorp.com', 'New York', 'USA', '2022-01-15');
INSERT INTO customers VALUES (2, 'Stellar Systems', 'procurement@stellar.io', 'London', 'UK', '2022-03-22');
INSERT INTO customers VALUES (3, 'Quantum Labs', 'info@quantumlabs.de', 'Berlin', 'Germany', '2022-05-10');
INSERT INTO customers VALUES (4, 'Aurora Digital', 'hello@auroradigital.jp', 'Tokyo', 'Japan', '2022-07-01');
INSERT INTO customers VALUES (5, 'Vanguard Tech', 'sales@vanguardtech.com', 'San Francisco', 'USA', '2022-08-18');
INSERT INTO customers VALUES (6, 'Summit Analytics', 'contact@summit.ca', 'Toronto', 'Canada', '2022-10-05');
INSERT INTO customers VALUES (7, 'Cipher Security', 'orders@cipher.com.au', 'Sydney', 'Australia', '2023-01-12');
INSERT INTO customers VALUES (8, 'Meridian Health', 'procurement@meridianhealth.com', 'Chicago', 'USA', '2023-02-28');

-- Products
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
);

INSERT INTO products VALUES (1, 'CloudShield Pro', 'Security', 299.99, 150);
INSERT INTO products VALUES (2, 'DataVault Enterprise', 'Storage', 549.99, 80);
INSERT INTO products VALUES (3, 'NetMonitor Plus', 'Monitoring', 199.99, 200);
INSERT INTO products VALUES (4, 'CodePipeline CI', 'DevOps', 399.99, 120);
INSERT INTO products VALUES (5, 'AnalyticsEngine', 'Analytics', 449.99, 95);
INSERT INTO products VALUES (6, 'SecureAuth Gateway', 'Security', 349.99, 110);
INSERT INTO products VALUES (7, 'LogStream Collector', 'Monitoring', 179.99, 250);
INSERT INTO products VALUES (8, 'BackupForge', 'Storage', 249.99, 180);
INSERT INTO products VALUES (9, 'APIGateway Pro', 'DevOps', 329.99, 140);
INSERT INTO products VALUES (10, 'ThreatHunter', 'Security', 599.99, 60);

-- Orders
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'shipped', 'delivered', 'cancelled'))
);

INSERT INTO orders VALUES (1, 1, '2023-01-15', 1499.95, 'delivered');
INSERT INTO orders VALUES (2, 2, '2023-01-22', 2749.95, 'delivered');
INSERT INTO orders VALUES (3, 3, '2023-02-10', 599.97, 'delivered');
INSERT INTO orders VALUES (4, 1, '2023-03-05', 899.97, 'delivered');
INSERT INTO orders VALUES (5, 4, '2023-03-18', 1349.97, 'shipped');
INSERT INTO orders VALUES (6, 5, '2023-04-02', 2099.94, 'shipped');
INSERT INTO orders VALUES (7, 2, '2023-04-15', 449.99, 'delivered');
INSERT INTO orders VALUES (8, 6, '2023-05-01', 1599.96, 'shipped');
INSERT INTO orders VALUES (9, 3, '2023-05-20', 929.97, 'pending');
INSERT INTO orders VALUES (10, 7, '2023-06-08', 3599.94, 'pending');
INSERT INTO orders VALUES (11, 8, '2023-06-15', 749.98, 'pending');
INSERT INTO orders VALUES (12, 1, '2023-06-22', 1199.97, 'cancelled');
INSERT INTO orders VALUES (13, 5, '2023-07-01', 549.99, 'pending');
INSERT INTO orders VALUES (14, 4, '2023-07-10', 1799.94, 'pending');

-- Order Items
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
);

INSERT INTO order_items VALUES (1, 1, 1, 3, 299.99);
INSERT INTO order_items VALUES (2, 1, 3, 3, 199.99);
INSERT INTO order_items VALUES (3, 2, 2, 5, 549.99);
INSERT INTO order_items VALUES (4, 3, 3, 3, 199.99);
INSERT INTO order_items VALUES (5, 4, 6, 1, 349.99);
INSERT INTO order_items VALUES (6, 4, 2, 1, 549.99);
INSERT INTO order_items VALUES (7, 5, 4, 2, 399.99);
INSERT INTO order_items VALUES (8, 5, 2, 1, 549.99);
INSERT INTO order_items VALUES (9, 6, 10, 2, 599.99);
INSERT INTO order_items VALUES (10, 6, 1, 3, 299.99);
INSERT INTO order_items VALUES (11, 7, 5, 1, 449.99);
INSERT INTO order_items VALUES (12, 8, 7, 4, 179.99);
INSERT INTO order_items VALUES (13, 8, 8, 2, 249.99);
INSERT INTO order_items VALUES (14, 8, 9, 1, 329.99);
INSERT INTO order_items VALUES (15, 9, 3, 2, 199.99);
INSERT INTO order_items VALUES (16, 9, 9, 1, 329.99);
INSERT INTO order_items VALUES (17, 9, 7, 1, 179.99);
INSERT INTO order_items VALUES (18, 10, 10, 6, 599.99);
INSERT INTO order_items VALUES (19, 11, 8, 3, 249.99);
INSERT INTO order_items VALUES (20, 12, 4, 3, 399.99);
INSERT INTO order_items VALUES (21, 13, 2, 1, 549.99);
INSERT INTO order_items VALUES (22, 14, 6, 3, 349.99);
INSERT INTO order_items VALUES (23, 14, 1, 2, 299.99);
`;
