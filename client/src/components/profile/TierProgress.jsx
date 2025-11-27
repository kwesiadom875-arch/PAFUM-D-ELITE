import React from 'react';
import PropTypes from 'prop-types';

const TierProgress = ({ spending }) => {
    // Tier calculation logic
    let nextTier = '';
    let spendNeeded = 0;
    let progressPercent = 0;

    if (spending < 3000) {
        nextTier = 'Gold';
        spendNeeded = 3000 - spending;
        progressPercent = (spending / 3000) * 100;
    } else if (spending < 7000) {
        nextTier = 'Platinum';
        spendNeeded = 7000 - spending;
        progressPercent = ((spending - 3000) / 4000) * 100;
    } else if (spending < 10000) {
        nextTier = 'Diamond';
        spendNeeded = 10000 - spending;
        progressPercent = ((spending - 7000) / 3000) * 100;
    } else if (spending < 15000) {
        nextTier = 'Elite Diamond';
        spendNeeded = 15000 - spending;
        progressPercent = ((spending - 10000) / 5000) * 100;
    } else {
        nextTier = 'Max Level';
        spendNeeded = 0;
        progressPercent = 100;
    }

    return (
        <div className="progress-container">
            {nextTier !== 'Max Level' ? (
                <div className="progress-text">
                    <span>Current Spend: <strong>GH₵{spending.toLocaleString()}</strong></span>
                    <span>Unlock {nextTier}: <strong>GH₵{spendNeeded.toLocaleString()}</strong> left</span>
                </div>
            ) : (
                <div className="progress-text">
                    <span style={{ width: '100%', textAlign: 'center', color: '#C5A059' }}>
                        🎉 You have reached the pinnacle of luxury - Elite Diamond Status!
                    </span>
                </div>
            )}
            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
        </div>
    );
};

TierProgress.propTypes = {
    spending: PropTypes.number
};

TierProgress.defaultProps = {
    spending: 0
};

export default TierProgress;
