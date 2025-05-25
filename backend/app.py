from flask import Flask
from flask_cors import CORS
from routes.main_routes import register_routes

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

register_routes(app)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
