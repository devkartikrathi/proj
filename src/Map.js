import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ userLocation, reports }) => {
  return (
    <MapContainer center={[userLocation.lat, userLocation.lon]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map((report) => (
        <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]}>
          <Popup>
            <h3>{report.disaster_type}</h3>
            <p>{report.description}</p>
            <img src={report.imageUrl} alt={report.disaster_type} style={{ maxWidth: '100%', height: 'auto' }} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;