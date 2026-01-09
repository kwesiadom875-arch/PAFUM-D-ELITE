
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import API_URL from '../config';
import '../App.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/reviews/top`);
                setReviews(res.data);
            } catch (error) {
                console.error("Failed to fetch top reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopReviews();
    }, []);

    if (loading) return (
        <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
            <p>Loading stories...</p>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <div className="text-center" style={{ marginBottom: '60px' }}>
                <h1 className="section-title">Client Stories</h1>
                <p className="gold-text">Experiences from the Elite</p>
            </div>

            {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888' }}>
                    <p>No stories yet. Be the first to share your experience.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {reviews.map(review => (
                        <div key={review._id} className="glass-card" style={{ padding: '40px', borderRadius: '12px' }}>
                            <div style={{ color: '#C5A059', fontSize: '1.5rem', marginBottom: '20px' }}><FaQuoteLeft /></div>
                            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '30px', lineHeight: '1.8' }}>"{review.comment}"</p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#1a1a1a' }}>{review.user?.username || 'Elite Client'}</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {review.product?.name || 'Verified Buyer'}
                                    </span>
                                </div>
                                <div style={{ color: '#C5A059', display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < review.rating ? "#C5A059" : "#e4e5e9"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
