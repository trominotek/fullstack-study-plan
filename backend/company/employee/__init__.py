# backend/company/employee/__init__.py
from flask import Blueprint, jsonify, request

bp = Blueprint("employee", __name__)

employees = [
    {"id": 1, "first_name": "Alice", "last_name": "Smith", "zip_code": "12345"},
    {"id": 2, "first_name": "Bob", "last_name": "Johnson", "zip_code": "67890"},
]

def _next_id():
    return max((e["id"] for e in employees), default=0) + 1

@bp.get("/")
def list_employees():
    return jsonify(employees)

@bp.post("/")
def create_employee():
    data = request.json or {}
    emp = {
        "id": _next_id(),
        "first_name": data.get("first_name", ""),
        "last_name":  data.get("last_name", ""),
        "zip_code":   data.get("zip_code", "")
    }
    employees.append(emp)
    return jsonify(emp), 201

@bp.delete("/<int:emp_id>")
def delete_employee(emp_id):
    global employees
    employees = [e for e in employees if e["id"] != emp_id]
    return jsonify({"deleted_id": emp_id})
