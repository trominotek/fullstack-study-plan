# Day 7: Flask Integration Guide - Database to Production

## Overview
This guide shows how to integrate PostgreSQL with your existing Flask application, replacing in-memory data storage with persistent database operations.

## Step 1: Project Structure Setup

### Recommended Directory Structure:
```
fullstack-study-plan/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   ├── item.py            # Item model
│   │   └── user.py            # User model (optional)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── items.py           # Item routes
│   │   └── api.py             # API blueprint
│   ├── services/
│   │   ├── __init__.py
│   │   └── database.py        # Database service layer
│   ├── migrations/            # Database migrations
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/                  # Your Angular app
└── docker-compose.yml         # PostgreSQL container
```

## Step 2: Environment Configuration

### Create .env file:
```env
# Database Configuration
DATABASE_URL=postgresql://fullstack_user:fullstack_pass@localhost:5432/fullstack_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=fullstack_db
POSTGRES_USER=fullstack_user
POSTGRES_PASSWORD=fullstack_pass

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:4200,http://192.168.86.22:4200
```

### Create config.py:
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 120,
        'pool_pre_ping': True
    }

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_ECHO = False

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

## Step 3: Database Models

### Create models/__init__.py:
```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .item import Item
from .user import User

__all__ = ['db', 'Item', 'User']
```

### Create models/item.py:
```python
from datetime import datetime
from sqlalchemy.sql import func
from . import db

class Item(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f'<Item {self.id}: {self.name}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create Item instance from dictionary."""
        return cls(
            name=data.get('name'),
            description=data.get('description', '')
        )
    
    def update_from_dict(self, data):
        """Update Item instance from dictionary."""
        self.name = data.get('name', self.name)
        self.description = data.get('description', self.description)
        self.updated_at = func.now()
```

### Optional: Create models/user.py:
```python
from datetime import datetime
from sqlalchemy.sql import func
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    
    def __repr__(self):
        return f'<User {self.id}: {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
```

## Step 4: Database Service Layer

### Create services/database.py:
```python
from contextlib import contextmanager
from sqlalchemy.exc import SQLAlchemyError
from models import db, Item

class DatabaseService:
    """Service layer for database operations."""
    
    @staticmethod
    @contextmanager
    def transaction():
        """Context manager for database transactions."""
        try:
            db.session.begin()
            yield db.session
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

class ItemService:
    """Service class for Item operations."""
    
    @staticmethod
    def get_all_items():
        """Get all items ordered by creation date."""
        try:
            return Item.query.order_by(Item.created_at.desc()).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching items: {str(e)}")
    
    @staticmethod
    def get_item_by_id(item_id):
        """Get item by ID."""
        try:
            return Item.query.get(item_id)
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching item {item_id}: {str(e)}")
    
    @staticmethod
    def create_item(item_data):
        """Create new item."""
        try:
            with DatabaseService.transaction():
                item = Item.from_dict(item_data)
                db.session.add(item)
                db.session.flush()  # Get the ID before commit
                return item
        except SQLAlchemyError as e:
            raise Exception(f"Error creating item: {str(e)}")
    
    @staticmethod
    def update_item(item_id, item_data):
        """Update existing item."""
        try:
            with DatabaseService.transaction():
                item = Item.query.get(item_id)
                if not item:
                    return None
                
                item.update_from_dict(item_data)
                return item
        except SQLAlchemyError as e:
            raise Exception(f"Error updating item {item_id}: {str(e)}")
    
    @staticmethod
    def delete_item(item_id):
        """Delete item by ID."""
        try:
            with DatabaseService.transaction():
                item = Item.query.get(item_id)
                if not item:
                    return False
                
                db.session.delete(item)
                return True
        except SQLAlchemyError as e:
            raise Exception(f"Error deleting item {item_id}: {str(e)}")
```

## Step 5: API Routes with Database Integration

