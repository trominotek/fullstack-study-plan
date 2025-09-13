# DVD Rental Database - DDL & DML Lesson Plan

## Overview
This lesson plan uses the DVD Rental sample database to teach DDL (Data Definition Language) and DML (Data Manipulation Language) concepts through practical exercises.

## Database Schema Overview
The DVD Rental database contains 15 tables representing a movie rental business:

- **actor** - Movie actors
- **film** - Movie information
- **film_actor** - Many-to-many relationship between films and actors
- **category** - Film categories (genres)
- **film_category** - Many-to-many relationship between films and categories
- **store** - Rental store locations
- **inventory** - Available film copies at each store
- **customer** - Store customers
- **rental** - Rental transactions
- **payment** - Payment records
- **staff** - Store employees
- **address** - Address information
- **city** - City names
- **country** - Country names
- **language** - Film languages

## Lesson 1: Exploring the Database Structure (DDL Basics)

### Learning Objectives:
- Understand database schema structure
- Learn to examine table definitions
- Practice reading DDL statements

### Exercises:

#### 1.1 Examine Database Structure
```sql
-- List all tables in the database
\dt

-- Alternative using system catalog
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### 1.2 Examine Table Structures
```sql
-- Describe the customer table structure
\d customer

-- Using INFORMATION_SCHEMA (more detailed)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'customer' 
ORDER BY ordinal_position;
```

#### 1.3 View Table Creation Statements
```sql
-- Get the CREATE TABLE statement for film table
SELECT pg_get_tabledef('film'::regclass);

-- Alternative: Examine constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'film';
```

#### 1.4 Examine Relationships
```sql
-- Find foreign key relationships
SELECT
    kcu.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.constraint_column_usage ccu
    ON kcu.constraint_name = ccu.constraint_name
JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.table_name, kcu.column_name;
```

## Lesson 2: Advanced DDL Operations

### Learning Objectives:
- Create new tables with proper constraints
- Modify existing table structures
- Understand indexes and their impact

### Exercises:

#### 2.1 Create a New Table (Practice DDL)
```sql
-- Create a new table for film reviews
CREATE TABLE film_review (
    review_id SERIAL PRIMARY KEY,
    film_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    CONSTRAINT fk_film_review_film 
        FOREIGN KEY (film_id) REFERENCES film(film_id) ON DELETE CASCADE,
    CONSTRAINT fk_film_review_customer 
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate reviews
    CONSTRAINT uk_film_customer_review UNIQUE (film_id, customer_id)
);

-- Add indexes for better performance
CREATE INDEX idx_film_review_film_id ON film_review(film_id);
CREATE INDEX idx_film_review_customer_id ON film_review(customer_id);
CREATE INDEX idx_film_review_date ON film_review(review_date);
```

#### 2.2 Modify Existing Tables
```sql
-- Add a new column to the film table
ALTER TABLE film ADD COLUMN budget DECIMAL(12,2);
ALTER TABLE film ADD COLUMN box_office DECIMAL(12,2);

-- Add a check constraint
ALTER TABLE film ADD CONSTRAINT chk_positive_budget 
    CHECK (budget IS NULL OR budget > 0);

-- Add a computed column for profit (PostgreSQL 12+)
ALTER TABLE film ADD COLUMN profit DECIMAL(12,2) 
    GENERATED ALWAYS AS (box_office - budget) STORED;

-- Create an enum type for film status
CREATE TYPE film_status AS ENUM ('draft', 'released', 'discontinued');
ALTER TABLE film ADD COLUMN status film_status DEFAULT 'released';
```

#### 2.3 Create Views
```sql
-- Create a view for film details with category and language
CREATE VIEW film_details AS
SELECT 
    f.film_id,
    f.title,
    f.description,
    f.release_year,
    f.rental_duration,
    f.rental_rate,
    f.length,
    f.rating,
    l.name AS language,
    c.name AS category
FROM film f
JOIN language l ON f.language_id = l.language_id
LEFT JOIN film_category fc ON f.film_id = fc.film_id
LEFT JOIN category c ON fc.category_id = c.category_id;

-- Create a materialized view for performance-heavy queries
CREATE MATERIALIZED VIEW rental_summary AS
SELECT 
    f.film_id,
    f.title,
    COUNT(r.rental_id) as total_rentals,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as avg_rental_price,
    MAX(r.rental_date) as last_rental_date
FROM film f
LEFT JOIN inventory i ON f.film_id = i.film_id
LEFT JOIN rental r ON i.inventory_id = r.inventory_id
LEFT JOIN payment p ON r.rental_id = p.rental_id
GROUP BY f.film_id, f.title;

-- Create index on materialized view
CREATE INDEX idx_rental_summary_total_rentals 
    ON rental_summary(total_rentals DESC);
