# Day 5-6: SQL Fundamentals & ORM Mapping

## SQL Fundamentals

### What is SQL?
SQL (Structured Query Language) is the standard language for interacting with relational databases. It allows you to:
- **Create** and modify database structure (DDL - Data Definition Language)
- **Insert, Update, Delete** data (DML - Data Manipulation Language) 
- **Query** and retrieve data (DQL - Data Query Language)
- **Control** access and permissions (DCL - Data Control Language)

### Basic SQL Syntax

#### 1. Creating Tables (DDL)
```sql
-- Create items table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create relationship table
CREATE TABLE user_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);
```

#### 2. Inserting Data (DML)
```sql
-- Single insert
INSERT INTO items (name, description, price) 
VALUES ('Laptop', 'High-performance laptop', 999.99);

-- Multiple inserts
INSERT INTO items (name, description, price) VALUES 
    ('Mouse', 'Wireless mouse', 29.99),
    ('Keyboard', 'Mechanical keyboard', 79.99),
    ('Monitor', '24-inch display', 199.99);

-- Insert with returning
INSERT INTO users (username, email, password_hash) 
VALUES ('john_doe', 'john@example.com', 'hashed_password')
RETURNING id, username, created_at;
```

#### 3. Querying Data (DQL)
```sql
-- Basic select
SELECT * FROM items;
SELECT name, price FROM items;

-- With conditions
SELECT * FROM items WHERE price > 50;
SELECT * FROM items WHERE name LIKE '%book%';
SELECT * FROM items WHERE is_active = TRUE AND price BETWEEN 20 AND 100;

-- Ordering
SELECT * FROM items ORDER BY price DESC;
SELECT * FROM items ORDER BY name ASC, price DESC;

-- Limiting results
SELECT * FROM items ORDER BY created_at DESC LIMIT 10;
SELECT * FROM items ORDER BY price ASC LIMIT 5 OFFSET 10;

-- Aggregation
SELECT COUNT(*) FROM items;
SELECT AVG(price) as average_price FROM items;
SELECT MAX(price), MIN(price) FROM items;
SELECT is_active, COUNT(*) FROM items GROUP BY is_active;
```

#### 4. Joins - Combining Tables
```sql
-- Inner Join (only matching records)
SELECT u.username, i.name, i.price
FROM users u
INNER JOIN user_items ui ON u.id = ui.user_id
INNER JOIN items i ON ui.item_id = i.id;

-- Left Join (all users, even without items)
SELECT u.username, i.name
FROM users u
LEFT JOIN user_items ui ON u.id = ui.user_id
LEFT JOIN items i ON ui.item_id = i.id;

-- Count items per user
SELECT u.username, COUNT(ui.item_id) as item_count
FROM users u
LEFT JOIN user_items ui ON u.id = ui.user_id
GROUP BY u.id, u.username;
```

#### 5. Updating Data
```sql
-- Update single record
UPDATE items 
SET price = 899.99, updated_at = CURRENT_TIMESTAMP 
WHERE name = 'Laptop';

-- Update multiple records
UPDATE items 
SET is_active = FALSE 
WHERE price < 30;

-- Update with join
UPDATE items 
SET price = price * 0.9 
WHERE id IN (
    SELECT item_id FROM user_items 
    GROUP BY item_id 
    HAVING COUNT(*) > 5
);
```

#### 6. Deleting Data
```sql
-- Delete specific record
DELETE FROM items WHERE id = 1;

-- Delete with condition
DELETE FROM items WHERE is_active = FALSE;

-- Delete with join (cascade will handle user_items)
DELETE FROM users WHERE created_at < '2023-01-01';
```

### Advanced SQL Concepts

#### 1. Indexes for Performance
```sql
-- Create indexes for faster queries
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_active_price ON items(is_active, price);

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index
CREATE INDEX idx_active_items ON items(name) WHERE is_active = TRUE;
```

#### 2. Constraints
```sql
-- Add constraints to existing table
ALTER TABLE items 
ADD CONSTRAINT chk_positive_price CHECK (price > 0);

ALTER TABLE items 
ADD CONSTRAINT chk_valid_name CHECK (LENGTH(name) >= 2);

-- Foreign key constraint
ALTER TABLE user_items
ADD CONSTRAINT fk_user_items_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### 3. Transactions
```sql
-- Start transaction
BEGIN;

INSERT INTO users (username, email, password_hash) 
VALUES ('new_user', 'new@example.com', 'hash');

INSERT INTO items (name, description, price) 
VALUES ('New Item', 'Description', 49.99);

-- If everything is ok
COMMIT;

