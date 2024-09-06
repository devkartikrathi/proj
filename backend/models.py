from datetime import datetime

class DisasterReport:
    def __init__(self, lat, lng, disaster_type, description, imageUrl, _id=None):
        self._id = _id
        self.lat = lat
        self.lng = lng
        self.disaster_type = disaster_type
        self.description = description
        self.imageUrl = imageUrl
        self.created_at = datetime.utcnow()
        self.zone = "green"  # Default zone

    def to_dict(self):
        return {
            '_id': str(self._id) if self._id else None,
            'lat': self.lat,
            'lng': self.lng,
            'disaster_type': self.disaster_type,
            'description': self.description,
            'imageUrl': self.imageUrl,
            'created_at': self.created_at,
            'zone': self.zone
        }