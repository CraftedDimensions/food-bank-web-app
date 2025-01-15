import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import GoogleMapReact from 'google-map-react';

const App = () => {
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const socket = io();

  useEffect(() => {
    // Fetch initial donations
    fetch('/api/donations')
      .then((res) => res.json())
      .then(setDonations);

    // Fetch initial notifications
    fetch('/api/notifications')
      .then((res) => res.json())
      .then(setNotifications);

    // Listen for real-time updates
    socket.on('new-donation', (donation) => {
      setDonations((prev) => [...prev, donation]);
    });

    socket.on('new-notification', (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => socket.disconnect();
  }, [socket]);

  return (
    <div>
      <h1>Food Bank Donation Tracker</h1>
      <div style={{ height: '400px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={{ lat: 40.7128, lng: -74.006 }}
          defaultZoom={11}
        />
      </div>
      <h2>Recent Donations</h2>
      <ul>
        {donations.map((donation, index) => (
          <li key={index}>{donation.type} - {donation.quantity} ({donation.location})</li>
        ))}
      </ul>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification.message} - {new Date(notification.date).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
