import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { toast } from 'react-toastify';
import { FaStar, FaTrash, FaUser, FaBox } from 'react-icons/fa';

const ReviewsTab = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/reviews`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Review deleted");
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    if (loading) return <div className="text-center p-5">Loading reviews...</div>;

    return (
        <div className="glass-card list-section">
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Review Moderation</h3>
            {reviews.length === 0 ? (
                <p>No reviews found to moderate.</p>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review._id}>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FaUser size={12} color="#888" />
                                            <span style={{ fontSize: '0.85rem' }}>{review.user?.username || 'N/A'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{review.user?.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FaBox size={12} color="#888" />
                                            <span style={{ fontSize: '0.85rem' }}>{review.product?.name || 'Deleted Product'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', color: '#C5A059' }}>
                                            {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={10} />)}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '250px', fontSize: '0.85rem', color: '#555', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                            "{review.comment}"
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="delete-btn"
                                            style={{ padding: '8px', background: 'rgba(255, 68, 68, 0.1)' }}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReviewsTab;
