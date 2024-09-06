import React from 'react';

const RedZonesTable = ({ redZones }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Disaster Type</th>
          <th>Distance (km)</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {redZones.map((zone) => (
          <tr key={zone._id}>
            <td>{zone.disaster_type}</td>
            <td>{zone.distance.toFixed(2)}</td>
            <td>{zone.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RedZonesTable;