-- If something went wrong
-- ROLLBACK;
```

## Python to Database Mapping (ORM)

### Understanding ORM Concepts

**Object-Relational Mapping (ORM)** bridges the gap between object-oriented programming and relational databases by:
- Mapping database tables to Python classes
- Mapping table rows to class instances
- Mapping table columns to class attributes
- Providing methods for database operations

### SQLAlchemy ORM Models

#### 1. Basic Model Definition
```python
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Item(Base):
    __tablename__ = 'items'
    
    # Primary key
    id = Column(Integer, primary_key=True)
    
    # String columns
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Numeric columns
    price = Column(Numeric(10, 2))
    
    # Boolean column
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Item(id={self.id}, name='{self.name}', price={self.price})>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
```

#### 2. Relationships Between Models
```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationship to items (many-to-many)
    items = relationship("Item", secondary="user_items", back_populates="owners")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class UserItem(Base):
    __tablename__ = 'user_items'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Unique constraint
    __table_args__ = (UniqueConstraint('user_id', 'item_id'),)

# Add back reference to Item
Item.owners = relationship("User", secondary="user_items", back_populates="items")
```

#### 3. Different Relationship Types
```python
# One-to-Many: Category -> Items
class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # One category has many items
    items = relationship("Item", back_populates="category")

# Update Item model to include category
class Item(Base):
    # ... existing columns ...
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # Many items belong to one category
    category = relationship("Category", back_populates="items")

# One-to-One: User -> Profile
class UserProfile(Base):
    __tablename__ = 'user_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    bio = Column(Text)
    
    # One-to-one relationship
    user = relationship("User", back_populates="profile", uselist=False)

# Add to User model
User.profile = relationship("UserProfile", back_populates="user", uselist=False)
```

### ORM Query Patterns

#### 1. Basic CRUD Operations
```python
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Setup
engine = create_engine('postgresql://user:pass@localhost/db')
Session = sessionmaker(bind=engine)
session = Session()

# CREATE
def create_item(name, description, price):
    item = Item(name=name, description=description, price=price)
    session.add(item)
    session.commit()
    session.refresh(item)  # Get the assigned ID
    return item

# READ
def get_all_items():
    return session.query(Item).all()

def get_item_by_id(item_id):
    return session.query(Item).filter(Item.id == item_id).first()

def get_active_items():
    return session.query(Item).filter(Item.is_active == True).all()

# UPDATE
def update_item_price(item_id, new_price):
    item = session.query(Item).filter(Item.id == item_id).first()
    if item:
        item.price = new_price
        item.updated_at = func.now()
        session.commit()
        return item
    return None

# DELETE
def delete_item(item_id):
    item = session.query(Item).filter(Item.id == item_id).first()
    if item:
        session.delete(item)
        session.commit()
        return True
    return False
```

#### 2. Advanced Queries
```python
# Filtering with multiple conditions
def get_expensive_active_items(min_price=100):
    return session.query(Item).filter(
        Item.is_active == True,
        Item.price >= min_price
    ).all()

# Ordering and limiting
def get_recent_items(limit=10):
    return session.query(Item).order_by(
        Item.created_at.desc()
    ).limit(limit).all()

# Aggregation
def get_price_statistics():
    from sqlalchemy import func
    result = session.query(
        func.count(Item.id).label('total_items'),
        func.avg(Item.price).label('avg_price'),
        func.max(Item.price).label('max_price'),
        func.min(Item.price).label('min_price')
    ).first()
    
    return {
        'total_items': result.total_items,
        'avg_price': float(result.avg_price) if result.avg_price else 0,
        'max_price': float(result.max_price) if result.max_price else 0,
        'min_price': float(result.min_price) if result.min_price else 0
    }

# Joins and relationships
def get_users_with_items():
    return session.query(User).join(UserItem).join(Item).all()

def get_user_items(user_id):
    return session.query(Item).join(UserItem).filter(
        UserItem.user_id == user_id
    ).all()

# Group by
def get_items_by_category():
    return session.query(
        Category.name,
        func.count(Item.id).label('item_count')
    ).join(Item).group_by(Category.id, Category.name).all()
```

#### 3. Query Optimization
```python
# Eager loading to prevent N+1 queries
from sqlalchemy.orm import joinedload

def get_users_with_items_optimized():
    return session.query(User).options(
        joinedload(User.items)
    ).all()

# Lazy loading control
def get_item_with_category():
    return session.query(Item).options(
        joinedload(Item.category)
    ).all()

# Bulk operations for better performance
def bulk_update_prices(category_id, multiplier):
    session.query(Item).filter(
        Item.category_id == category_id
    ).update({
        Item.price: Item.price * multiplier
    }, synchronize_session=False)
    session.commit()

def bulk_insert_items(items_data):
    items = [Item(**data) for data in items_data]
    session.bulk_save_objects(items)
    session.commit()
```

### Database Design Patterns

#### 1. Repository Pattern
```python
from abc import ABC, abstractmethod

