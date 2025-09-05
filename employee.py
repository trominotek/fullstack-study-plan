from flask import Flask, jsonify, request

app = Flask(__name__)

# Hardcoded "database"
employees = [
    {"id": 1, "first_name": "Alice", "last_name": "Smith", "zip_code": "12345"},
    {"id": 2, "first_name": "Bob", "last_name": "Johnson", "zip_code": "67890"}
]

# GET all employees
@app.route("/api/employee", methods=["GET"])
def get_employees():
    return jsonify(employees)

# POST new employee
@app.route("/api/employee", methods=["POST"])
def add_employee():
    data = request.json
    new_id = max(emp["id"] for emp in employees) + 1 if employees else 1
    new_emp = {
        "id": new_id,
        "first_name": data.get("first_name", "Unknown"),
        "last_name": data.get("last_name", "Unknown"),
        "zip_code": data.get("zip_code", "00000")
    }
    employees.append(new_emp)
    return jsonify(new_emp), 201

# DELETE employee by id
@app.route("/api/employee/<int:emp_id>", methods=["DELETE"])
def delete_employee(emp_id):
    global employees
    employees = [emp for emp in employees if emp["id"] != emp_id]
    return jsonify({"deleted_id": emp_id})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
