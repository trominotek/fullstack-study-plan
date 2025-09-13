# Week 2 Study Plan - Backend Database Integration

## Overview
This week focuses on connecting your Flask backend to a PostgreSQL database, learning database management, and implementing proper data persistence patterns.

## Learning Objectives
By the end of this week, you will understand:
1. How to run PostgreSQL in Docker containers
2. Python database libraries and ORM patterns
3. SQL fundamentals and database design
4. Flask-SQLAlchemy integration
5. Database migrations and schema management
6. CRUD operations with real persistence

## Study Structure

### Day 1-2: PostgreSQL Setup & Docker
- **File**: `01-postgresql-docker-setup.md`
- **Topics**: Docker, PostgreSQL container, database basics
- **Hands-on**: Set up PostgreSQL container, connect with client tools

### Day 3-4: Python Database Libraries
- **File**: `02-python-database-libraries.md`  
- **Topics**: psycopg2, SQLAlchemy, Flask-SQLAlchemy
- **Hands-on**: Install libraries, establish database connections

### Day 5-6: SQL Fundamentals & ORM
- **File**: `03-sql-and-orm-mapping.md`
- **Topics**: SQL queries, table design, Python ORM patterns
- **Hands-on**: Create tables, write queries, map Python classes to DB

### Day 7: Integration & Practice
- **File**: `04-flask-integration-guide.md`
- **Topics**: Integrate PostgreSQL with your existing Flask app
- **Hands-on**: Replace in-memory data with database persistence

## Practical Project
You'll upgrade your current Flask application to:
- Store items in PostgreSQL instead of in-memory lists
- Use proper database models and relationships
- Handle database migrations
- Implement connection pooling and error handling

## Prerequisites
- Completed Week 1 (Angular frontend + Flask backend basics)
- Docker installed on your system
- Basic understanding of SQL (we'll cover this too)

## Files in This Directory
1. `README.md` - This overview file
2. `01-postgresql-docker-setup.md` - PostgreSQL with Docker
3. `02-python-database-libraries.md` - Python DB libraries guide
4. `03-sql-and-orm-mapping.md` - SQL fundamentals and ORM
5. `04-flask-integration-guide.md` - Integration with Flask app
6. `practice-exercises.md` - Hands-on exercises
7. `troubleshooting.md` - Common issues and solutions

## Success Criteria
- ✅ PostgreSQL running in Docker container
- ✅ Python app connects to PostgreSQL
- ✅ CRUD operations working with database
- ✅ Database schema properly designed
- ✅ Flask app integrated with SQLAlchemy
- ✅ Frontend still working with database backend

## Next Week Preview
Week 3 will cover advanced database topics:
- Database relationships and joins
- Query optimization
- Authentication and authorization
- API security best practices