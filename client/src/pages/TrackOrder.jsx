import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import API_URL from '../config';
import './TrackOrder.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TrackOrder = () => {
    const { orderId } = useParams();
    const [driverLocation, setDriverLocation] = useState(null);
    const [status, setStatus] = useState('Waiting for driver...');
    const socketRef = useRef();

    useEffect(() => {
        // Connect to socket
        socketRef.current = io(API_URL);

        // Join order room
        socketRef.current.emit('join_room', orderId);

        // Listen for updates
        socketRef.current.on('location_updated', (location) => {
            console.log("Received location:", location);
            setDriverLocation(location);
            setStatus('Driver is on the way!');
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [orderId]);

    // Default center (Paris)
    const center = driverLocation || { lat: 48.8566, lng: 2.3522 };

    return (
        <div className="track-order-page">
            <div className="track-header">
                <h1>Track Your Order</h1>
                <p>Order #{orderId}</p>
                <div className="track-status">
                    <span className="status-dot"></span> {status}
                </div>
            </div>

            <div className="map-container">
                <MapContainer
                    center={[center.lat, center.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {driverLocation && (
                        <Marker position={[driverLocation.lat, driverLocation.lng]}>
                            <Popup>
                                Your Driver
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default TrackOrder;
