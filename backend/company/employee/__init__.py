# backend/company/employee/__init__.py
from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, conn_params):
        self.conn_params = conn_params
    
    def get_connection(self):
        """Get database connection with error handling."""
        try:
            return psycopg2.connect(**self.conn_params)
        except psycopg2.Error as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    def create_employee(self, first_name, last_name, zip_code):
        """Create a new employee in the database."""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    query = """
                        INSERT INTO employees (first_name, last_name, zip_code, created_at) 
                        VALUES (%s, %s, %s, CURRENT_TIMESTAMP) 
                        RETURNING id, first_name, last_name, zip_code, created_at
                    """
                    cursor.execute(query, (first_name, last_name, zip_code))
                    result = cursor.fetchone()
                    return dict(result) if result else None
        except psycopg2.Error as e:
            logger.error(f"Error creating employee: {e}")
            raise
    
    def get_all_employees(self):
        """Get all employees from the database."""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT id, first_name, last_name, zip_code, created_at 
                        FROM employees 
                        ORDER BY created_at DESC
                    """)
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]
        except psycopg2.Error as e:
            logger.error(f"Error fetching employees: {e}")
            raise
    
    def get_employee_by_id(self, employee_id):
        """Get a specific employee by ID."""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT id, first_name, last_name, zip_code, created_at 
                        FROM employees 
                        WHERE id = %s
                    """, (employee_id,))
                    result = cursor.fetchone()
                    return dict(result) if result else None
        except psycopg2.Error as e:
            logger.error(f"Error fetching employee {employee_id}: {e}")
            raise
    
    def update_employee(self, employee_id, first_name, last_name, zip_code):
        """Update an existing employee."""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    query = """
                        UPDATE employees 
                        SET first_name = %s, last_name = %s, zip_code = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                        RETURNING id, first_name, last_name, zip_code, updated_at
                    """
                    cursor.execute(query, (first_name, last_name, zip_code, employee_id))
                    result = cursor.fetchone()
                    return dict(result) if result else None
        except psycopg2.Error as e:
            logger.error(f"Error updating employee {employee_id}: {e}")
            raise
    
    def delete_employee(self, employee_id):
        """Delete an employee by ID."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM employees WHERE id = %s", (employee_id,))
                    return cursor.rowcount > 0
        except psycopg2.Error as e:
            logger.error(f"Error deleting employee {employee_id}: {e}")
            raise
    
    def init_employees_table(self):
        """Create employees table if it doesn't exist and add sample data."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Create table
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS employees (
                            id SERIAL PRIMARY KEY,
                            first_name VARCHAR(100) NOT NULL,
                            last_name VARCHAR(100) NOT NULL,
                            zip_code VARCHAR(20),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    
                    # Check if table has data
                    cursor.execute("SELECT COUNT(*) FROM employees")
                    count = cursor.fetchone()[0]
                    
                    # Add sample data if table is empty
                    if count == 0:
                        sample_employees = [
                            ("Alice", "Smith", "12345"),
                            ("Bob", "Johnson", "67890"),
                            ("Carol", "Williams", "11111"),
                            ("David", "Brown", "22222")
                        ]
                        
                        for first_name, last_name, zip_code in sample_employees:
                            cursor.execute("""
                                INSERT INTO employees (first_name, last_name, zip_code)
                                VALUES (%s, %s, %s)
                            """, (first_name, last_name, zip_code))
                        
                        logger.info("Sample employees added to database")
                    
                    conn.commit()
                    logger.info("Employees table initialized successfully")
        except psycopg2.Error as e:
            logger.error(f"Error initializing employees table: {e}")
            raise

bp = Blueprint("employee", __name__)

# Database configuration (hardcoded)
conn_params = {
    'host': 'localhost',
    'database': 'fullstack_db',
    'user': 'fullstack_user',
    'password': 'fullstack_pass',
    'port': 5432
}

# Initialize database manager
db = DatabaseManager(conn_params)

# Initialize database table on import
try:
    db.init_employees_table()
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

@bp.get("/")
def list_employees():
    """Get all employees from database."""
    try:
        employees = db.get_all_employees()
        return jsonify(employees)
    except Exception as e:
        logger.error(f"Error in list_employees: {e}")
        return jsonify({"error": "Failed to retrieve employees"}), 500

@bp.get("/<int:emp_id>")
def get_employee(emp_id):
    """Get a specific employee by ID."""
    try:
        employee = db.get_employee_by_id(emp_id)
        if employee:
            return jsonify(employee)
        else:
            return jsonify({"error": "Employee not found"}), 404
    except Exception as e:
        logger.error(f"Error in get_employee: {e}")
        return jsonify({"error": "Failed to retrieve employee"}), 500

@bp.post("/")
def create_employee():
    """Create a new employee."""
    try:
        data = request.json or {}
        
        # Validate required fields
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        zip_code = data.get("zip_code", "").strip()
        
        if not first_name or not last_name:
            return jsonify({"error": "First name and last name are required"}), 400
        
        employee = db.create_employee(first_name, last_name, zip_code)
        
        if employee:
            return jsonify(employee), 201
        else:
            return jsonify({"error": "Failed to create employee"}), 500
            
    except Exception as e:
        logger.error(f"Error in create_employee: {e}")
        return jsonify({"error": "Failed to create employee"}), 500

@bp.put("/<int:emp_id>")
def update_employee(emp_id):
    """Update an existing employee."""
    try:
        data = request.json or {}
        
        # Validate required fields
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        zip_code = data.get("zip_code", "").strip()
        
        if not first_name or not last_name:
            return jsonify({"error": "First name and last name are required"}), 400
        
        employee = db.update_employee(emp_id, first_name, last_name, zip_code)
        
        if employee:
            return jsonify(employee)
        else:
            return jsonify({"error": "Employee not found"}), 404
            
    except Exception as e:
        logger.error(f"Error in update_employee: {e}")
        return jsonify({"error": "Failed to update employee"}), 500

@bp.delete("/<int:emp_id>")
def delete_employee(emp_id):
    """Delete an employee by ID."""
    try:
        success = db.delete_employee(emp_id)
        
        if success:
            return jsonify({"message": "Employee deleted successfully", "deleted_id": emp_id})
        else:
            return jsonify({"error": "Employee not found"}), 404
            
    except Exception as e:
        logger.error(f"Error in delete_employee: {e}")
        return jsonify({"error": "Failed to delete employee"}), 500

# Health check endpoint for the employee service
@bp.get("/health")
def health_check():
    """Check if the employee service and database are working."""
    try:
        # Test database connection by getting count of employees
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM employees")
                count = cursor.fetchone()[0]
        
        return jsonify({
            "status": "healthy",
            "service": "employee",
            "database": "connected",
            "employee_count": count
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "service": "employee",
            "database": "disconnected",
            "error": str(e)
        }), 500