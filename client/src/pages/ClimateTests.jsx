import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { toast } from 'react-toastify';
import './ClimateTests.css';

const ClimateTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
    const [expandedTest, setExpandedTest] = useState(null);
    const [remarkText, setRemarkText] = useState('');
    const [rating, setRating] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please log in to view climate tests');
                return;
            }

            const res = await axios.get(`${API_URL}/api/climate-tests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTests(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch tests error:', error);
            toast.error(error.response?.data?.error || 'Failed to load climate tests');
            setLoading(false);
        }
    };

    const handleAddRemark = async (testId) => {
        if (!remarkText.trim()) {
            toast.error('Please enter a remark');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/climate-tests/${testId}/remarks`,
                { text: remarkText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Remark added successfully');
            setRemarkText('');
            fetchTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add remark');
        }
    };

    const handleUpdateStatus = async (testId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status updated successfully');
            fetchTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        }
    };

    const handleSubmitRating = async (testId) => {
        if (!rating || rating < 1 || rating > 10) {
            toast.error('Please enter a rating between 1 and 10');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}`,
                { finalRating: parseInt(rating), status: 'completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Rating submitted successfully');
            setRating('');
            fetchTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit rating');
        }
    };

    const filteredTests = tests.filter(test => {
        if (filter === 'all') return true;
        return test.status === filter;
    });

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'status-pending',
            'in-progress': 'status-progress',
            'completed': 'status-completed'
        };
        return badges[status] || 'status-pending';
    };

    if (loading) {
        return (
            <div className="container climate-tests-page">
                <div className="loading-spinner">Loading climate tests...</div>
            </div>
        );
    }

    return (
        <div className="container climate-tests-page">
            <div className="climate-header">
                <h2 className="section-title" style={{ color: '#C5A059' }}>Climate Testing</h2>
                <p className="subtitle">Track your assigned perfume tests and provide feedback</p>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Tests ({tests.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({tests.filter(t => t.status === 'pending').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                    onClick={() => setFilter('in-progress')}
                >
                    In Progress ({tests.filter(t => t.status === 'in-progress').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({tests.filter(t => t.status === 'completed').length})
                </button>
            </div>

            {filteredTests.length === 0 ? (
                <div className="glass-card no-tests">
                    <p>No climate tests found for this filter.</p>
                </div>
            ) : (
                <div className="tests-grid">
                    {filteredTests.map(test => (
                        <div key={test._id} className="glass-card test-card">
                            <div className="test-header" onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}>
                                {test.perfumeImage && (
                                    <img src={test.perfumeImage} alt={test.perfumeName} className="test-perfume-img" />
                                )}
                                <div className="test-info">
                                    <h3>{test.perfumeName}</h3>
                                    <p className="test-climate">Climate: {test.climate}</p>
                                    <span className={`status-badge ${getStatusBadge(test.status)}`}>
                                        {test.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="expand-icon">{expandedTest === test._id ? '▼' : '▶'}</div>
                            </div>

                            {expandedTest === test._id && (
                                <div className="test-details">
                                    <div className="test-dates">
                                        <p><strong>Started:</strong> {new Date(test.startDate).toLocaleDateString()}</p>
                                        {test.endDate && (
                                            <p><strong>Target End:</strong> {new Date(test.endDate).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    {test.status !== 'completed' && (
                                        <div className="status-controls">
                                            <label>Update Status:</label>
                                            <div className="status-buttons">
                                                {test.status === 'pending' && (
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => handleUpdateStatus(test._id, 'in-progress')}
                                                    >
                                                        Start Testing
                                                    </button>
                                                )}
                                                {test.status === 'in-progress' && (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleUpdateStatus(test._id, 'completed')}
                                                    >
                                                        Mark as Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="remarks-section">
                                        <h4>Feedback & Remarks</h4>
                                        {test.remarks && test.remarks.length > 0 ? (
                                            <div className="remarks-list">
                                                {test.remarks.map((remark, idx) => (
                                                    <div key={idx} className="remark-item">
                                                        <p className="remark-text">{remark.text}</p>
                                                        <p className="remark-meta">
                                                            {remark.author} - {new Date(remark.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-remarks">No remarks yet</p>
                                        )}

                                        {test.status !== 'completed' && (
                                            <div className="add-remark">
                                                <textarea
                                                    placeholder="Add your feedback or observations..."
                                                    value={remarkText}
                                                    onChange={(e) => setRemarkText(e.target.value)}
                                                    rows="3"
                                                />
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleAddRemark(test._id)}
                                                >
                                                    Add Remark
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {test.status === 'in-progress' && (
                                        <div className="rating-section">
                                            <h4>Final Rating</h4>
                                            <div className="rating-input">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    placeholder="Rate 1-10"
                                                    value={rating}
                                                    onChange={(e) => setRating(e.target.value)}
                                                />
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleSubmitRating(test._id)}
                                                >
                                                    Submit Rating & Complete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {test.finalRating && (
                                        <div className="final-rating">
                                            <strong>Final Rating:</strong> {test.finalRating}/10
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClimateTests;