class ItemRepository(ABC):
    @abstractmethod
    def create(self, item_data):
        pass
    
    @abstractmethod
    def get_by_id(self, item_id):
        pass
    
    @abstractmethod
    def get_all(self):
        pass
    
    @abstractmethod
    def update(self, item_id, item_data):
        pass
    
    @abstractmethod
    def delete(self, item_id):
        pass

class SQLAlchemyItemRepository(ItemRepository):
    def __init__(self, session):
        self.session = session
    
    def create(self, item_data):
        item = Item(**item_data)
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item
    
    def get_by_id(self, item_id):
        return self.session.query(Item).filter(Item.id == item_id).first()
    
    def get_all(self):
        return self.session.query(Item).all()
    
    def update(self, item_id, item_data):
        item = self.get_by_id(item_id)
        if item:
            for key, value in item_data.items():
                setattr(item, key, value)
            item.updated_at = func.now()
            self.session.commit()
            return item
        return None
    
    def delete(self, item_id):
        item = self.get_by_id(item_id)
        if item:
            self.session.delete(item)
            self.session.commit()
            return True
        return False
```

#### 2. Unit of Work Pattern
```python
class UnitOfWork:
    def __init__(self, session):
        self.session = session
        self.items = SQLAlchemyItemRepository(session)
        self.users = SQLAlchemyUserRepository(session)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.rollback()
        self.session.close()
    
    def commit(self):
        self.session.commit()
    
    def rollback(self):
        self.session.rollback()

# Usage
def transfer_item(from_user_id, to_user_id, item_id):
    with UnitOfWork(Session()) as uow:
        # Remove item from first user
        from_user = uow.users.get_by_id(from_user_id)
        item = uow.items.get_by_id(item_id)
        
        if item in from_user.items:
            from_user.items.remove(item)
        
        # Add to second user
        to_user = uow.users.get_by_id(to_user_id)
        to_user.items.append(item)
        
        uow.commit()
```

### Data Validation and Constraints

#### 1. Model-Level Validation
```python
from sqlalchemy.orm import validates
from sqlalchemy import event

class Item(Base):
    # ... existing columns ...
    
    @validates('price')
    def validate_price(self, key, price):
        if price is not None and price < 0:
            raise ValueError("Price cannot be negative")
        return price
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return name.strip()

# Event listeners
@event.listens_for(Item, 'before_update')
def before_item_update(mapper, connection, target):
    target.updated_at = func.now()
```

#### 2. Database-Level Constraints
```python
from sqlalchemy import CheckConstraint, UniqueConstraint

class Item(Base):
    __tablename__ = 'items'
    
    # ... columns ...
    
    __table_args__ = (
        CheckConstraint('price > 0', name='positive_price'),
        CheckConstraint("name != ''", name='non_empty_name'),
        UniqueConstraint('name', 'category_id', name='unique_name_per_category')
    )
```

## SQL vs ORM Trade-offs

| Aspect | Raw SQL | SQLAlchemy ORM |
|--------|---------|----------------|
| **Learning Curve** | Medium | High |
| **Performance** | Highest | Good |
| **Type Safety** | Manual | Automatic |
| **Complex Queries** | Excellent | Limited |
| **Relationships** | Manual Joins | Automatic |
| **Database Portability** | Low | High |
| **Maintainability** | Medium | High |
| **Development Speed** | Slow | Fast |

### When to Use Each:
- **Raw SQL**: Complex reporting, data analysis, performance-critical operations
- **ORM**: CRUD operations, rapid development, complex relationships, type safety

## Best Practices

### 1. Session Management
```python
# Good: Use context managers
from contextlib import contextmanager

@contextmanager
def get_db_session():
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Usage
def create_item_safely(item_data):
    with get_db_session() as session:
        item = Item(**item_data)
        session.add(item)
        return item.id
```

### 2. Query Optimization
```python
# Use select_from for explicit joins
query = session.query(Item.name, Category.name).select_from(
    Item
).join(Category)

# Use exists() for performance
has_items = session.query(
    session.query(Item).filter(Item.category_id == category.id).exists()
).scalar()

# Batch operations
session.bulk_insert_mappings(Item, items_data)
session.bulk_update_mappings(Item, updated_items_data)
```

### 3. Error Handling
```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

def create_item_with_error_handling(item_data):
    try:
        with get_db_session() as session:
            item = Item(**item_data)
            session.add(item)
            session.flush()  # Check for constraint violations
            return item
    except IntegrityError as e:
        if 'unique constraint' in str(e):
            raise ValueError("Item with this name already exists")
        raise
    except SQLAlchemyError as e:
        raise Exception(f"Database error: {str(e)}")
```

## Next Steps
Tomorrow we'll integrate all this knowledge with your Flask application!

## Practice Exercises
1. Design a complete database schema for an e-commerce system
2. Create models with all relationship types (1:1, 1:M, M:M)
3. Write complex queries using both SQL and ORM
4. Implement the Repository and Unit of Work patterns
5. Add validation and error handling to your models