import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/api/user/profile`, {
                    headers: { Authorization: token }
                });
                setUser(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading Profile...</div>;
    if (!user) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Please log in.</div>;

    // --- TIER LOGIC ---
    const spending = user.spending || 0;
    let nextTier = '';
    let spendNeeded = 0;
    let progressPercent = 0;
    let currentDiscount = '0%';

    if (spending < 3000) {
        nextTier = 'Gold';
        spendNeeded = 3000 - spending;
        progressPercent = (spending / 3000) * 100;
        currentDiscount = '0%';
    } else if (spending < 7000) {
        nextTier = 'Platinum';
        spendNeeded = 7000 - spending;
        progressPercent = ((spending - 3000) / 4000) * 100;
        currentDiscount = '10%';
    } else if (spending < 10000) {
        nextTier = 'Diamond';
        spendNeeded = 10000 - spending;
        progressPercent = ((spending - 7000) / 3000) * 100;
        currentDiscount = '15%';
    } else if (spending < 15000) {
        nextTier = 'Elite Diamond';
        spendNeeded = 15000 - spending;
        progressPercent = ((spending - 10000) / 5000) * 100;
        currentDiscount = '20%';
    } else {
        nextTier = 'Max Level';
        spendNeeded = 0;
        progressPercent = 100;
        currentDiscount = '25%';
    }

    // Total Saved Calculation
    const orders = user.orderHistory || [];
    const totalSaved = orders.reduce((acc, order) => {
        if (order.originalPrice && order.finalPrice) {
            return acc + (order.originalPrice - order.finalPrice);
        }
        return acc;
    }, 0);

    return (
        <div className="profile-container">

            {/* SECTION A: DIGITAL BLACK CARD */}
            <div className="membership-card-container">
                <div className="membership-card">
                    <div className="card-header">
                        <div className="card-logo">Parfum D'Elite</div>
                        <div className="card-chip"></div>
                    </div>

                    <div className="card-details">
                        <div className="member-name">{user.username || 'Valued Member'}</div>
                        <div className="member-tier">{user.tier || 'Bronze'} Status</div>
                        <div className="member-since">
                            Member Since {new Date(user.createdAt).getFullYear()}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION B: ASCENSION PROGRESS */}
            <div className="ascension-section">
                {nextTier !== 'Max Level' ? (
                    <div className="ascension-text">
                        Spend <span className="text-gold">GH₵{spendNeeded.toLocaleString()}</span> more to unlock {nextTier} Status.
                    </div>
                ) : (
                    <div className="ascension-text text-gold">
                        🎉 You have reached the pinnacle of luxury - Elite Diamond Status!
                    </div>
                )}

                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* SECTION C: STATS ROW */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Invested</div>
                    <div className="stat-value">GH₵{spending.toLocaleString()}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Total Saved</div>
                    <div className="stat-value saved">GH₵{totalSaved.toLocaleString()}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Privilege Level</div>
                    <div className="stat-value">{currentDiscount} OFF</div>
                </div>
            </div>

            {/* SECTION D: SCENT COLLECTION (ORDER HISTORY) */}
            <div className="history-section">
                <h3 className="section-title">My Scent Collection</h3>

                {orders.length > 0 ? (
                    <div className="orders-grid">
                        {orders.map((order, index) => (
                            <div key={index} className="order-card">
                                {order.negotiated && <span className="negotiated-badge">💎 Negotiated</span>}
                                <img
                                    src={order.productImage || 'https://via.placeholder.com/300x200?text=Perfume'}
                                    alt={order.productName}
                                    className="order-image"
                                />
                                <div className="order-details">
                                    <div className="order-name">{order.productName}</div>
                                    <div className="order-date">
                                        Purchased on {new Date(order.date).toLocaleDateString()}
                                    </div>
                                    <div className="price-row">
                                        {order.negotiated && <span className="original-price">GH₵{order.originalPrice}</span>}
                                        <span className="final-price">GH₵{order.finalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                        <p>Your collection is currently empty.</p>
                        <p style={{ marginTop: '10px' }}>Visit the Collection to start your journey.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Profile;
