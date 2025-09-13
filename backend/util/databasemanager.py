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
