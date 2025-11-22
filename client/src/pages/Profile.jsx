import React from 'react';
import './Profile.css';

const Profile = () => {
  // Hardcoded user for now (since we simplified auth)
  const user = {
    username: "Elite Member",
    tier: "Platinum",
    spending: 5200,
    id: "00045X"
  };

  return (
    <div className="container profile-page">
      <h2 className="section-title">Membership Status</h2>
      
      <div className="profile-wrapper">
        {/* THE LOYALTY CARD */}
        <div className={`loyalty-card card-${user.tier.toLowerCase()}`}>
          <div className="card-top">
            <span>Parfum D'Elite</span>
            <span>{user.tier} Circle</span>
          </div>
          <div className="card-mid">
            <h3>{user.username}</h3>
            <p>ID: {user.id}</p>
          </div>
          <div className="card-bot">
            <p>Total Spend: GH₵{user.spending}</p>
          </div>
        </div>

        {/* BENEFITS LIST */}
        <div className="glass-card benefits">
          <h3>Your Privileges</h3>
          <ul>
            <li>✓ 20% Concierge Discount</li>
            <li>✓ Priority Shipping</li>
            <li>✓ Exclusive Access to "Oud Noir"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;