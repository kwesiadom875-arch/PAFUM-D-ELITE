import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import API_URL from '../../config';
import { handleError } from '../../utils/errorHandler';

const ScentIntelTab = ({ onEnrichComplete }) => {
    const [enrichStatus, setEnrichStatus] = useState('');

    const handleBatchEnrich = async () => {
        if (!window.confirm("This will use AI to enrich all products. Continue?")) return;
        setEnrichStatus('Enriching... This may take a minute.');
        try {
            const res = await axios.post(`${API_URL}/api/ai/enrich-all-products`);
            console.log("Enrichment Response:", res.data);
            if (res.data && res.data.results) {
                setEnrichStatus(`Success! ${res.data.results.length} products enriched.`);
            } else {
                setEnrichStatus('Enrichment completed, but no results returned.');
            }
            if (onEnrichComplete) onEnrichComplete();
        } catch (error) {
            handleError(error, "Failed to enrich products");
            setEnrichStatus('Failed to enrich products. Check console for details.');
        }
    };

    return (
        <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Scent Intel AI Enrichment</h3>
            <p style={{ marginBottom: '30px', color: '#666' }}>
                Use our AI to automatically analyze all products in the inventory and populate missing metadata:
                <br /><strong>Brand, Concentration, Gender, Origin, Season, and more.</strong>
            </p>
            <div style={{ padding: '30px', background: '#f5f5f5', borderRadius: '12px', border: '1px dashed #C5A059' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠 ✨</h1>
                <button
                    className="btn-primary"
                    onClick={handleBatchEnrich}
                    disabled={enrichStatus.includes('Enriching')}
                    style={{ fontSize: '1.2rem', padding: '15px 40px' }}
                >
                    {enrichStatus.includes('Enriching') ? 'AI is Working...' : 'Run Batch Enrichment'}
                </button>
                {enrichStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #C5A059' }}>
                        <strong>Status:</strong> {enrichStatus}
                    </div>
                )}
            </div>
        </div>
    );
};

ScentIntelTab.propTypes = {
    onEnrichComplete: PropTypes.func
};

export default ScentIntelTab;
