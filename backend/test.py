from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from config import MONGO_URI
from models import DisasterReport
from datetime import datetime
from geopy.distance import geodesic

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = MongoClient(MONGO_URI)
db = client.disaster_reporter
reports_collection = db.reports

DISASTER_TYPES = ["Flood", "Earthquake", "Landslide", "Hurricane", "Wildfire", "Other"]

@app.route('/api/reports', methods=['GET'])
def get_reports():
    reports = list(reports_collection.find().sort('created_at', -1).limit(100))
    for report in reports:
        report['_id'] = str(report['_id'])
    return jsonify(reports)

@app.route('/api/reports', methods=['POST'])
def create_report():
    data = request.json
    new_report = DisasterReport(
        lat=data['lat'],
        lng=data['lng'],
        disaster_type=data['disaster_type'],
        description=data['description'],
        imageUrl=data['imageUrl']
    )
    result = reports_collection.insert_one(new_report.to_dict())
    new_report._id = str(result.inserted_id)

    nearby_reports = count_nearby_reports(new_report.lat, new_report.lng)
    zone = classify_zone(nearby_reports)
    reports_collection.update_one({'_id': result.inserted_id}, {'$set': {'zone': zone}})

    return jsonify(new_report.to_dict()), 201

def count_nearby_reports(lat, lng, max_distance=2):
    all_reports = list(reports_collection.find())
    count = 0
    for report in all_reports:
        distance = geodesic((lat, lng), (report['lat'], report['lng'])).km
        if distance <= max_distance:
            count += 1
    return count

def classify_zone(count):
    if count > 50:
        return "red"
    elif count > 30:
        return "orange"
    elif count > 10:
        return "yellow"
    else:
        return "green"

@app.route('/api/disaster-types', methods=['GET'])
def get_disaster_types():
    return jsonify(DISASTER_TYPES)

if __name__ == '__main__':
    app.run(debug=True)