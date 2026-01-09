import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { toast } from 'react-toastify';
import './ClimateTests.css';

const ClimateTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedTest, setExpandedTest] = useState(null);
    const [remarkText, setRemarkText] = useState('');

    // Form state for evaluation
    const [formData, setFormData] = useState({});

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

    const initializeFormData = (testId, test) => {
        if (!formData[testId]) {
            setFormData(prev => ({
                ...prev,
                [testId]: {
                    testingConditions: test.testingConditions || {
                        indoorAC: false,
                        indoorNoAC: false,
                        outdoorMorning: false,
                        outdoorAfternoon: false,
                        outdoorEvening: false
                    },
                    climateObservations: test.climateObservations || {
                        heatEffect: '',
                        humidityEffect: '',
                        cloyingEffect: '',
                        temperateComparison: ''
                    },
                    recommendation: test.recommendation || '',
                    customerNotes: test.customerNotes || '',
                    finalRating: test.finalRating || ''
                }
            }));
        }
    };

    const handleFormChange = (testId, section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [testId]: {
                ...prev[testId],
                [section]: typeof prev[testId]?.[section] === 'object' && section !== 'recommendation'
                    ? { ...prev[testId][section], [field]: value }
                    : value
            }
        }));
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

    const validateForm = (testId) => {
        const data = formData[testId];
        if (!data) return false;

        // Check at least one testing condition is selected
        const hasCondition = Object.values(data.testingConditions || {}).some(v => v === true);
        if (!hasCondition) {
            toast.error('Please select at least one testing condition');
            return false;
        }

        // Check all climate observations are filled
        const observations = data.climateObservations || {};
        if (!observations.heatEffect?.trim() || !observations.humidityEffect?.trim() ||
            !observations.cloyingEffect?.trim() || !observations.temperateComparison?.trim()) {
            toast.error('Please complete all climate-specific observations');
            return false;
        }

        // Check recommendation is selected
        if (!data.recommendation) {
            toast.error('Please select a recommendation');
            return false;
        }

        // Check final rating
        if (!data.finalRating || data.finalRating < 1 || data.finalRating > 10) {
            toast.error('Please provide a rating between 1 and 10');
            return false;
        }

        return true;
    };

    const handleSubmitForReview = async (testId) => {
        if (!validateForm(testId)) return;

        try {
            const token = localStorage.getItem('token');
            const data = formData[testId];

            await axios.put(
                `${API_URL}/api/climate-tests/${testId}`,
                {
                    status: 'submitted',
                    testingConditions: data.testingConditions,
                    climateObservations: data.climateObservations,
                    recommendation: data.recommendation,
                    customerNotes: data.customerNotes,
                    finalRating: parseInt(data.finalRating)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test submitted for review successfully');
            fetchTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit test');
        }
    };

    const handleSaveProgress = async (testId) => {
        try {
            const token = localStorage.getItem('token');
            const data = formData[testId];

            await axios.put(
                `${API_URL}/api/climate-tests/${testId}`,
                {
                    testingConditions: data.testingConditions,
                    climateObservations: data.climateObservations,
                    recommendation: data.recommendation,
                    customerNotes: data.customerNotes,
                    finalRating: data.finalRating ? parseInt(data.finalRating) : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Progress saved');
            fetchTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save progress');
        }
    };

    const filteredTests = tests.filter(test => {
        if (filter === 'all') return true;
        if (filter === 'completed') return ['submitted', 'in-review', 'success', 'failed'].includes(test.status);
        return test.status === filter;
    });

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
                <h2 className="section-title" style={{ color: '#C5A059' }}>Climate Testing Evaluation</h2>
                <p className="subtitle">Complete comprehensive fragrance testing under various climate conditions</p>
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
                    Completed ({tests.filter(t => ['submitted', 'in-review', 'success', 'failed'].includes(t.status)).length})
                </button>
            </div>

            {filteredTests.length === 0 ? (
                <div className="glass-card no-tests">
                    <p>No climate tests found for this filter.</p>
                </div>
            ) : (
                <div className="tests-grid">
                    {filteredTests.map(test => {
                        const isExpanded = expandedTest === test._id;
                        const isEditable = test.status === 'in-progress';
                        const isReadOnly = ['submitted', 'in-review', 'success', 'failed', 'expired'].includes(test.status);

                        if (isExpanded && !formData[test._id]) {
                            initializeFormData(test._id, test);
                        }

                        return (
                            <div key={test._id} className="glass-card test-card">
                                <div className="test-header" onClick={() => setExpandedTest(isExpanded ? null : test._id)}>
                                    {test.perfumeImage && (
                                        <img src={test.perfumeImage} alt={test.perfumeName} className="test-perfume-img" />
                                    )}
                                    <div className="test-info">
                                        <h3>{test.perfumeName}</h3>
                                        {test.brand && <p className="test-brand">Brand: {test.brand}</p>}
                                        <p className="test-climate">Climate: {test.climate}</p>
                                        <span className={`status-badge ${getStatusBadge(test.status)}`}>
                                            {getStatusLabel(test.status)}
                                        </span>
                                    </div>
                                    <div className="expand-icon">{isExpanded ? '▼' : '▶'}</div>
                                </div>

                                {isExpanded && (
                                    <div className="test-details">
                                        <div className="test-dates">
                                            <p><strong>Date Started:</strong> {new Date(test.startDate).toLocaleDateString()}</p>
                                            <p><strong>Tester:</strong> {test.testerName}</p>
                                            {test.endDate && (
                                                <p><strong>Target End:</strong> {new Date(test.endDate).toLocaleDateString()}</p>
                                            )}
                                        </div>

                                        {/* Start Testing Button */}
                                        {test.status === 'pending' && (
                                            <div className="status-controls">
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleUpdateStatus(test._id, 'in-progress')}
                                                >
                                                    Start Testing
                                                </button>
                                            </div>
                                        )}

                                        {/* Evaluation Form - Only show if in-progress or completed */}
                                        {(isEditable || isReadOnly) && formData[test._id] && (
                                            <div className="evaluation-form">
                                                <h3 className="form-section-title">Appendix D: Climate Testing Evaluation Form</h3>

                                                {/* Testing Conditions */}
                                                <div className="form-section">
                                                    <h4>Testing Conditions:</h4>
                                                    <div className="checkbox-group">
                                                        {[
                                                            { key: 'indoorAC', label: 'Indoor (air-conditioned)' },
                                                            { key: 'indoorNoAC', label: 'Indoor (no AC)' },
                                                            { key: 'outdoorMorning', label: 'Outdoor (morning)' },
                                                            { key: 'outdoorAfternoon', label: 'Outdoor (afternoon)' },
                                                            { key: 'outdoorEvening', label: 'Outdoor (evening)' }
                                                        ].map(condition => (
                                                            <label key={condition.key} className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData[test._id]?.testingConditions?.[condition.key] || false}
                                                                    onChange={(e) => handleFormChange(test._id, 'testingConditions', condition.key, e.target.checked)}
                                                                    disabled={isReadOnly}
                                                                />
                                                                <span>{condition.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Climate-Specific Observations */}
                                                <div className="form-section">
                                                    <h4>Climate-Specific Observations:</h4>
                                                    <div className="observations-group">
                                                        <div className="observation-item">
                                                            <label>Does heat amplify or diminish the scent?</label>
                                                            <textarea
                                                                value={formData[test._id]?.climateObservations?.heatEffect || ''}
                                                                onChange={(e) => handleFormChange(test._id, 'climateObservations', 'heatEffect', e.target.value)}
                                                                placeholder="Describe how heat affects the fragrance..."
                                                                rows="2"
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                        <div className="observation-item">
                                                            <label>Does humidity affect longevity?</label>
                                                            <textarea
                                                                value={formData[test._id]?.climateObservations?.humidityEffect || ''}
                                                                onChange={(e) => handleFormChange(test._id, 'climateObservations', 'humidityEffect', e.target.value)}
                                                                placeholder="Describe humidity's impact on longevity..."
                                                                rows="2"
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                        <div className="observation-item">
                                                            <label>Does it become cloying or overwhelming?</label>
                                                            <textarea
                                                                value={formData[test._id]?.climateObservations?.cloyingEffect || ''}
                                                                onChange={(e) => handleFormChange(test._id, 'climateObservations', 'cloyingEffect', e.target.value)}
                                                                placeholder="Note any overwhelming characteristics..."
                                                                rows="2"
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                        <div className="observation-item">
                                                            <label>How does it compare to temperate climate performance?</label>
                                                            <textarea
                                                                value={formData[test._id]?.climateObservations?.temperateComparison || ''}
                                                                onChange={(e) => handleFormChange(test._id, 'climateObservations', 'temperateComparison', e.target.value)}
                                                                placeholder="Compare with temperate climate performance..."
                                                                rows="2"
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recommendation */}
                                                <div className="form-section">
                                                    <h4>Recommendation:</h4>
                                                    <div className="radio-group">
                                                        <label className="radio-card">
                                                            <input
                                                                type="radio"
                                                                name={`recommendation-${test._id}`}
                                                                value="add-excellent"
                                                                checked={formData[test._id]?.recommendation === 'add-excellent'}
                                                                onChange={(e) => handleFormChange(test._id, 'recommendation', null, e.target.value)}
                                                                disabled={isReadOnly}
                                                            />
                                                            <div className="radio-content">
                                                                <strong>Add to collection</strong>
                                                                <span>(performs excellently)</span>
                                                            </div>
                                                        </label>
                                                        <label className="radio-card">
                                                            <input
                                                                type="radio"
                                                                name={`recommendation-${test._id}`}
                                                                value="add-caution"
                                                                checked={formData[test._id]?.recommendation === 'add-caution'}
                                                                onChange={(e) => handleFormChange(test._id, 'recommendation', null, e.target.value)}
                                                                disabled={isReadOnly}
                                                            />
                                                            <div className="radio-content">
                                                                <strong>Add with caution notes</strong>
                                                                <span>(performs well with considerations)</span>
                                                            </div>
                                                        </label>
                                                        <label className="radio-card">
                                                            <input
                                                                type="radio"
                                                                name={`recommendation-${test._id}`}
                                                                value="do-not-add"
                                                                checked={formData[test._id]?.recommendation === 'do-not-add'}
                                                                onChange={(e) => handleFormChange(test._id, 'recommendation', null, e.target.value)}
                                                                disabled={isReadOnly}
                                                            />
                                                            <div className="radio-content">
                                                                <strong>Do not add</strong>
                                                                <span>(performance issues in our climate)</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Customer Communication Notes */}
                                                <div className="form-section">
                                                    <h4>Customer Communication Notes:</h4>
                                                    <textarea
                                                        value={formData[test._id]?.customerNotes || ''}
                                                        onChange={(e) => handleFormChange(test._id, 'customerNotes', null, e.target.value)}
                                                        placeholder="Notes for customer communication..."
                                                        rows="4"
                                                        disabled={isReadOnly}
                                                        className="full-width-textarea"
                                                    />
                                                </div>

                                                {/* Final Rating */}
                                                <div className="form-section">
                                                    <h4>Final Rating (1-10):</h4>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={formData[test._id]?.finalRating || ''}
                                                        onChange={(e) => handleFormChange(test._id, 'finalRating', null, e.target.value)}
                                                        placeholder="Rate 1-10"
                                                        disabled={isReadOnly}
                                                        className="rating-input"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                {isEditable && (
                                                    <div className="form-actions">
                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() => handleSaveProgress(test._id)}
                                                        >
                                                            Save Progress
                                                        </button>
                                                        <button
                                                            className="btn-primary"
                                                            onClick={() => handleSubmitForReview(test._id)}
                                                        >
                                                            Submit for Review
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Remarks Section */}
                                        <div className="remarks-section">
                                            <h4>Additional Feedback & Remarks</h4>
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
                                                <p className="no-remarks">No additional remarks yet</p>
                                            )}

                                            {!isReadOnly && (
                                                <div className="add-remark">
                                                    <textarea
                                                        placeholder="Add additional feedback or observations..."
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
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClimateTests;