### Create routes/items.py:
```python
from flask import Blueprint, jsonify, request
from services.database import ItemService
from models import Item

items_bp = Blueprint('items', __name__)

@items_bp.route('/items', methods=['GET'])
def get_items():
    """Get all items."""
    try:
        items = ItemService.get_all_items()
        return jsonify([item.to_dict() for item in items])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    """Get single item by ID."""
    try:
        item = ItemService.get_item_by_id(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify(item.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items', methods=['POST'])
def create_item():
    """Create new item."""
    try:
        data = request.get_json()
        
        # Basic validation
        if not data or not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        
        if len(data['name'].strip()) < 2:
            return jsonify({'error': 'Name must be at least 2 characters'}), 400
        
        item = ItemService.create_item(data)
        return jsonify(item.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """Update existing item."""
    try:
        data = request.get_json()
        
        # Basic validation
        if not data:
            return jsonify({'error': 'Request data is required'}), 400
        
        if 'name' in data and len(data['name'].strip()) < 2:
            return jsonify({'error': 'Name must be at least 2 characters'}), 400
        
        item = ItemService.update_item(item_id, data)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify(item.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Delete item by ID."""
    try:
        success = ItemService.delete_item(item_id)
        if not success:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify({'message': 'Item deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@items_bp.route('/health', methods=['GET'])
def health_check():
    """API health check."""
    try:
        # Test database connection
        from models import db
        db.session.execute('SELECT 1')
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500
```

## Step 6: Main Application Setup

### Update your main app.py:
```python
import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
from models import db
from routes.items import items_bp

def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Setup CORS
    cors_origins = app.config.get('CORS_ORIGINS', '').split(',')
    CORS(app, origins=cors_origins)
    
    # Setup database migrations
    migrate = Migrate(app, db)
    
    # Register blueprints
    app.register_blueprint(items_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
        # Add sample data if tables are empty
        if db.session.query(Item).count() == 0:
            sample_items = [
                Item(name='Sample Item 1', description='This is a sample item for testing'),
                Item(name='Sample Item 2', description='Another sample item'),
                Item(name='Test Item', description='A test item with some description')
            ]
            db.session.add_all(sample_items)
            db.session.commit()
    
    return app

# Legacy employee endpoints (keeping for compatibility)
@app.route("/api/employee", methods=["GET"])
def get_employees():
    return jsonify([
        {"id": 1, "first_name": "Alice", "last_name": "Smith", "zip_code": "12345"},
        {"id": 2, "first_name": "Bob", "last_name": "Johnson", "zip_code": "67890"}
    ])

# Create application instance
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5003))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.run(
        debug=app.config['DEBUG'],
        host=host,
        port=port
    )
```

## Step 7: Database Migrations

### Install Flask-Migrate:
```bash
pip install Flask-Migrate
```

### Initialize Migrations:
```bash
# Initialize migration repository
flask db init

# Create first migration
flask db migrate -m "Initial migration - create items table"

# Apply migration
flask db upgrade
```

### Migration Commands Reference:
```bash
# Create a new migration
flask db migrate -m "Add user table"

# Apply migrations
flask db upgrade

# Downgrade to previous migration
flask db downgrade

# Show current migration status
flask db current

# Show migration history
flask db history
```

## Step 8: Requirements and Dependencies

### Create/Update requirements.txt:
```txt
Flask==2.3.2
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.4
Flask-CORS==4.0.0
psycopg2-binary==2.9.6
python-dotenv==1.0.0
SQLAlchemy==2.0.15
```

### Install dependencies:
```bash
pip install -r requirements.txt
```

## Step 9: Docker Configuration

### Update docker-compose.yml:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: fullstack-postgres
    environment:
      POSTGRES_USER: fullstack_user
      POSTGRES_PASSWORD: fullstack_pass
      POSTGRES_DB: fullstack_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4
    container_name: fullstack-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin_pass
    ports:
      - "8080:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

## Step 10: Testing the Integration

