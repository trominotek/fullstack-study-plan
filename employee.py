from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Hardcoded "database" - using items instead of employees for consistency with frontend
items = [
    {"id": 1, "name": "Sample Item 1", "description": "This is a sample item for testing"},
    {"id": 2, "name": "Sample Item 2", "description": "Another sample item"},
    {"id": 3, "name": "Test Item", "description": "A test item with some description"}
]

# GET all items
@app.route("/items", methods=["GET"])
def get_items():
    return jsonify(items)

# GET single item by id
@app.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    item = next((item for item in items if item["id"] == item_id), None)
    if item:
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404

# POST new item
@app.route("/items", methods=["POST"])
def add_item():
    data = request.json
    new_id = max(item["id"] for item in items) + 1 if items else 1
    new_item = {
        "id": new_id,
        "name": data.get("name", "Unnamed Item"),
        "description": data.get("description", "")
    }
    items.append(new_item)
    return jsonify(new_item), 201

# PUT update item by id
@app.route("/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.json
    item = next((item for item in items if item["id"] == item_id), None)
    if item:
        item["name"] = data.get("name", item["name"])
        item["description"] = data.get("description", item["description"])
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404

# DELETE item by id
@app.route("/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    global items
    item = next((item for item in items if item["id"] == item_id), None)
    if item:
        items = [item for item in items if item["id"] != item_id]
        return jsonify({"message": "Item deleted successfully"})
    return jsonify({"error": "Item not found"}), 404

# Legacy employee endpoints (keeping for compatibility)
@app.route("/api/employee", methods=["GET"])
def get_employees():
    employees = [
        {"id": 1, "first_name": "Alice", "last_name": "Smith", "zip_code": "12345"},
        {"id": 2, "first_name": "Bob", "last_name": "Johnson", "zip_code": "67890"}
    ]
    return jsonify(employees)

@app.route("/api/employee", methods=["POST"])
def add_employee():
    data = request.json
    return jsonify({"message": "Employee endpoint - use /items instead"}), 201

@app.route("/api/employee/<int:emp_id>", methods=["DELETE"])
def delete_employee(emp_id):
    return jsonify({"message": "Employee endpoint - use /items instead"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5003)
