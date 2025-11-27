import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import API_URL from '../../config';
import { format } from 'date-fns';

const ReviewList = ({ productId, refreshTrigger }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/reviews/product/${productId}`);
                setReviews(res.data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId, refreshTrigger]);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div style={{ padding: '30px', textAlign: 'center', background: '#f8f9fa', borderRadius: '12px', marginTop: '30px' }}>
                <p style={{ color: '#666', fontStyle: 'italic' }}>No reviews yet. Be the first to review this masterpiece.</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Client Reviews ({reviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map(review => (
                    <div key={review._id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
                        <div style={{ marginTop: '5px' }}>
                            <FaUserCircle size={40} color="#C5A059" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{review.user?.name || 'Anonymous'}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', color: '#C5A059', marginBottom: '10px', fontSize: '0.9rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < review.rating ? "#C5A059" : "#e4e5e9"} />
                                ))}
                            </div>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
