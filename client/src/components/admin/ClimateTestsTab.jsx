import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { isRequired, isValidUrl, isValidFragranticaUrl } from '../../utils/validation';
import { TableRowSkeleton } from '../LoadingSkeleton';

const ClimateTestsTab = () => {
    const [climateTests, setClimateTests] = useState([]);
    const [testers, setTesters] = useState([]);
    const [climateTestForm, setClimateTestForm] = useState({
        perfumeName: '', perfumeImage: '', testerId: '', climate: 'Room Temperature', endDate: '', brand: ''
    });
    const [selectedTest, setSelectedTest] = useState(null);
    const [climateScrapeUrl, setClimateScrapeUrl] = useState('');
    const [isClimateScraping, setIsClimateScraping] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const token = localStorage.getItem('token');
                const [testsRes, testersRes] = await Promise.all([
                    axios.get(`${API_URL}/api/climate-tests`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/admin/testers`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setClimateTests(testsRes.data);
                setTesters(testersRes.data);
            });
        } catch (err) {
            handleError(err, 'Failed to load climate tests data');
        } finally {
            setIsFetching(false);
        }
    };

    const handleClimateTestSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!isRequired(climateTestForm.perfumeName)) return toast.error("Perfume Name is required");
        if (!isRequired(climateTestForm.testerId)) return toast.error("Tester is required");

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/climate-tests`, climateTestForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Climate test created successfully!');
            setClimateTestForm({ perfumeName: '', perfumeImage: '', testerId: '', climate: 'Room Temperature', endDate: '', brand: '' });
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to create climate test');
        }
    };

    const handleDeleteClimateTest = async (testId) => {
        if (!window.confirm('Delete this climate test?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/climate-tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Climate test deleted');
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to delete climate test');
        }
    };

    const handleMarkInReview = async (testId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/review`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test marked as in-review');
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to mark as in-review');
        }
    };

    const handleApproveTest = async (testId) => {
        if (!window.confirm('Approve this climate test?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test approved successfully');
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to approve test');
        }
    };

    const handleRejectTest = async (testId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/reject`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test rejected');
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to reject test');
        }
    };

    const handleClimateScrape = async () => {
        if (!isRequired(climateScrapeUrl)) {
            return toast.error("Please paste a Fragrantica link first!");
        }
        if (!isValidFragranticaUrl(climateScrapeUrl)) {
            return toast.error("Please enter a valid Fragrantica URL");
        }

        setIsClimateScraping(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/scrape`,
                { url: climateScrapeUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setClimateTestForm({
                ...climateTestForm,
                perfumeName: res.data.name || '',
                perfumeImage: res.data.image || '',
                brand: res.data.brand || ''
            });
            toast.success('Auto-filled from Fragrantica!');
            setClimateScrapeUrl('');
        } catch (error) {
            handleError(error, 'Failed to scrape data');
        } finally {
            setIsClimateScraping(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'status-pending',
            'in-progress': 'status-progress',
            'submitted': 'status-submitted',
            'in-review': 'status-review',
            'success': 'status-success',
            'failed': 'status-failed',
            'expired': 'status-expired'
        };
        return badges[status] || 'status-pending';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'PENDING',
            'in-progress': 'IN PROGRESS',
            'submitted': 'SUBMITTED',
            'in-review': 'IN REVIEW',
            'success': 'APPROVED',
            'failed': 'REJECTED',
            'expired': 'EXPIRED'
        };
        return labels[status] || status.toUpperCase();
    };



    // ... existing functions ...

    return (
        <div className="glass-card form-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* ... existing form ... */}
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Climate Testing Management</h3>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
                <h4 style={{ marginBottom: '20px', color: '#333' }}>Create New Climate Test</h4>

                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                    <h5 style={{ marginBottom: '10px', color: '#C5A059', fontSize: '0.95rem' }}>🔗 Auto-Fill from Fragrantica</h5>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Paste Fragrantica URL here..."
                            value={climateScrapeUrl}
                            onChange={(e) => setClimateScrapeUrl(e.target.value)}
                            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button
                            type="button"
                            className="btn-gold"
                            onClick={handleClimateScrape}
                            disabled={isClimateScraping}
                            style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}
                        >
                            {isClimateScraping ? "Fetching..." : "Auto-Fill"}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleClimateTestSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Perfume Name</label>
                            <input
                                placeholder="Perfume Name"
                                value={climateTestForm.perfumeName}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Brand</label>
                            <input
                                placeholder="Brand"
                                value={climateTestForm.brand}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, brand: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Perfume Image URL</label>
                        <input
                            placeholder="Perfume Image URL"
                            value={climateTestForm.perfumeImage}
                            onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeImage: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Tester</label>
                            <select
                                value={climateTestForm.testerId}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, testerId: e.target.value })}
                                required
                            >
                                <option value="">Select Tester</option>
                                {testers.map(t => (
                                    <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Climate Conditions</label>
                            <input
                                placeholder="Climate Conditions"
                                value={climateTestForm.climate}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, climate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Target End Date</label>
                        <input
                            type="date"
                            value={climateTestForm.endDate}
                            onChange={(e) => setClimateTestForm({ ...climateTestForm, endDate: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-gold">Create Climate Test</button>
                </form>
            </div>

            <h4>All Climate Tests</h4>
            <div className="orders-table-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Perfume</th>
                            <th>Brand</th>
                            <th>Tester</th>
                            <th>Climate</th>
                            <th>Status</th>
                            <th>Rating</th>
                            <th>Recommendation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <TableRowSkeleton rows={5} columns={8} />
                        ) : (
                            climateTests.map(test => (
                                <tr key={test._id}>
                                    <td>{test.perfumeName}</td>
                                    <td>{test.brand || '-'}</td>
                                    <td>{test.testerName}</td>
                                    <td>{test.climate}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(test.status)}`}>
                                            {getStatusLabel(test.status)}
                                        </span>
                                    </td>
                                    <td>{test.finalRating ? `${test.finalRating}/10` : '-'}</td>
                                    <td>
                                        {test.recommendation ? (
                                            <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                                {test.recommendation.replace(/-/g, ' ')}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.75rem', backgroundColor: '#333', color: 'white' }}
                                                onClick={() => setSelectedTest(test)}
                                            >
                                                View Details
                                            </button>
                                            {test.status === 'submitted' && (
                                                <>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleMarkInReview(test._id)}
                                                    >
                                                        Review
                                                    </button>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleApproveTest(test._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleRejectTest(test._id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {test.status === 'in-review' && (
                                                <>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleApproveTest(test._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleRejectTest(test._id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="delete-btn"
                                                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                onClick={() => handleDeleteClimateTest(test._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL */}
            {selectedTest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{
                        width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                        position: 'relative', background: 'white', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <button
                            onClick={() => setSelectedTest(null)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>

                        <h3 style={{ color: '#C5A059', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Test Details: {selectedTest.perfumeName}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <h5 style={{ color: '#666', marginBottom: '5px' }}>Tester</h5>
                                <p style={{ color: '#333' }}>{selectedTest.testerName}</p>
                            </div>
                            <div>
                                <h5 style={{ color: '#666', marginBottom: '5px' }}>Status</h5>
                                <span className={`status-badge ${getStatusBadge(selectedTest.status)}`}>
                                    {getStatusLabel(selectedTest.status)}
                                </span>
                            </div>
                            <div>
                                <h5 style={{ color: '#666', marginBottom: '5px' }}>Start Date</h5>
                                <p style={{ color: '#333' }}>{new Date(selectedTest.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h5 style={{ color: '#666', marginBottom: '5px' }}>End Date</h5>
                                <p style={{ color: '#333' }}>{selectedTest.endDate ? new Date(selectedTest.endDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#C5A059', marginBottom: '10px' }}>Testing Conditions</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                                {selectedTest.testingConditions && Object.entries(selectedTest.testingConditions).map(([key, value]) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: value ? '#4CAF50' : '#f44336' }}></div>
                                        <span style={{ textTransform: 'capitalize', color: '#333' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#C5A059', marginBottom: '10px' }}>Observations</h4>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <h5 style={{ color: '#666', fontSize: '0.9rem' }}>Heat Effect</h5>
                                    <p style={{ color: '#333' }}>{selectedTest.climateObservations?.heatEffect || 'No observation'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: '#666', fontSize: '0.9rem' }}>Humidity Effect</h5>
                                    <p style={{ color: '#333' }}>{selectedTest.climateObservations?.humidityEffect || 'No observation'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: '#666', fontSize: '0.9rem' }}>Cloying Effect</h5>
                                    <p style={{ color: '#333' }}>{selectedTest.climateObservations?.cloyingEffect || 'No observation'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: '#666', fontSize: '0.9rem' }}>Comparison to Temperate</h5>
                                    <p style={{ color: '#333' }}>{selectedTest.climateObservations?.temperateComparison || 'No observation'}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#C5A059', marginBottom: '10px' }}>Final Verdict</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <div>
                                    <h5 style={{ color: '#666' }}>Rating</h5>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{selectedTest.finalRating ? `${selectedTest.finalRating}/10` : 'N/A'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: '#666' }}>Recommendation</h5>
                                    <p style={{ fontSize: '1.2rem', textTransform: 'capitalize', color: '#333' }}>
                                        {selectedTest.recommendation ? selectedTest.recommendation.replace(/-/g, ' ') : 'N/A'}
                                    </p>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <h5 style={{ color: '#666' }}>Customer Notes</h5>
                                    <p style={{ fontStyle: 'italic', color: '#333' }}>"{selectedTest.customerNotes || 'No notes provided'}"</p>
                                </div>
                            </div>
                        </div>

                        {selectedTest.rejectionReason && (
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: '8px' }}>
                                <h5 style={{ color: '#f44336', marginBottom: '5px' }}>Rejection Reason</h5>
                                <p style={{ color: '#c0392b' }}>{selectedTest.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClimateTestsTab;
