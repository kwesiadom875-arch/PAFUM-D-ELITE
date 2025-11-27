import React from 'react';
import PropTypes from 'prop-types';
import { FaCrown, FaHistory, FaWallet } from 'react-icons/fa';

const StatsGrid = ({ spending, orders, points, badges }) => {
    // Calculate current discount based on spending
    let currentDiscount = '0%';
    if (spending < 3000) {
        currentDiscount = '5%';
    } else if (spending < 7000) {
        currentDiscount = '10%';
    } else if (spending < 10000) {
        currentDiscount = '15%';
    } else if (spending < 15000) {
        currentDiscount = '20%';
    } else {
        currentDiscount = '25%';
    }

    // Calculate total saved
    const totalSaved = orders.reduce((acc, order) => {
        if (order.originalPrice && order.finalPrice) {
            return acc + (order.originalPrice - order.finalPrice);
        }
        return acc;
    }, 0);

    return (
        <>
            {/* Stats Row */}
            <div className="stats-grid">
                <div className="stat-box">
                    <FaWallet className="stat-icon" />
                    <h4>Total Invested</h4>
                    <p>GH₵{spending.toLocaleString()}</p>
                </div>
                <div className="stat-box highlight">
                    <FaCrown className="stat-icon" />
                    <h4>Total Saved</h4>
                    <p>GH₵{totalSaved.toLocaleString()}</p>
                </div>
                <div className="stat-box">
                    <FaHistory className="stat-icon" />
                    <h4>Privilege Level</h4>
                    <p>{currentDiscount} OFF</p>
                </div>
            </div>

            {/* Gamification Section */}
            <div className="gamification-section">
                <h3>Your Status</h3>
                <div className="stats-grid">
                    <div className="stat-box">
                        <h4>Points</h4>
                        <p>{points || 0}</p>
                    </div>
                    <div className="stat-box">
                        <h4>Badges</h4>
                        <div className="badges-grid">
                            {badges && badges.length > 0 ? (
                                badges.map((badge, i) => (
                                    <div key={i} className="badge">
                                        {badge.name}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999', fontSize: '0.9rem' }}>No badges yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

StatsGrid.propTypes = {
    spending: PropTypes.number,
    orders: PropTypes.arrayOf(PropTypes.shape({
        originalPrice: PropTypes.number,
        finalPrice: PropTypes.number
    })),
    points: PropTypes.number,
    badges: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
    }))
};

StatsGrid.defaultProps = {
    spending: 0,
    orders: [],
    points: 0,
    badges: []
};

export default StatsGrid;
