import os
import sys
from pathlib import Path
import logging

# Add the src directory to the Python path
src_path = Path(__file__).resolve().parent
sys.path.append(str(src_path))

from flask import Flask, request, jsonify, url_for, send_from_directory, render_template
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager

ENV = os.getenv("FLASK_ENV", "production")
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change_this_in_production")
jwt = JWTManager(app)

# Enable CORS with specific origins
CORS(app, resources={r"/api/*": {"origins": [os.getenv("CORS_ORIGIN", "https://frontend-nestify-5698e7840125.herokuapp.com"), "http://localhost:3000"]}})

# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Set up admin
setup_admin(app)

# Set up commands
setup_commands(app)

# Register API blueprint
app.register_blueprint(api, url_prefix='/api')

# Configure logging
if ENV != "development":
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

# Error handlers
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    app.logger.error(f"API Exception: {error}")
    return jsonify(error.to_dict()), error.status_code

@app.errorhandler(Exception)
def handle_generic_error(error):
    app.logger.error(f"Unhandled Exception: {error}", exc_info=True)
    return jsonify({"error": "An unexpected error occurred"}), 500

# New root route for API information
@app.route('/')
def api_root():
    return jsonify({"message": "Welcome to the Nestify API", "version": "1.0"}), 200

# Keeping the original routes commented out in case they're needed in the future
# @app.route('/')
# def sitemap():
#     if ENV == "development":
#         return generate_sitemap(app)
#     return send_from_directory(static_file_dir, 'index.html')

# @app.route('/<path:path>', methods=['GET'])
# def serve_any_other_file(path):
#     if not os.path.isfile(os.path.join(static_file_dir, path)):
#         path = 'index.html'
#     response = send_from_directory(static_file_dir, path)
#     response.cache_control.max_age = 0  # avoid cache memory
#     return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=ENV == "development")