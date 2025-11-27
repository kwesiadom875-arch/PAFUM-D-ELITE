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

    return (
        <div className="glass-card form-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Climate Testing Management</h3>

            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h4>Create New Climate Test</h4>

                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                    <h5 style={{ marginBottom: '10px', color: '#C5A059', fontSize: '0.95rem' }}>🔗 Auto-Fill from Fragrantica</h5>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Paste Fragrantica URL here..."
                            value={climateScrapeUrl}
                            onChange={(e) => setClimateScrapeUrl(e.target.value)}
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClimateScrape}
                            disabled={isClimateScraping}
                            style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}
                        >
                            {isClimateScraping ? "Fetching..." : "Auto-Fill"}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleClimateTestSubmit} style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                            placeholder="Perfume Name"
                            value={climateTestForm.perfumeName}
                            onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeName: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Brand"
                            value={climateTestForm.brand}
                            onChange={(e) => setClimateTestForm({ ...climateTestForm, brand: e.target.value })}
                        />
                    </div>
                    <input
                        placeholder="Perfume Image URL"
                        value={climateTestForm.perfumeImage}
                        onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeImage: e.target.value })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                        <input
                            placeholder="Climate Conditions"
                            value={climateTestForm.climate}
                            onChange={(e) => setClimateTestForm({ ...climateTestForm, climate: e.target.value })}
                        />
                    </div>
                    <input
                        type="date"
                        placeholder="Target End Date"
                        value={climateTestForm.endDate}
                        onChange={(e) => setClimateTestForm({ ...climateTestForm, endDate: e.target.value })}
                    />
                    <button type="submit" className="btn-primary">Create Climate Test</button>
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
                                            {test.status === 'submitted' && (
                                                <>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                        onClick={() => handleMarkInReview(test._id)}
                                                    >
                                                        Mark In Review
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
        </div>
    );
};

export default ClimateTestsTab;
