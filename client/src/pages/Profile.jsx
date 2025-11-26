import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './Profile.css';
import { FaCrown, FaHistory, FaWallet } from 'react-icons/fa';
import RecommendedProducts from '../components/RecommendedProducts';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return (window.location.href = '/login');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const userRes = await axios.get(`${API_URL}/api/user/profile`, config);
        setUser(userRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="profile-page"><div className="profile-loading">Loading Elite Status...</div></div>;
  if (!user) return <div className="profile-page"><div className="profile-loading">Please Log In.</div></div>;

  // --- TIER LOGIC ---
  const spending = user.spending || 0;
  let nextTier = '';
  let spendNeeded = 0;
  let progressPercent = 0;
  let currentDiscount = '0%';
  let tierColorClass = 'card-bronze';

  if (spending < 3000) {
    nextTier = 'Gold';
    spendNeeded = 3000 - spending;
    progressPercent = (spending / 3000) * 100;
    currentDiscount = '5%';
    tierColorClass = 'card-bronze';
  } else if (spending < 7000) {
    nextTier = 'Platinum';
    spendNeeded = 7000 - spending;
    progressPercent = ((spending - 3000) / 4000) * 100;
    currentDiscount = '10%';
    tierColorClass = 'card-gold';
  } else if (spending < 10000) {
    nextTier = 'Diamond';
    spendNeeded = 10000 - spending;
    progressPercent = ((spending - 7000) / 3000) * 100;
    currentDiscount = '15%';
    tierColorClass = 'card-platinum';
  } else if (spending < 15000) {
    nextTier = 'Elite Diamond';
    spendNeeded = 15000 - spending;
    progressPercent = ((spending - 10000) / 5000) * 100;
    currentDiscount = '20%';
    tierColorClass = 'card-diamond';
  } else {
    nextTier = 'Max Level';
    spendNeeded = 0;
    progressPercent = 100;
    currentDiscount = '25%';
    tierColorClass = 'card-elite-diamond';
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
    <div className="profile-page">
      <div className="profile-dashboard">

        <h2 className="section-title">The Elite Circle</h2>

        {/* 1. THE DIGITAL BLACK CARD */}
        <div className="membership-card-container">
          <div className={`member-card ${tierColorClass}`}>
            <div className="card-top">
              <span className="card-brand">PARFUM D'ELITE</span>
              <span className="card-tier">{user.tier || 'Bronze'} MEMBER</span>
            </div>
            <div className="card-chip">
              <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" alt="chip" />
            </div>
            <div className="card-details">
              <div className="card-holder">
                <span className="label">Member Name</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="card-since">
                <span className="label">Member Since</span>
                <span className="value">{new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ASCENSION PROGRESS */}
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

        {/* 3. STATS ROW */}
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

        {/* 5. GAMIFICATION */}
        <div className="gamification-section">
          <h3>Your Status</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <h4>Points</h4>
              <p>{user.points || 0}</p>
            </div>
            <div className="stat-box">
              <h4>Badges</h4>
              <div className="badges-grid">
                {user.badges && user.badges.length > 0 ? (
                  user.badges.map((badge, i) => (
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

        {/* 4. MY SCENT COLLECTION (History) */}
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

        <RecommendedProducts userId={user._id} />

      </div>
    </div>
  );
};

export default Profile;
