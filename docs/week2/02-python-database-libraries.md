# Day 3-4: Python Database Libraries & Connection Management

## Overview
This guide covers the essential Python libraries for working with PostgreSQL and how to establish database connections properly.

## Python Database Libraries Landscape

### 1. Database Drivers (Low-Level)
**psycopg2** - The most popular PostgreSQL adapter for Python
- Direct SQL execution
- High performance
- Low-level database access
- Manual connection management

### 2. Object-Relational Mapping (ORM) - High-Level
**SQLAlchemy** - The most powerful Python ORM
- Object-oriented database access
- Automatic query generation
- Database abstraction layer
- Advanced relationship handling

### 3. Flask Integration
**Flask-SQLAlchemy** - SQLAlchemy integration for Flask
- Flask-specific configurations
- Application context integration
- Migration support
- Simplified setup

## Library Installation Guide

### Step 1: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Verify activation
which python  # Should show path to venv
```

### Step 2: Install Database Libraries
```bash
# Basic PostgreSQL driver
pip install psycopg2-binary

# SQLAlchemy ORM
pip install SQLAlchemy

# Flask integration
pip install Flask-SQLAlchemy

# Database migration tool
pip install Flask-Migrate

# Optional: Connection pooling
pip install psycopg2-pool

# Create requirements file
pip freeze > requirements.txt
```

### Alternative: Install All at Once
```bash
pip install psycopg2-binary SQLAlchemy Flask-SQLAlchemy Flask-Migrate python-dotenv
```

## Library Deep Dive

### 1. psycopg2 - Direct Database Access

#### Basic Connection:
```python
import psycopg2
from psycopg2 import sql

# Connection parameters
conn_params = {
    'host': 'localhost',
    'database': 'fullstack_db',
    'user': 'fullstack_user',
    'password': 'fullstack_pass',
    'port': 5432
}

# Establish connection
try:
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()
    
    # Execute query
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"PostgreSQL version: {version[0]}")
    
finally:
    cursor.close()
    conn.close()
```

#### CRUD Operations with psycopg2:
```python
import psycopg2
from psycopg2.extras import RealDictCursor

