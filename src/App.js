import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Map from './Map';
import RedZonesTable from './RedZonesTable';

const API_BASE_URL = "http://localhost:5000";

const DisasterReport = ({ type, description, imageUrl }) => (
  <div className="disaster-report">
    <h3>{type}</h3>
    <p>{description}</p>
    <img src={imageUrl} alt={type} style={{ maxWidth: '100%', height: 'auto' }} />
  </div>
);

const App = () => {
  const [disasterType, setDisasterType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [reports, setReports] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [redZones, setRedZones] = useState([]);

  useEffect(() => {
    fetchDisasterTypes();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserLocation(location);
          fetchReports(location);
          fetchRedZones(location);
        },
        (error) => {
          setError(`Error getting location: ${error.message}`);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const fetchReports = async (location) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports`, {
        params: location
      });
      setReports(response.data);
    } catch (error) {
      setError(`Error fetching reports: ${error.message}`);
    }
  };

  const fetchRedZones = async (location) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/red-zones`, {
        params: location
      });
      setRedZones(response.data);
    } catch (error) {
      setError(`Error fetching red zones: ${error.message}`);
    }
  };

  const fetchDisasterTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/disaster-types`);
      setDisasterTypes(response.data);
    } catch (error) {
      setError(`Error fetching disaster types: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('disaster_type', disasterType);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('lat', userLocation.lat);
    formData.append('lon', userLocation.lon);

    try {
      await axios.post(`${API_BASE_URL}/api/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDisasterType("");
      setDescription("");
      setImage(null);
      fetchReports(userLocation);
      fetchRedZones(userLocation);
    } catch (error) {
      setError(`Error creating report: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Disaster Reporting Tool</h1>
      </header>
      <main>
        <section className="report-form">
          <h2>Report a Disaster</h2>
          <form onSubmit={handleSubmit}>
            <select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              required
            >
              <option value="">Select a disaster type</option>
              {disasterTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the disaster..."
              required
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              required
            />
            <button type="submit">Report Disaster</button>
          </form>
        </section>
        <section className="map-container">
          <h2>Disaster Map</h2>
          {userLocation && (
            <Map
              userLocation={userLocation}
              reports={reports}
            />
          )}
        </section>
        <section className="red-zones">
          <h2>Closest Red Zones</h2>
          <RedZonesTable redZones={redZones} />
        </section>
        <section className="reports-list">
          <h2>Recent Reports</h2>
          {reports.map((report) => (
            <DisasterReport
              key={report._id}
              type={report.disaster_type}
              description={report.description}
              imageUrl={report.imageUrl}
            />
          ))}
        </section>
      </main>
      <footer>
        <h3>Disaster Management Tips</h3>
        <ul>
          <li>Stay informed about potential disasters in your area</li>
          <li>Create an emergency kit with essentials</li>
          <li>Develop a family communication plan</li>
          <li>Know evacuation routes and shelter locations</li>
          <li>Follow instructions from local authorities</li>
        </ul>
      </footer>
    </div>
  );
};

export default App;