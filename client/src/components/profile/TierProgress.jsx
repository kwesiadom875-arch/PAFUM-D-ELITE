import React from 'react';
import PropTypes from 'prop-types';

const TierProgress = ({ loyaltyInfo }) => {
    if (!loyaltyInfo) return null;

    const { nextTier, nextThreshold, progress, currentSpending } = loyaltyInfo;
    const spendNeeded = nextThreshold - currentSpending;

    return (
        <div className="progress-container">
            {nextTier !== 'Max Tier' ? (
                <div className="progress-text">
                    <span>Current Spend: <strong>GH₵{currentSpending.toLocaleString()}</strong></span>
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
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

TierProgress.propTypes = {
    loyaltyInfo: PropTypes.shape({
        nextTier: PropTypes.string,
        nextThreshold: PropTypes.number,
        progress: PropTypes.string,
        currentSpending: PropTypes.number
    })
};

export default TierProgress;