class DatabaseManager:
    def __init__(self, conn_params):
        self.conn_params = conn_params
    
    def get_connection(self):
        return psycopg2.connect(**self.conn_params)
    
    def create_item(self, name, description):
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO items (name, description) 
                    VALUES (%s, %s) 
                    RETURNING id, name, description, created_at
                """
                cursor.execute(query, (name, description))
                return cursor.fetchone()
    
    def get_all_items(self):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM items ORDER BY created_at DESC")
                return cursor.fetchall()
    
    def get_item_by_id(self, item_id):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM items WHERE id = %s", (item_id,))
                return cursor.fetchone()
    
    def update_item(self, item_id, name, description):
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                query = """
                    UPDATE items 
                    SET name = %s, description = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, name, description, updated_at
                """
                cursor.execute(query, (name, description, item_id))
                return cursor.fetchone()
    
    def delete_item(self, item_id):
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM items WHERE id = %s", (item_id,))
                return cursor.rowcount > 0

# Usage
db = DatabaseManager(conn_params)
items = db.get_all_items()
```

### 2. SQLAlchemy Core - SQL Expression Language

#### Database Engine Setup:
```python
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Text, DateTime
from sqlalchemy.sql import select, insert, update, delete
from datetime import datetime

# Create database engine
DATABASE_URL = "postgresql://fullstack_user:fullstack_pass@localhost:5432/fullstack_db"
engine = create_engine(DATABASE_URL)

# Define table structure
metadata = MetaData()
items_table = Table(
    'items', metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String(255), nullable=False),
    Column('description', Text),
    Column('created_at', DateTime, default=datetime.utcnow),
    Column('updated_at', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
)

# Create tables
metadata.create_all(engine)
```

#### CRUD Operations with SQLAlchemy Core:
```python
class SQLAlchemyCoreManager:
    def __init__(self, engine, table):
        self.engine = engine
        self.table = table
    
    def create_item(self, name, description):
        with self.engine.connect() as conn:
            stmt = insert(self.table).values(name=name, description=description)
            result = conn.execute(stmt)
            # Get the inserted item
            select_stmt = select(self.table).where(self.table.c.id == result.inserted_primary_key[0])
            return conn.execute(select_stmt).fetchone()
    
    def get_all_items(self):
        with self.engine.connect() as conn:
            stmt = select(self.table).order_by(self.table.c.created_at.desc())
            return conn.execute(stmt).fetchall()
    
    def get_item_by_id(self, item_id):
        with self.engine.connect() as conn:
            stmt = select(self.table).where(self.table.c.id == item_id)
            return conn.execute(stmt).fetchone()
    
    def update_item(self, item_id, name, description):
        with self.engine.connect() as conn:
            stmt = update(self.table).where(
                self.table.c.id == item_id
            ).values(
                name=name, 
                description=description,
                updated_at=datetime.utcnow()
            )
            result = conn.execute(stmt)
            if result.rowcount:
                return self.get_item_by_id(item_id)
            return None
    
    def delete_item(self, item_id):
        with self.engine.connect() as conn:
            stmt = delete(self.table).where(self.table.c.id == item_id)
            result = conn.execute(stmt)
            return result.rowcount > 0

# Usage
core_manager = SQLAlchemyCoreManager(engine, items_table)
```

### 3. SQLAlchemy ORM - Object-Relational Mapping

#### Model Definition:
```python
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Item(Base):
    __tablename__ = 'items'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f"<Item(id={self.id}, name='{self.name}')>"

# Setup database session
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
```

#### CRUD Operations with SQLAlchemy ORM:
```python
class ORMManager:
    def __init__(self, session_class):
        self.Session = session_class
    
    def create_item(self, name, description):
        session = self.Session()
        try:
            item = Item(name=name, description=description)
            session.add(item)
            session.commit()
            session.refresh(item)  # Get the ID
            return item
        finally:
            session.close()
    
    def get_all_items(self):
        session = self.Session()
        try:
            return session.query(Item).order_by(Item.created_at.desc()).all()
        finally:
            session.close()
    
    def get_item_by_id(self, item_id):
        session = self.Session()
        try:
            return session.query(Item).filter(Item.id == item_id).first()
        finally:
            session.close()
    
    def update_item(self, item_id, name, description):
        session = self.Session()
        try:
            item = session.query(Item).filter(Item.id == item_id).first()
            if item:
                item.name = name
                item.description = description
                item.updated_at = datetime.utcnow()
                session.commit()
                session.refresh(item)
                return item
            return None
        finally:
            session.close()
    
    def delete_item(self, item_id):
        session = self.Session()
        try:
            item = session.query(Item).filter(Item.id == item_id).first()
            if item:
                session.delete(item)
                session.commit()
                return True
            return False
        finally:
            session.close()

# Usage
orm_manager = ORMManager(Session)
```

### 4. Flask-SQLAlchemy Integration

#### Flask App Setup:
```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 
    'postgresql://fullstack_user:fullstack_pass@localhost:5432/fullstack_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Model definition
class Item(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Create tables
with app.app_context():
    db.create_all()
```

#### Flask Routes with Database:
```python
@app.route('/items', methods=['GET'])
def get_items():
    items = Item.query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@app.route('/items', methods=['POST'])
def create_item():
    data = request.get_json()
    
    item = Item(
        name=data.get('name'),
        description=data.get('description', '')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201

@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    item.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)
```

## Connection Management Best Practices

### Environment Variables:
```python
# .env file
DATABASE_URL=postgresql://fullstack_user:fullstack_pass@localhost:5432/fullstack_db
FLASK_ENV=development
FLASK_DEBUG=True

# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

# app.py
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
```

### Connection Pooling:
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

# Engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=True  # Set to False in production
)
```

### Error Handling:
```python
from sqlalchemy.exc import SQLAlchemyError
from flask import jsonify

@app.errorhandler(SQLAlchemyError)
def handle_db_error(error):
    db.session.rollback()
    return jsonify({
        'error': 'Database error occurred',
        'message': str(error)
    }), 500

# Context manager for safe operations
from contextlib import contextmanager

@contextmanager
def db_transaction():
    try:
        db.session.begin()
        yield db.session
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e
    finally:
        db.session.close()

# Usage
def safe_create_item(name, description):
    with db_transaction() as session:
        item = Item(name=name, description=description)
        session.add(item)
        return item
```

## Library Comparison

| Feature | psycopg2 | SQLAlchemy Core | SQLAlchemy ORM | Flask-SQLAlchemy |
|---------|----------|-----------------|----------------|------------------|
| Learning Curve | Low | Medium | High | Medium |
| Performance | Highest | High | Medium | Medium |
| SQL Control | Full | Full | Limited | Limited |
| Type Safety | Manual | Good | Excellent | Excellent |
| Relationships | Manual | Manual | Automatic | Automatic |
| Flask Integration | Manual | Manual | Manual | Built-in |
| Best For | Simple apps | Complex queries | Complex apps | Flask apps |

## Testing Database Operations

### Unit Tests:
```python
import unittest
from app import app, db, Item

class DatabaseTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_create_item(self):
        with app.app_context():
            item = Item(name='Test Item', description='Test Description')
            db.session.add(item)
            db.session.commit()
            
            self.assertEqual(item.name, 'Test Item')
            self.assertIsNotNone(item.id)

if __name__ == '__main__':
    unittest.main()
```

## Next Steps
Tomorrow we'll dive deeper into SQL fundamentals and advanced ORM patterns!

## Practice Exercises
1. Set up all three approaches (psycopg2, SQLAlchemy Core, ORM)
2. Create a User model with relationships to Items
3. Implement connection pooling
4. Add error handling and logging
5. Write unit tests for database operations