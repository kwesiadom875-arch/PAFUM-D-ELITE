import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';

const RequestsTab = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/requests`);
            setRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '20px' }}>User Requests</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Date</th>
                            <th style={{ padding: '10px' }}>User / Email</th>
                            <th style={{ padding: '10px' }}>Brand</th>
                            <th style={{ padding: '10px' }}>Product</th>
                            <th style={{ padding: '10px' }}>Description</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '10px' }}>
                                    <div>{req.userName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{req.userEmail}</div>
                                    {req.phone && <div style={{ fontSize: '0.8rem', color: '#666' }}>{req.phone}</div>}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {req.aiNotes && req.aiNotes.includes('Brand:') ? req.aiNotes.replace('Brand: ', '') : '-'}
                                </td>
                                <td style={{ padding: '10px' }}>{req.perfumeName}</td>
                                <td style={{ padding: '10px' }}>{req.description}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        backgroundColor: req.status === 'Pending' ? '#fff3cd' : '#d4edda',
                                        color: req.status === 'Pending' ? '#856404' : '#155724',
                                        fontSize: '0.8rem'
                                    }}>
                                        {req.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No requests found.</div>}
            </div>
        </div>
    );
};

export default RequestsTab;