```

## Lesson 3: Basic DML Operations

### Learning Objectives:
- Master SELECT statements with various conditions
- Practice INSERT, UPDATE, and DELETE operations
- Understand transaction concepts

### Exercises:

#### 3.1 Basic SELECT Operations
```sql
-- Simple SELECT with conditions
SELECT first_name, last_name, email
FROM customer
WHERE active = 1
ORDER BY last_name, first_name;

-- SELECT with pattern matching
SELECT title, description, rental_rate
FROM film
WHERE title ILIKE '%love%'
   OR description ILIKE '%love%'
ORDER BY rental_rate DESC;

-- SELECT with date operations
SELECT customer_id, rental_date, return_date,
       return_date - rental_date AS rental_duration
FROM rental
WHERE rental_date >= '2005-07-01'
  AND rental_date < '2005-08-01'
ORDER BY rental_duration DESC;
```

#### 3.2 Aggregate Functions
```sql
-- Basic aggregations
SELECT 
    COUNT(*) as total_films,
    AVG(rental_rate) as avg_rental_rate,
    MIN(rental_rate) as min_rental_rate,
    MAX(rental_rate) as max_rental_rate,
    SUM(length) as total_minutes
FROM film;

-- GROUP BY operations
SELECT 
    rating,
    COUNT(*) as film_count,
    AVG(rental_rate) as avg_rate,
    AVG(length) as avg_length
FROM film
GROUP BY rating
ORDER BY avg_rate DESC;

-- HAVING clause
SELECT 
    c.name as category,
    COUNT(*) as film_count,
    AVG(f.rental_rate) as avg_rental_rate
FROM film f
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
GROUP BY c.name
HAVING COUNT(*) >= 50
ORDER BY avg_rental_rate DESC;
```

#### 3.3 JOIN Operations
```sql
-- INNER JOIN: Customers with their rentals
SELECT 
    c.first_name,
    c.last_name,
    f.title,
    r.rental_date,
    r.return_date
FROM customer c
INNER JOIN rental r ON c.customer_id = r.customer_id
INNER JOIN inventory i ON r.inventory_id = i.inventory_id
INNER JOIN film f ON i.film_id = f.film_id
ORDER BY r.rental_date DESC
LIMIT 20;

-- LEFT JOIN: All customers with rental counts
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(r.rental_id) as rental_count,
    COALESCE(SUM(p.amount), 0) as total_spent
FROM customer c
LEFT JOIN rental r ON c.customer_id = r.customer_id
LEFT JOIN payment p ON r.rental_id = p.rental_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY rental_count DESC;

-- Multiple JOINs: Film details with actors
SELECT 
    f.title,
    f.release_year,
    STRING_AGG(a.first_name || ' ' || a.last_name, ', ') as actors,
    c.name as category
FROM film f
JOIN film_actor fa ON f.film_id = fa.film_id
JOIN actor a ON fa.actor_id = a.actor_id
LEFT JOIN film_category fc ON f.film_id = fc.film_id
LEFT JOIN category c ON fc.category_id = c.category_id
GROUP BY f.film_id, f.title, f.release_year, c.name
ORDER BY f.title;
```

## Lesson 4: Advanced DML Operations

### Learning Objectives:
- Practice complex queries with subqueries
- Use window functions
- Understand CTEs (Common Table Expressions)

### Exercises:

#### 4.1 Subqueries
```sql
-- Films that have never been rented
SELECT film_id, title, release_year
FROM film
WHERE film_id NOT IN (
    SELECT DISTINCT i.film_id
    FROM inventory i
    JOIN rental r ON i.inventory_id = r.inventory_id
);

-- Customers who spent more than average
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    customer_total.total_spent
FROM customer c
JOIN (
    SELECT 
        customer_id,
        SUM(amount) as total_spent
    FROM payment
    GROUP BY customer_id
    HAVING SUM(amount) > (
        SELECT AVG(customer_total.total_spent)
        FROM (
            SELECT customer_id, SUM(amount) as total_spent
            FROM payment
            GROUP BY customer_id
        ) customer_total
    )
) customer_total ON c.customer_id = customer_total.customer_id
ORDER BY customer_total.total_spent DESC;

-- Correlated subquery: Films with above-average rental rates in their category
SELECT f1.title, f1.rental_rate, c.name as category
FROM film f1
JOIN film_category fc1 ON f1.film_id = fc1.film_id
JOIN category c ON fc1.category_id = c.category_id
WHERE f1.rental_rate > (
    SELECT AVG(f2.rental_rate)
    FROM film f2
    JOIN film_category fc2 ON f2.film_id = fc2.film_id
    WHERE fc2.category_id = fc1.category_id
);
```

#### 4.2 Window Functions
```sql
-- Rank films by rental rate within each category
SELECT 
    f.title,
    c.name as category,
    f.rental_rate,
    RANK() OVER (PARTITION BY c.name ORDER BY f.rental_rate DESC) as rate_rank,
    DENSE_RANK() OVER (PARTITION BY c.name ORDER BY f.rental_rate DESC) as dense_rank
