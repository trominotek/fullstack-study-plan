# Week 2 Practice Exercises

## Day 1-2 Exercises: PostgreSQL & Docker

### Exercise 1: Basic Setup (Required)
**Goal**: Get PostgreSQL running in Docker

**Tasks**:
1. Create `docker-compose.yml` with PostgreSQL configuration
2. Start PostgreSQL container
3. Connect using `psql` command line tool
4. Create a sample table and insert data
5. Verify data persists after container restart

**Success Criteria**:
- [ ] PostgreSQL container starts successfully
- [ ] Can connect via psql
- [ ] Can create tables and insert data
- [ ] Data survives container restart

### Exercise 2: Database Client Setup (Recommended)
**Goal**: Set up database management tools

**Tasks**:
1. Add pgAdmin to your docker-compose.yml
2. Access pgAdmin web interface at localhost:8080
3. Connect pgAdmin to your PostgreSQL instance
4. Create tables using pgAdmin GUI
5. Compare with command-line operations

**Success Criteria**:
- [ ] pgAdmin accessible in browser
- [ ] Successfully connected to PostgreSQL
- [ ] Can perform operations via GUI

### Exercise 3: Database Design (Challenge)
**Goal**: Design a complete schema

**Tasks**:
1. Design tables for an e-commerce system:
   - users (id, username, email, password_hash, created_at)
   - categories (id, name, description)
   - products (id, name, description, price, category_id, created_at)
   - orders (id, user_id, total, status, created_at)
   - order_items (id, order_id, product_id, quantity, price)
2. Create all tables with proper constraints
3. Insert sample data for testing
4. Write queries to test relationships

**Success Criteria**:
- [ ] All tables created with foreign keys
- [ ] Sample data inserted
- [ ] Can query across relationships

---

## Day 3-4 Exercises: Python Database Libraries

### Exercise 4: psycopg2 Implementation (Required)
**Goal**: Connect to PostgreSQL using raw psycopg2

**Tasks**:
1. Create a Python class to manage database connections
2. Implement CRUD operations for items table
3. Add proper error handling and connection management
4. Create a simple CLI to test operations

**Example Structure**:
```python
class DatabaseManager:
    def __init__(self, connection_params):
        pass
    
    def create_item(self, name, description):
        pass
    
    def get_all_items(self):
        pass
    
    def get_item_by_id(self, item_id):
        pass
    
    def update_item(self, item_id, name, description):
        pass
    
    def delete_item(self, item_id):
        pass
```

**Success Criteria**:
- [ ] All CRUD operations working
- [ ] Proper error handling
- [ ] Connection cleanup

### Exercise 5: SQLAlchemy Core (Recommended)
**Goal**: Implement same operations using SQLAlchemy Core

**Tasks**:
1. Define table structure using SQLAlchemy Core
2. Implement same CRUD operations
3. Compare performance with psycopg2
4. Add query building for complex operations

**Success Criteria**:
- [ ] Core implementation complete
- [ ] Same functionality as psycopg2
- [ ] Performance comparison documented

### Exercise 6: SQLAlchemy ORM (Required)
**Goal**: Create models and use ORM patterns

**Tasks**:
1. Define Item model with SQLAlchemy ORM
2. Implement repository pattern
3. Add model validation
4. Create relationships with User model

**Success Criteria**:
- [ ] Models defined correctly
- [ ] Repository pattern implemented
- [ ] Validation working
- [ ] Relationships functional

---

## Day 5-6 Exercises: SQL & ORM Mapping

### Exercise 7: Complex Queries (Required)
**Goal**: Master advanced SQL operations

**Tasks**:
1. Write SQL queries for:
   - Find users with most orders
   - Calculate monthly revenue
   - Find products never ordered
   - Get category sales statistics
2. Implement same queries using SQLAlchemy ORM
3. Compare SQL vs ORM approaches

**Example Queries**:
```sql
-- Monthly revenue
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(total) as revenue
FROM orders 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Users with most orders
SELECT 
    u.username, 
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
ORDER BY order_count DESC
LIMIT 10;
```

**Success Criteria**:
- [ ] All queries working in SQL
- [ ] ORM equivalents implemented
- [ ] Performance comparison done

### Exercise 8: Database Optimization (Challenge)
**Goal**: Optimize database performance

**Tasks**:
1. Create indexes for common queries
2. Analyze query performance using EXPLAIN
3. Implement connection pooling
4. Add query caching
5. Benchmark before/after performance

**Success Criteria**:
- [ ] Indexes created appropriately
- [ ] Query plans analyzed
- [ ] Performance improvements measured

### Exercise 9: Data Modeling (Required)
**Goal**: Design complex relationships

**Tasks**:
1. Extend your e-commerce schema:
   - Add product variants (size, color)
   - Add shopping cart functionality
   - Add product reviews
   - Add inventory tracking
2. Implement models with all relationship types
3. Create migration scripts

**Success Criteria**:
- [ ] Complex schema designed
- [ ] All relationship types used
- [ ] Migrations working

---

## Day 7 Exercises: Flask Integration

