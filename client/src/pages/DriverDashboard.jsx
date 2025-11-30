import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import API_URL from '../config';
import './DriverDashboard.css';

const DriverDashboard = () => {
    const [orderId, setOrderId] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('Idle');
    const socketRef = useRef();
    const watchIdRef = useRef(null);

    useEffect(() => {
        // Connect to socket server
        socketRef.current = io(API_URL);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const startTracking = () => {
        if (!orderId) return alert("Please enter an Order ID");

        setIsTracking(true);
        setStatus('Connecting to order room...');

        // Join the room
        socketRef.current.emit('join_room', orderId);

        setStatus('Acquiring GPS...');

        if (!navigator.geolocation) {
            setStatus('Geolocation not supported');
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setStatus(`Broadcasting: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

                // Send location to server
                socketRef.current.emit('update_location', {
                    orderId,
                    location: { lat: latitude, lng: longitude }
                });
            },
            (error) => {
                console.error(error);
                setStatus('GPS Error: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        setIsTracking(false);
        setStatus('Stopped');
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    return (
        <div className="driver-dashboard container">
            <h1>Driver Dashboard</h1>
            <div className="driver-card">
                <div className="form-group">
                    <label>Order ID</label>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter Order ID"
                        disabled={isTracking}
                    />
                </div>

                <div className="status-display">
                    Status: <span className={isTracking ? 'status-live' : ''}>{status}</span>
                </div>

                {!isTracking ? (
                    <button className="btn-primary btn-block" onClick={startTracking}>
                        Start Delivery
                    </button>
                ) : (
                    <button className="btn-danger btn-block" onClick={stopTracking}>
                        Stop Delivery
                    </button>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
