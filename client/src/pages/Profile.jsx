import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './Profile.css';
import { FaChip, FaCrown, FaHistory, FaWallet } from 'react-icons/fa'; // Install react-icons if needed

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return (window.location.href = '/login');

        const res = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Loading Elite Status...</div>;
  if (!user) return <div className="profile-loading">Please Log In.</div>;

  // --- TIER LOGIC ---
  const tiers = {
    Bronze: { limit: 1000, next: 'Gold', color: '#cd7f32' },
    Gold: { limit: 5000, next: 'Platinum', color: '#C5A059' },
    Platinum: { limit: 100000, next: 'Max', color: '#E5E4E2' }
  };

  const currentTier = tiers[user.tier] || tiers.Bronze;
  const nextGoal = currentTier.limit;
  const progressPercent = Math.min((user.spending / nextGoal) * 100, 100);
  const toUnlock = nextGoal - user.spending;

  // Fake stats for now if DB is empty (replace with user.savedAmount later)
  const totalSaved = user.savedAmount || 450; 
  const discountLevel = user.tier === 'Platinum' ? '20%' : user.tier === 'Gold' ? '10%' : '0%';

  return (
    <div className="container profile-page">
      <h2 className="section-title text-center">The Elite Circle</h2>
      
      <div className="profile-dashboard">
        
        {/* 1. THE DIGITAL BLACK CARD */}
        <div className={`member-card card-${user.tier.toLowerCase()}`}>
          <div className="card-top">
            <span className="card-brand">PARFUM D'ELITE</span>
            <span className="card-tier">{user.tier} MEMBER</span>
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
              <span className="value">2024</span>
            </div>
          </div>
        </div>

        {/* 2. ASCENSION PROGRESS */}
        {user.tier !== 'Platinum' && (
          <div className="progress-container glass-card">
            <div className="progress-text">
              <span>Current Spend: <strong>GH₵{user.spending}</strong></span>
              <span>Unlock {currentTier.next}: <strong>GH₵{toUnlock}</strong> left</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width: `${progressPercent}%`}}></div>
            </div>
          </div>
        )}

        {/* 3. STATS ROW */}
        <div className="stats-grid">
          <div className="stat-box glass-card">
            <FaWallet className="stat-icon" />
            <h4>Total Spent</h4>
            <p>GH₵{user.spending}</p>
          </div>
          <div className="stat-box glass-card highlight">
            <FaCrown className="stat-icon" />
            <h4>Total Saved</h4>
            <p>GH₵{totalSaved}</p>
          </div>
          <div className="stat-box glass-card">
            <FaHistory className="stat-icon" />
            <h4>Current Perk</h4>
            <p>{discountLevel} OFF</p>
          </div>
        </div>

        {/* 4. MY SCENT COLLECTION (History) */}
        <div className="history-section">
          <h3>My Scent Collection</h3>
          <div className="history-grid">
             {/* If order history is empty, show placeholder */}
             {(!user.orders || user.orders.length === 0) ? (
               <p className="no-orders">No perfumes collected yet.</p>
             ) : (
               user.orders.map((order, i) => (
                 <div key={i} className="history-card glass-card">
                    <div className="history-img">
                      <img src={order.img} alt="perfume" />
                    </div>
                    <div className="history-info">
                      <h4>{order.name}</h4>
                      <div className="price-row">
                        <span className="old-price">GH₵{order.originalPrice}</span>
                        <span className="paid-price">GH₵{order.paidPrice}</span>
                      </div>
                      <span className="status-badge">Delivered</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;