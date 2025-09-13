# Week 2 Troubleshooting Guide

## Common Issues and Solutions

### PostgreSQL & Docker Issues

#### Issue 1: PostgreSQL Container Won't Start
**Symptoms**:
- `docker-compose up` fails
- "Address already in use" error
- Container exits immediately

**Diagnosis**:
```bash
# Check if port 5432 is in use
lsof -i :5432
sudo lsof -i :5432

# Check Docker logs
docker-compose logs postgres

# Check container status
docker-compose ps
```

**Solutions**:
```bash
# Solution 1: Kill existing PostgreSQL process
sudo pkill -f postgres

# Solution 2: Use different port in docker-compose.yml
services:
  postgres:
    ports:
      - "5433:5432"  # Use 5433 on host

# Solution 3: Stop system PostgreSQL (macOS)
brew services stop postgresql

# Solution 4: Reset Docker state
docker-compose down -v
docker system prune
docker-compose up -d
```

#### Issue 2: Permission Denied on Database Files
**Symptoms**:
- "permission denied for directory" errors
- PostgreSQL fails to create data directory

**Solutions**:
```bash
# Fix volume permissions
docker-compose down
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d

# Alternative: Specify user in docker-compose.yml
services:
  postgres:
    user: "1000:1000"  # Use your user ID
    # ... rest of config
```

#### Issue 3: Can't Connect to PostgreSQL
**Symptoms**:
- "Connection refused" errors
- psql can't connect

**Diagnosis**:
```bash
# Test network connectivity
telnet localhost 5432

# Check if container is running
docker ps | grep postgres

# Check container logs
docker logs fullstack-postgres
```

**Solutions**:
```bash
# Solution 1: Wait for full startup
sleep 30  # PostgreSQL needs time to initialize

# Solution 2: Check connection parameters
export PGPASSWORD=fullstack_pass
psql -h localhost -p 5432 -U fullstack_user -d fullstack_db

# Solution 3: Restart container
docker-compose restart postgres
```

---

### Python Connection Issues

#### Issue 4: psycopg2 Installation Fails
**Symptoms**:
- "pg_config executable not found" 
- "Microsoft Visual C++ is required" (Windows)

**Solutions**:
```bash
# macOS: Install PostgreSQL client tools
brew install postgresql

# Ubuntu/Debian: Install dev packages
sudo apt-get install libpq-dev python3-dev

# Use binary version (easier)
pip install psycopg2-binary

# Create requirements.txt with correct version
echo "psycopg2-binary==2.9.6" >> requirements.txt
pip install -r requirements.txt
```

#### Issue 5: Import Errors with SQLAlchemy
**Symptoms**:
- "No module named 'sqlalchemy'" 
- Version compatibility issues

**Solutions**:
```bash
# Check Python environment
which python
pip list | grep -i sql

# Install correct versions
pip install SQLAlchemy==2.0.15
pip install Flask-SQLAlchemy==3.0.5

# Check version compatibility
python -c "import sqlalchemy; print(sqlalchemy.__version__)"
```

#### Issue 6: Connection Pool Exhausted
**Symptoms**:
- "QueuePool limit exceeded"
- "Connection pool is full"

**Solutions**:
```python
# config.py - Increase pool settings
class Config:
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,      # Increase pool size
        'max_overflow': 30,   # Allow overflow connections
        'pool_timeout': 30,   # Increase timeout
        'pool_recycle': 1800, # Recycle connections
        'pool_pre_ping': True # Test connections
    }

# Proper session handling
from contextlib import contextmanager

@contextmanager
def get_db_session():
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()  # Always close!
```

---

### SQLAlchemy Issues

#### Issue 7: Table Not Found Errors
**Symptoms**:
- "relation 'items' does not exist"
- "no such table: items"

**Diagnosis**:
```python
# Check if tables exist
from sqlalchemy import inspect
inspector = inspect(db.engine)
print("Tables:", inspector.get_table_names())

# Check database connection
db.session.execute('SELECT current_database()').scalar()
```