FROM film f
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
ORDER BY c.name, rate_rank;

-- Running totals of payments by customer
SELECT 
    customer_id,
    payment_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id 
        ORDER BY payment_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total
FROM payment
WHERE customer_id <= 10
ORDER BY customer_id, payment_date;

-- Moving averages
SELECT 
    rental_date::date,
    COUNT(*) as daily_rentals,
    AVG(COUNT(*)) OVER (
        ORDER BY rental_date::date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as moving_avg_7_days
FROM rental
GROUP BY rental_date::date
ORDER BY rental_date::date;
```

#### 4.3 Common Table Expressions (CTEs)
```sql
-- Recursive CTE: Customer hierarchy (if there was one)
-- First, let's create a more complex example with film sequels
WITH RECURSIVE film_series AS (
    -- Base case: original films (no sequel relationship)
    SELECT 
        film_id,
        title,
        1 as series_position,
        ARRAY[film_id] as series_path
    FROM film
    WHERE title NOT LIKE '%II%' 
      AND title NOT LIKE '%2%'
      AND title NOT LIKE '%Part%'
    
    UNION ALL
    
    -- Recursive case: find sequels
    SELECT 
        f.film_id,
        f.title,
        fs.series_position + 1,
        fs.series_path || f.film_id
    FROM film f
    JOIN film_series fs ON (
        f.title ILIKE '%' || SPLIT_PART(fs.title, ' ', 1) || '%'
        AND f.film_id != fs.film_id
        AND f.film_id != ALL(fs.series_path)
    )
    WHERE fs.series_position < 5 -- Prevent infinite recursion
)
SELECT * FROM film_series ORDER BY series_path, series_position;

-- Multiple CTEs: Complex business analysis
WITH monthly_rentals AS (
    SELECT 
        DATE_TRUNC('month', rental_date) as rental_month,
        COUNT(*) as total_rentals,
        COUNT(DISTINCT customer_id) as unique_customers
    FROM rental
    GROUP BY DATE_TRUNC('month', rental_date)
),
monthly_revenue AS (
    SELECT 
        DATE_TRUNC('month', payment_date) as payment_month,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_payment
    FROM payment
    GROUP BY DATE_TRUNC('month', payment_date)
)
SELECT 
    mr.rental_month,
    mr.total_rentals,
    mr.unique_customers,
    rev.total_revenue,
    rev.avg_payment,
    rev.total_revenue / mr.total_rentals as revenue_per_rental
FROM monthly_rentals mr
JOIN monthly_revenue rev ON mr.rental_month = rev.payment_month
ORDER BY mr.rental_month;
```

## Lesson 5: Data Modification (INSERT, UPDATE, DELETE)

### Learning Objectives:
- Practice inserting new records
- Update existing data safely
- Delete records with proper constraints
- Understand transactions and rollback

### Exercises:

#### 5.1 INSERT Operations
```sql
-- Insert new customers
INSERT INTO customer (store_id, first_name, last_name, email, address_id, create_date)
VALUES 
    (1, 'John', 'Doe', 'john.doe@email.com', 1, CURRENT_TIMESTAMP),
    (2, 'Jane', 'Smith', 'jane.smith@email.com', 2, CURRENT_TIMESTAMP);

-- Insert with SELECT (copy data)
INSERT INTO film_review (film_id, customer_id, rating, review_text)
SELECT 
    f.film_id,
    c.customer_id,
    4, -- Default good rating
    'Great movie, highly recommend!'
FROM film f
CROSS JOIN customer c
WHERE f.title ILIKE '%action%'
  AND c.customer_id <= 5
  AND NOT EXISTS (
      SELECT 1 FROM film_review fr 
      WHERE fr.film_id = f.film_id 
        AND fr.customer_id = c.customer_id
  );

-- Insert with ON CONFLICT (UPSERT)
INSERT INTO film_review (film_id, customer_id, rating, review_text)
VALUES (1, 1, 5, 'Amazing film!')
ON CONFLICT (film_id, customer_id) 
DO UPDATE SET 
    rating = EXCLUDED.rating,
    review_text = EXCLUDED.review_text,
    review_date = CURRENT_TIMESTAMP;
```

#### 5.2 UPDATE Operations
```sql
-- Simple update
UPDATE film 
SET rental_rate = rental_rate * 1.1 
WHERE rating = 'G';

-- Update with JOIN (PostgreSQL syntax)
UPDATE film 
SET rental_rate = rental_rate * 1.05
FROM film_category fc
JOIN category c ON fc.category_id = c.category_id
WHERE film.film_id = fc.film_id 
  AND c.name = 'Comedy';

-- Conditional update with CASE
UPDATE customer
SET active = CASE 
    WHEN last_update < CURRENT_DATE - INTERVAL '2 years' THEN 0
    WHEN last_update < CURRENT_DATE - INTERVAL '1 year' THEN 0
    ELSE active
END;

-- Update from subquery
UPDATE film
SET rental_rate = popular_films.new_rate
FROM (
    SELECT 
        f.film_id,
        f.rental_rate * 1.2 as new_rate
    FROM film f
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    GROUP BY f.film_id, f.rental_rate
    HAVING COUNT(r.rental_id) > 20
) popular_films
WHERE film.film_id = popular_films.film_id;
```

#### 5.3 DELETE Operations
```sql
-- Simple delete with condition
DELETE FROM film_review 
WHERE rating <= 2 AND is_published = FALSE;

-- Delete with subquery
DELETE FROM rental 
WHERE rental_id IN (
    SELECT r.rental_id
    FROM rental r
    JOIN customer c ON r.customer_id = c.customer_id
    WHERE c.active = 0 
      AND r.rental_date < CURRENT_DATE - INTERVAL '1 year'
);

-- Delete with JOIN
DELETE r FROM rental r
JOIN customer c ON r.customer_id = c.customer_id
WHERE c.active = 0;
```

## Lesson 6: Advanced Topics and Performance

### Learning Objectives:
- Understand indexes and their impact
- Practice query optimization
- Use EXPLAIN to analyze query performance

### Exercises:

#### 6.1 Index Analysis and Creation
```sql
-- Analyze current indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Create composite indexes for common queries
CREATE INDEX idx_rental_customer_date 
    ON rental (customer_id, rental_date);

CREATE INDEX idx_film_category_rating 
    ON film (rating) 
    INCLUDE (film_id, title, rental_rate);

-- Partial index for active customers
CREATE INDEX idx_active_customers 
    ON customer (customer_id) 
    WHERE active = 1;
```

#### 6.2 Query Performance Analysis
```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    c.first_name,
    c.last_name,
    COUNT(r.rental_id) as rental_count
FROM customer c
LEFT JOIN rental r ON c.customer_id = r.customer_id
WHERE c.active = 1
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(r.rental_id) > 10
ORDER BY rental_count DESC;

-- Compare query performance before and after index
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM rental r
JOIN customer c ON r.customer_id = c.customer_id
WHERE r.rental_date BETWEEN '2005-07-01' AND '2005-07-31'
  AND c.active = 1;
```

## Practice Assignments

### Assignment 1: Schema Design
Create a new table structure for a movie rating system that includes:
- User ratings (1-10 scale)
- Written reviews
- Helpful/unhelpful votes on reviews
- Review moderation status

### Assignment 2: Complex Queries
Write queries to find:
1. Top 10 most profitable films (by rental revenue)
2. Customers who haven't rented anything in the last 3 months
3. Films that are available in all stores
4. Peak rental hours by day of week

### Assignment 3: Data Analysis
Create a comprehensive report showing:
1. Monthly revenue trends
2. Customer lifetime value analysis
3. Film category performance analysis
4. Staff productivity metrics

### Assignment 4: Performance Optimization
1. Find the 5 slowest queries in your practice session
2. Optimize them using indexes and query rewriting
3. Measure the performance improvement

## Assessment Criteria

### DDL Mastery:
- [ ] Can read and understand table structures
- [ ] Can create tables with appropriate constraints
- [ ] Understands foreign key relationships
- [ ] Can modify table structures safely
- [ ] Knows when and how to create indexes

### DML Mastery:
- [ ] Writes efficient SELECT statements
- [ ] Uses JOINs appropriately
- [ ] Understands subqueries and CTEs
- [ ] Can perform complex data modifications
- [ ] Uses window functions effectively

### Performance Understanding:
- [ ] Can analyze query execution plans
- [ ] Knows how to optimize slow queries
- [ ] Understands index usage and design
- [ ] Considers data integrity in modifications

## Resources for Further Learning

### Documentation:
- PostgreSQL Official Documentation
- SQL Standards and Best Practices
- Database Design Principles

### Practice Databases:
- Sakila (MySQL equivalent of DVD Rental)
- Northwind (Classic business database)
- Chinook (Music store database)

### Advanced Topics to Explore:
- Stored procedures and functions
- Triggers and event handling
- Database security and user management
- Backup and recovery procedures
- Database partitioning and sharding

This lesson plan provides a structured approach to learning DDL and DML using real-world scenarios with the DVD Rental database. Each lesson builds upon the previous one, gradually increasing in complexity while maintaining practical relevance.