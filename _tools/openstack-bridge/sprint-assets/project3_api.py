from flask import Flask, jsonify, request
import socket, datetime

app = Flask(__name__)

@app.get("/")
def home():
    return jsonify(
        service="OpenStack Cloud Security Class API",
        status="online",
        host=socket.gethostname(),
        time=datetime.datetime.now().isoformat()
    )

@app.get("/health")
def health():
    return jsonify(status="healthy")

@app.get("/student/<name>")
def student(name):
    return jsonify(message=f"Hello, {name}. You reached an API running on an OpenStack Nova instance.")

@app.post("/echo")
def echo():
    return jsonify(received=request.get_json(silent=True), source=request.remote_addr)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
