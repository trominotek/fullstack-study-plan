from flask import Flask, jsonify

app = Flask(__name__)

# Define a simple route
@app.route("/api/hello", methods=["GET"])
def hello_world():
    return jsonify(message="Hello, World!")

if __name__ == "__main__":
    # Run the Flask development server
    app.run(debug=True, host="0.0.0.0", port=5001)
