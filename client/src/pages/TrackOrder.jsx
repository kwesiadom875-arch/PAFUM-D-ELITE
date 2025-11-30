import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import io from 'socket.io-client';
import API_URL from '../config';
import './TrackOrder.css';

// Map Container Style
const containerStyle = {
    width: '100%',
    height: '100%'
};

// Dark Luxury Map Style
const darkLuxuryStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

const TrackOrder = () => {
    const { orderId } = useParams();
    const [driverLocation, setDriverLocation] = useState(null);
    const [status, setStatus] = useState('Waiting for driver...');
    const socketRef = useRef();

    // IMPORTANT: Replace with your actual Google Maps API Key
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    });

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
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={14}
                        options={{
                            styles: darkLuxuryStyle,
                            disableDefaultUI: false,
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false
                        }}
                    >
                        {driverLocation && (
                            <Marker
                                position={driverLocation}
                                title="Your Driver"
                            // You can add a custom icon here later
                            // icon={{ url: '/path/to/car-icon.png' }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="loading-map">Loading Map...</div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
