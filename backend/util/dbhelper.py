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