### Test Database Connection:
```python
# test_db_connection.py
from app import create_app
from models import db, Item

def test_database_connection():
    app = create_app('testing')
    
    with app.app_context():
        try:
            # Test connection
            db.session.execute('SELECT 1')
            print("✅ Database connection successful")
            
            # Test model operations
            item = Item(name='Test Item', description='Test Description')
            db.session.add(item)
            db.session.commit()
            
            retrieved_item = Item.query.filter_by(name='Test Item').first()
            print(f"✅ Item created and retrieved: {retrieved_item}")
            
            # Clean up
            db.session.delete(retrieved_item)
            db.session.commit()
            print("✅ Item deleted successfully")
            
        except Exception as e:
            print(f"❌ Database test failed: {e}")

if __name__ == '__main__':
    test_database_connection()
```

### Test API Endpoints:
```bash
# Test health check
curl http://localhost:5003/health

# Test get all items
curl http://localhost:5003/items

# Test create item
curl -X POST http://localhost:5003/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Created via API"}'

# Test get single item
curl http://localhost:5003/items/1

# Test update item
curl -X PUT http://localhost:5003/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated via API"}'

# Test delete item
curl -X DELETE http://localhost:5003/items/1
```

## Step 11: Error Handling and Logging

### Add comprehensive error handling:
```python
import logging
from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(SQLAlchemyError)
def handle_db_error(error):
    db.session.rollback()
    logging.error(f"Database error: {error}")
    return jsonify({'error': 'Database error occurred'}), 500

@app.before_request
def log_request_info():
    logging.info(f"Request: {request.method} {request.url}")

@app.after_request
def log_response_info(response):
    logging.info(f"Response: {response.status_code}")
    return response
```

## Step 12: Performance Optimization

### Connection Pooling:
```python
# In config.py
class Config:
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,           # Number of connections to keep in pool
        'pool_recycle': 1800,      # Recycle connections after 30 minutes
        'pool_pre_ping': True,     # Verify connections before use
        'max_overflow': 30,        # Additional connections beyond pool_size
        'pool_timeout': 30         # Timeout when getting connection
    }
```

### Query Optimization:
```python
# Add indexes to models
class Item(db.Model):
    # ... existing columns ...
    
    __table_args__ = (
        db.Index('idx_item_name', 'name'),
        db.Index('idx_item_created_at', 'created_at'),
    )

# Use bulk operations for multiple inserts
def bulk_create_items(items_data):
    items = [Item.from_dict(data) for data in items_data]
    db.session.bulk_save_objects(items)
    db.session.commit()
    return len(items)
```

## Step 13: Deployment Checklist

### Production Configuration:
```python
class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    # Use environment variables in production
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable not set")
    
    # SSL settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        **Config.SQLALCHEMY_ENGINE_OPTIONS,
        'connect_args': {'sslmode': 'require'}
    }
```

### Environment Variables for Production:
```env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@prod-host:5432/prod_db
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### Health Check Endpoint:
```python
@app.route('/health')
def health_check():
    try:
        # Check database
        db.session.execute('SELECT 1')
        
        # Check table exists
        item_count = Item.query.count()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'items_count': item_count,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
```

## Step 14: Testing Your Integration

### Start Services:
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start Flask app
python app.py
```

### Verify Everything Works:
1. ✅ Flask app starts without errors
2. ✅ Database connection established
3. ✅ Sample data loaded
4. ✅ All CRUD endpoints working
5. ✅ Angular frontend can communicate with database-backed API
6. ✅ Data persists after server restart

## Success Criteria
- [ ] PostgreSQL running and accessible
- [ ] Flask app connects to PostgreSQL
- [ ] All CRUD operations work with database
- [ ] Data persists between server restarts  
- [ ] Angular frontend works with database backend
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Health check endpoint available

## Common Issues and Solutions

### Database Connection Issues:
```python
# Test connection manually
import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='fullstack_db',
        user='fullstack_user',
        password='fullstack_pass'
    )
    print("✅ Direct connection successful")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### Migration Issues:
```bash
# Reset migrations if needed
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Next Steps
Congratulations! You now have a full-stack application with:
- Angular frontend
- Flask backend
- PostgreSQL database
- Full CRUD operations
- Proper error handling
- Production-ready structure

Week 3 will cover advanced topics like authentication, relationships, and deployment!