**Solutions**:
```python
# Solution 1: Create tables manually
with app.app_context():
    db.create_all()

# Solution 2: Use migrations
flask db init
flask db migrate -m "Create tables"
flask db upgrade

# Solution 3: Check model definitions
class Item(db.Model):
    __tablename__ = 'items'  # Explicit table name
    # ... columns
```

#### Issue 8: Foreign Key Constraint Errors
**Symptoms**:
- "violates foreign key constraint"
- "FOREIGN KEY constraint failed"

**Solutions**:
```python
# Check foreign key relationships
class Item(db.Model):
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    
    # Ensure referenced table exists
    category = db.relationship('Category', back_populates='items')

# Create referenced records first
category = Category(name='Electronics')
db.session.add(category)
db.session.flush()  # Get the ID

item = Item(name='Laptop', category_id=category.id)
db.session.add(item)
db.session.commit()

# Use cascade deletes properly
class Category(db.Model):
    items = db.relationship('Item', cascade='all, delete-orphan')
```

#### Issue 9: Migration Conflicts
**Symptoms**:
- "revision not found"
- "multiple heads" in migrations

**Solutions**:
```bash
# Check migration status
flask db current
flask db history

# Merge multiple heads
flask db merge -m "merge heads"

# Reset migrations (nuclear option)
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

### Flask Integration Issues

#### Issue 10: Circular Imports
**Symptoms**:
- "ImportError: cannot import name" 
- "partially initialized module"

**Solutions**:
```python
# models/__init__.py
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# Import models AFTER db definition
from .item import Item
from .user import User

# app.py
from models import db, Item, User

def create_app():
    app = Flask(__name__)
    db.init_app(app)  # Initialize after app creation
    return app
```

#### Issue 11: Application Context Errors
**Symptoms**:
- "Working outside of application context"
- "RuntimeError: application context"

**Solutions**:
```python
# Always use app context for DB operations
with app.app_context():
    db.create_all()
    items = Item.query.all()

# In routes, context is automatic
@app.route('/items')
def get_items():
    items = Item.query.all()  # Context available
    return jsonify([item.to_dict() for item in items])

# For background tasks
def background_task():
    with app.app_context():
        # Database operations here
        pass
```

#### Issue 12: JSON Serialization Errors
**Symptoms**:
- "Object of type datetime is not JSON serializable"
- "TypeError: Object is not JSON serializable"

**Solutions**:
```python
# Add to_dict method to models
from datetime import datetime

class Item(db.Model):
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Use in routes
@app.route('/items')
def get_items():
    items = Item.query.all()
    return jsonify([item.to_dict() for item in items])
```

---

### Performance Issues

#### Issue 13: Slow Query Performance
**Symptoms**:
- API responses taking seconds
- Database CPU usage high

**Diagnosis**:
```sql
-- Enable query logging (PostgreSQL)
SHOW log_statement;
SET log_statement = 'all';

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;

-- Analyze specific query
EXPLAIN ANALYZE SELECT * FROM items WHERE name LIKE '%test%';
```

**Solutions**:
```python
# Add indexes
class Item(db.Model):
    name = db.Column(db.String(255), index=True)  # Simple index
    
    __table_args__ = (
        db.Index('idx_name_description', 'name', 'description'),  # Composite index
    )

# Optimize queries
# Bad: N+1 query problem
for item in Item.query.all():
    print(item.category.name)  # Separate query for each item

# Good: Eager loading
items = Item.query.options(db.joinedload(Item.category)).all()
for item in items:
    print(item.category.name)  # No additional queries

# Use pagination
items = Item.query.paginate(page=1, per_page=20)
```

#### Issue 14: Memory Usage Growing
**Symptoms**:
- Python process memory keeps growing
- "Out of memory" errors

**Solutions**:
```python
# Close sessions properly
@contextmanager
def get_db_session():
    session = Session()
    try:
        yield session
    finally:
        session.expunge_all()  # Remove all objects
        session.close()

# Use bulk operations for large data
def bulk_insert_items(items_data):
    db.session.bulk_insert_mappings(Item, items_data)
    db.session.commit()

