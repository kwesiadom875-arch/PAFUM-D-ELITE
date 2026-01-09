import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const OrderHistorySection = ({ orders }) => {
    return (
        <div className="history-section">
            <div className="history-header">
                <h3>My Scent Collection</h3>
                <Link to="/wishlist" className="btn-outline">My Wishlist</Link>
            </div>
            <div className="history-grid">
                {orders.length === 0 ? (
                    <p className="no-orders">No perfumes collected yet. Start your journey.</p>
                ) : (
                    orders.map((order, i) => (
                        <div key={i} className="history-card">
                            {order.negotiated && <span className="negotiated-badge">💎 Negotiated</span>}
                            <div className="history-img">
                                <img src={order.productImage || "https://via.placeholder.com/100"} alt="perfume" />
                            </div>
                            <div className="history-info">
                                <h4>{order.productName}</h4>
                                <div className="price-row">
                                    {order.negotiated && <span className="old-price">GH₵{order.originalPrice}</span>}
                                    <span className="paid-price">GH₵{order.finalPrice}</span>
                                </div>
                                <span className="status-badge">Delivered</span>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                                    {new Date(order.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

OrderHistorySection.propTypes = {
    orders: PropTypes.arrayOf(PropTypes.shape({
        negotiated: PropTypes.bool,
        productImage: PropTypes.string,
        productName: PropTypes.string,
        originalPrice: PropTypes.number,
        finalPrice: PropTypes.number,
        date: PropTypes.string
    }))
};

OrderHistorySection.defaultProps = {
    orders: []
};

export default OrderHistorySection;
