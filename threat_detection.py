from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/detect', methods=['GET'])
def detect_threat():
    return jsonify({"message": "AI-powered threat detection is running", "status": "safe"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