### Exercise 10: Flask-SQLAlchemy Setup (Required)
**Goal**: Integrate database with your Flask app

**Tasks**:
1. Refactor your existing Flask app to use PostgreSQL
2. Replace in-memory data with database operations
3. Add proper error handling
4. Implement health check endpoint

**Success Criteria**:
- [ ] Flask app uses PostgreSQL
- [ ] All endpoints working
- [ ] Error handling in place
- [ ] Health checks implemented

### Exercise 11: API Enhancement (Recommended)
**Goal**: Add advanced API features

**Tasks**:
1. Add pagination to GET /items endpoint
2. Implement search and filtering
3. Add sorting options
4. Create bulk operations endpoint

**Example API Enhancements**:
```python
@app.route('/items')
def get_items():
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Search
    search = request.args.get('search', '')
    
    # Sorting
    sort_by = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')
    
    # Build query
    query = Item.query
    
    if search:
        query = query.filter(Item.name.ilike(f'%{search}%'))
    
    # Apply sorting and pagination
    # Return paginated results
```

**Success Criteria**:
- [ ] Pagination implemented
- [ ] Search functionality working
- [ ] Sorting options available
- [ ] Bulk operations endpoint

### Exercise 12: Testing & Validation (Challenge)
**Goal**: Add comprehensive testing

**Tasks**:
1. Create unit tests for all database operations
2. Add integration tests for API endpoints
3. Implement input validation
4. Add request/response logging

**Success Criteria**:
- [ ] Unit tests covering all CRUD operations
- [ ] Integration tests for all endpoints
- [ ] Input validation working
- [ ] Logging implemented

---

## Bonus Exercises (Advanced)

### Exercise 13: Database Migrations
**Goal**: Master database schema changes

**Tasks**:
1. Create migration to add new columns
2. Implement data migration script
3. Test rollback functionality
4. Create migration for index addition

### Exercise 14: Performance Monitoring
**Goal**: Monitor database performance

**Tasks**:
1. Add query performance logging
2. Implement connection pool monitoring
3. Create performance metrics endpoint
4. Add slow query detection

### Exercise 15: Full Integration Test
**Goal**: Test complete full-stack flow

**Tasks**:
1. Create end-to-end test that:
   - Creates item via Angular frontend
   - Verifies data in PostgreSQL
   - Updates item through API
   - Deletes item and confirms removal
2. Test with multiple users simultaneously
3. Verify data consistency

---

## Self-Assessment Checklist

### Day 1-2 Competencies:
- [ ] Can start PostgreSQL in Docker
- [ ] Can connect using multiple client tools
- [ ] Can create tables and insert data
- [ ] Understands data persistence vs temporary storage

### Day 3-4 Competencies:
- [ ] Can use psycopg2 for database operations
- [ ] Understands SQLAlchemy Core vs ORM
- [ ] Can implement repository pattern
- [ ] Can handle database errors properly

### Day 5-6 Competencies:
- [ ] Can write complex SQL queries
- [ ] Understands joins and relationships
- [ ] Can optimize queries with indexes
- [ ] Can model complex business domains

### Day 7 Competencies:
- [ ] Can integrate PostgreSQL with Flask
- [ ] Can handle database errors in web context
- [ ] Can implement proper API patterns
- [ ] Can test database operations

## Troubleshooting Common Issues

### PostgreSQL Won't Start:
```bash
# Check if port is in use
lsof -i :5432

# Check Docker logs
docker-compose logs postgres

# Reset data volume if needed
docker-compose down -v
docker-compose up -d
```

### Connection Refused:
```python
# Test connection parameters
import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='fullstack_db',
        user='fullstack_user',
        password='fullstack_pass'
    )
    print("Connection successful")
except Exception as e:
    print(f"Connection failed: {e}")
```

### SQLAlchemy Errors:
```python
# Enable SQL logging
app.config['SQLALCHEMY_ECHO'] = True

# Check model definitions
from sqlalchemy import inspect
inspector = inspect(db.engine)
print(inspector.get_table_names())
```

### Migration Issues:
```bash
# Reset migrations
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Resources for Further Learning

### Documentation:
- PostgreSQL Official Docs
- SQLAlchemy Documentation  
- Flask-SQLAlchemy Guide
- psycopg2 Documentation

### Practice Databases:
- Sakila (Movie rental)
- Northwind (Orders/Products)
- Chinook (Music store)

### Online Practice:
- SQLBolt (Interactive SQL Tutorial)
- HackerRank SQL Challenges
- LeetCode Database Problems

## Week 2 Summary

By completing these exercises, you will have:
- ✅ **Database Infrastructure**: PostgreSQL running in Docker
- ✅ **Python Integration**: Multiple ways to connect Python to PostgreSQL
- ✅ **SQL Mastery**: Complex queries and database design
- ✅ **ORM Understanding**: Object-relational mapping concepts
- ✅ **Flask Integration**: Full-stack app with persistent database
- ✅ **Production Readiness**: Error handling, logging, testing

**Next**: Week 3 will cover authentication, advanced relationships, and deployment strategies!