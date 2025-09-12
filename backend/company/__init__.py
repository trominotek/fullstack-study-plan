# backend/company/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # These expect a module-level variable named `bp` in each subpackage
    from .employee import bp as employee_bp
    from .department import bp as department_bp

    app.register_blueprint(employee_bp, url_prefix="/api/employee")
    app.register_blueprint(department_bp, url_prefix="/api/department")
    return app
