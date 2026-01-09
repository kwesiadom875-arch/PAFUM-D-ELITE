import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './Profile.css';
import RecommendedProducts from '../components/RecommendedProducts';

// Import profile components
import MembershipCard from '../components/profile/MembershipCard';
import TierProgress from '../components/profile/TierProgress';
import StatsGrid from '../components/profile/StatsGrid';
import ClimateTestsSection from '../components/profile/ClimateTestsSection';
import OrderHistorySection from '../components/profile/OrderHistorySection';
import VirtualVault from '../components/profile/VirtualVault';
import ScentWardrobe from '../components/profile/ScentWardrobe';

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

  // Calculate tier color class
  const spending = user.spending || 0;
  let tierColorClass = 'card-bronze';

  if (spending < 500) {
    tierColorClass = 'card-bronze';
  } else if (spending < 2000) {
    tierColorClass = 'card-gold';
  } else if (spending < 5000) {
    tierColorClass = 'card-diamond';
  } else {
    tierColorClass = 'card-elite-diamond';
  }

  const orders = user.orderHistory || [];

  return (
    <div className="profile-page">
      <div className="profile-dashboard">

        <h2 className="section-title">The Elite Circle</h2>

        {/* Membership Card */}
        <MembershipCard user={user} tierColorClass={tierColorClass} />

        {/* Tier Progress */}
        <TierProgress loyaltyInfo={user.loyaltyInfo} />

        {/* Scent Wardrobe */}
        <ScentWardrobe />

        {/* Stats Grid */}
        <StatsGrid
          spending={spending}
          orders={orders}
          points={user.points}
          badges={user.badges}
        />

        {/* Climate Tests Section */}
        <ClimateTestsSection userId={user._id} />

        {/* Virtual Vault */}
        <VirtualVault />

        {/* Order History */}
        <OrderHistorySection orders={orders} />

        {/* Recommended Products */}
        <RecommendedProducts userId={user._id} />

      </div>
    </div>
  );
};

export default Profile;
