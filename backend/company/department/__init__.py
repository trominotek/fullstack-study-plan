# backend/company/department/__init__.py
from flask import Blueprint, jsonify, request

bp = Blueprint("department", __name__)   # <-- name must be `bp`

departments = [
    {"id": 1, "name": "Engineering", "description": "Builds product"},
    {"id": 2, "name": "Operations",  "description": "Keeps things running"},
]

def _next_id():
    return max((d["id"] for d in departments), default=0) + 1

@bp.get("/")
def list_departments():
    return jsonify(departments)

@bp.post("/")
def create_department():
    data = request.json or {}
    dep = {
        "id": _next_id(),
        "name": data.get("name", ""),
        "description": data.get("description", "")
    }
    departments.append(dep)
    return jsonify(dep), 201

@bp.delete("/<int:dept_id>")
def delete_department(dept_id):
    global departments
    departments = [d for d in departments if d["id"] != dept_id]
    return jsonify({"deleted_id": dept_id})
