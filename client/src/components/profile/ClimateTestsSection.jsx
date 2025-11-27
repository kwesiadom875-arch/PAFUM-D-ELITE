import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { CardSkeleton } from '../LoadingSkeleton';

const ClimateTestsSection = ({ userId }) => {
    const [climateTests, setClimateTests] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchClimateTests();
        }
    }, [userId]);

    const fetchClimateTests = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const testsRes = await axios.get(`${API_URL}/api/climate-tests`, config);
                // Filter tests assigned to this user
                const myTests = testsRes.data.filter(test => test.testerId === userId);
                setClimateTests(myTests);
            });
        } catch (err) {
            handleError(err, 'Failed to fetch climate tests');
        } finally {
            setIsFetching(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { class: 'status-pending', label: 'PENDING' },
            'in-progress': { class: 'status-progress', label: 'IN PROGRESS' },
            'submitted': { class: 'status-submitted', label: 'SUBMITTED' },
            'in-review': { class: 'status-review', label: 'IN REVIEW' },
            'success': { class: 'status-success', label: 'APPROVED' },
            'failed': { class: 'status-failed', label: 'REJECTED' },
            'expired': { class: 'status-expired', label: 'EXPIRED' }
        };
        return badges[status] || { class: 'status-pending', label: status.toUpperCase() };
    };

    if (isFetching) {
        return (
            <div className="climate-tests-section">
                <div className="history-header">
                    <h3>My Climate Tests</h3>
                </div>
                <CardSkeleton count={3} />
            </div>
        );
    }

    if (climateTests.length === 0) return null;

    return (
        <div className="climate-tests-section">
            <div className="history-header">
                <h3>My Climate Tests</h3>
                <Link to="/climate-tests" className="btn-outline">View All Tests</Link>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-box">
                    <h4>Pending</h4>
                    <p>{climateTests.filter(t => t.status === 'pending').length}</p>
                </div>
                <div className="stat-box highlight">
                    <h4>Active</h4>
                    <p>{climateTests.filter(t => t.status === 'in-progress').length}</p>
                </div>
                <div className="stat-box">
                    <h4>Completed</h4>
                    <p>{climateTests.filter(t => ['submitted', 'in-review', 'success'].includes(t.status)).length}</p>
                </div>
            </div>

            {/* Test Cards */}
            <div className="history-grid">
                {climateTests.slice(0, 3).map((test) => {
                    const statusInfo = getStatusBadge(test.status);

                    return (
                        <div key={test._id} className="history-card">
                            <div className="history-img">
                                <img src={test.perfumeImage || "https://via.placeholder.com/100"} alt={test.perfumeName} />
                            </div>
                            <div className="history-info">
                                <h4>{test.perfumeName}</h4>
                                {test.brand && <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>{test.brand}</p>}
                                <p style={{ fontSize: '0.85rem', color: '#64B5F6', marginBottom: '8px' }}>
                                    Climate: {test.climate}
                                </p>
                                <span className={`status-badge ${statusInfo.class}`}>
                                    {statusInfo.label}
                                </span>
                                {test.finalRating && (
                                    <div style={{ fontSize: '0.85rem', color: '#C5A059', marginTop: '8px' }}>
                                        Rating: {test.finalRating}/10
                                    </div>
                                )}
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                                    Started: {new Date(test.startDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

ClimateTestsSection.propTypes = {
    userId: PropTypes.string
};

export default ClimateTestsSection;
