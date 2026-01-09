import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './ScentWardrobe.css';

const ScentWardrobe = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState('');
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [selectedScent, setSelectedScent] = useState('');
    const [checkedIn, setCheckedIn] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/user/wardrobe-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.stats);
                generateSummary(res.data.stats);

                // Fetch orders for check-in list
                const profileRes = await axios.get(`${API_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = profileRes.data.orderHistory || [];
                const uniqueProducts = Array.from(new Set(orders.map(o => o.productId)))
                    .map(id => orders.find(o => o.productId === id));
                setPurchasedProducts(uniqueProducts);

                if (profileRes.data.lastCheckIn) {
                    const checkInDate = new Date(profileRes.data.lastCheckIn.date);
                    const today = new Date();
                    if (checkInDate.toDateString() === today.toDateString()) {
                        setCheckedIn(true);
                        setSelectedScent(profileRes.data.lastCheckIn.productName);
                    }
                }

            } catch (err) {
                console.error("Failed to fetch wardrobe stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleCheckIn = async () => {
        if (!selectedScent || selectedScent === '') return;
        try {
            const token = localStorage.getItem('token');
            const product = purchasedProducts.find(p => p.productName === selectedScent);
            await axios.post(`${API_URL}/api/user/check-in`, {
                productId: product.productId,
                productName: product.productName
            }, { headers: { Authorization: `Bearer ${token}` } });
            setCheckedIn(true);
        } catch (err) {
            console.error("Check-in failed", err);
        }
    };

    const generateSummary = (stats) => {
        if (!stats || stats.length === 0) return;
        const top = [...stats].sort((a, b) => b.value - a.value)[0];
        if (top.value === 0) {
            setSummary("Your olfactory journey is just beginning. Start your collection to see your profile.");
        } else {
            setSummary(`Your collection leans heavily towards ${top.name} profiles. You appreciate scents that are ${top.name === 'Woody' ? 'grounded and sophisticated' : (top.name === 'Floral' ? 'elegant and romantic' : (top.name === 'Fresh' ? 'vibrant and energetic' : 'complex and alluring'))}.`);
        }
    };

    if (loading) return <div className="wardrobe-loading">Analyzing your olfactory signature...</div>;
    if (data.length === 0) return null;

    return (
        <div className="scent-wardrobe-section">
            <div className="wardrobe-header">
                <h3 className="wardrobe-title">Your Scent Signature</h3>
                <p className="summary-text">{summary}</p>
            </div>

            <div className="chart-container" style={{ width: '100%', height: '500px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="85%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#888', fontSize: 14 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Scent Profile"
                            dataKey="value"
                            stroke="#C5A059"
                            fill="#C5A059"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="wardrobe-footer">
                <div className="sotd-container">
                    <h4>Scent of the Day</h4>
                    {checkedIn ? (
                        <div className="checked-in-msg">
                            You're currently wearing: <strong>{selectedScent}</strong>
                        </div>
                    ) : (
                        <div className="check-in-controls">
                            <select
                                value={selectedScent}
                                onChange={(e) => setSelectedScent(e.target.value)}
                                className="sotd-select"
                            >
                                <option value="">Select your scent...</option>
                                {purchasedProducts.map(p => (
                                    <option key={p.productId} value={p.productName}>{p.productName}</option>
                                ))}
                            </select>
                            <button onClick={handleCheckIn} className="btn-checkin">Check In</button>
                        </div>
                    )}
                </div>
                <div className="wardrobe-note">
                    *Based on notes analyzed from your purchase history.
                </div>
            </div>
        </div>
    );
};

export default ScentWardrobe;
