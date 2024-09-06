from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, GEOSPHERE
from bson import ObjectId
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from geopy.distance import geodesic

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure MongoDB
MONGO_URI = "mongodb://localhost:27017/disaster_reporter"
client = MongoClient(MONGO_URI)
db = client.disaster_reporter
reports_collection = db.reports

# Ensure geospatial index
reports_collection.create_index([("location", GEOSPHERE)])

# Configure image uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DISASTER_TYPES = ["Flood", "Earthquake", "Landslide", "Hurricane", "Wildfire", "Other"]

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/reports', methods=['GET'])
def get_reports():
    lat = float(request.args.get('lat', 0))
    lon = float(request.args.get('lon', 0))
    
    reports = list(reports_collection.find({
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "$maxDistance": 1000  # 1km in meters
            }
        }
    }).sort('created_at', -1).limit(100))

    for report in reports:
        report['_id'] = str(report['_id'])
        report['distance'] = geodesic((lat, lon), report['location']['coordinates'][::-1]).meters

    return jsonify(reports)

@app.route('/api/reports', methods=['POST'])
def create_report():
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        new_report = {
            "disaster_type": request.form.get('disaster_type'),
            "description": request.form.get('description'),
            "imageUrl": f"/uploads/{filename}",
            "created_at": datetime.utcnow(),
            "location": {
                "type": "Point",
                "coordinates": [float(request.form.get('lon')), float(request.form.get('lat'))]
            }
        }
        result = reports_collection.insert_one(new_report)
        new_report['_id'] = str(result.inserted_id)
        return jsonify(new_report), 201
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/disaster-types', methods=['GET'])
def get_disaster_types():
    return jsonify(DISASTER_TYPES)

@app.route('/api/red-zones', methods=['GET'])
def get_red_zones():
    lat = float(request.args.get('lat', 0))
    lon = float(request.args.get('lon', 0))
    
    red_zones = list(reports_collection.find({
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                }
            }
        }
    }).sort('created_at', -1).limit(5))

    for zone in red_zones:
        zone['_id'] = str(zone['_id'])
        zone['distance'] = geodesic((lat, lon), zone['location']['coordinates'][::-1]).kilometers

    return jsonify(red_zones)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)