# Clear session periodically
if len(db.session.identity_map) > 1000:
    db.session.expunge_all()
```

---

### Development Environment Issues

#### Issue 15: Docker Compose Not Working
**Symptoms**:
- "docker-compose command not found"
- "unsupported Compose file version"

**Solutions**:
```bash
# Install docker-compose
# macOS
brew install docker-compose

# Check version compatibility
docker-compose --version
docker --version

# Use newer syntax if needed (docker-compose.yml)
version: '3.8'  # Change to supported version

# Alternative: Use docker compose (newer syntax)
docker compose up -d
```

#### Issue 16: Environment Variables Not Loading
**Symptoms**:
- Config values showing as None
- "KeyError" for environment variables

**Solutions**:
```python
# Check .env file exists and is readable
import os
from dotenv import load_dotenv

load_dotenv()
print("DATABASE_URL:", os.getenv('DATABASE_URL'))

# Use explicit path if needed
load_dotenv('.env')

# Provide defaults
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/defaultdb')

# Debug environment loading
import os
print("All env vars:", dict(os.environ))
```

---

### Testing Issues

#### Issue 17: Tests Interfering with Development Data
**Symptoms**:
- Test data appearing in development database
- Development data being deleted by tests

**Solutions**:
```python
# Use separate test database
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # In-memory DB

# Set up test database
def setUp(self):
    self.app = create_app('testing')
    self.app_context = self.app.app_context()
    self.app_context.push()
    db.create_all()

def tearDown(self):
    db.session.remove()
    db.drop_all()
    self.app_context.pop()
```

#### Issue 18: Database State Persisting Between Tests
**Symptoms**:
- Tests passing individually but failing when run together
- Unexpected data in tests

**Solutions**:
```python
# Use transactions and rollback
class DatabaseTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        db.create_all()
        
        # Start transaction
        self.connection = db.engine.connect()
        self.transaction = self.connection.begin()
        
        # Use transaction-bound session
        db.session = db.create_scoped_session(
            options={'bind': self.connection, 'binds': {}}
        )
    
    def tearDown(self):
        db.session.remove()
        self.transaction.rollback()
        self.connection.close()
        db.drop_all()
        self.app_context.pop()
```

---

## Debugging Strategies

### General Debugging Steps:
1. **Check Logs**: Always start with application and database logs
2. **Test Connection**: Verify basic connectivity before complex operations
3. **Isolate Problem**: Test individual components separately
4. **Enable Debug Mode**: Use SQLAlchemy echo and Flask debug mode
5. **Check Dependencies**: Verify all packages are installed and compatible

### Useful Debug Commands:
```bash
# PostgreSQL logs
docker logs fullstack-postgres

# Flask with debug output
FLASK_DEBUG=1 python app.py

# SQLAlchemy query logging
export SQLALCHEMY_ECHO=1

# Python environment debugging
python -c "import sys; print('\n'.join(sys.path))"
pip list
which python
```

### Debug Configuration:
```python
# config.py
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log all SQL queries
    SQLALCHEMY_RECORD_QUERIES = True
    
    # Add request/response logging
    import logging
    logging.basicConfig(level=logging.DEBUG)
```

## Prevention Best Practices

1. **Use Virtual Environments**: Always isolate Python dependencies
2. **Version Pin Dependencies**: Specify exact versions in requirements.txt
3. **Error Handling**: Implement comprehensive error handling
4. **Session Management**: Always close database sessions
5. **Testing**: Write tests before implementing features
6. **Documentation**: Document configuration and setup steps
7. **Backup Data**: Regular database backups during development
8. **Monitor Performance**: Keep an eye on query performance from the start

## Getting Help

### Resources:
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Flask-SQLAlchemy**: https://flask-sqlalchemy.palletsprojects.com/
- **psycopg2 Docs**: https://www.psycopg.org/docs/

### Community:
- Stack Overflow (specific error messages)
- PostgreSQL Community
- Flask Discord/Slack
- SQLAlchemy Google Groups

Remember: Most issues have been encountered by others before. Search for your specific error message and you'll likely find solutions!