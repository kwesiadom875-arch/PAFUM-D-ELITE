import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import '../App.css'; // Reusing main styles for consistency

const Reviews = () => {
    const reviews = [
        { id: 1, name: "Sarah J.", role: "Verified Buyer", text: "The Oud Noir is absolutely stunning. It lasts for over 12 hours and I get compliments everywhere.", rating: 5 },
        { id: 2, name: "Michael K.", role: "Collector", text: "I was skeptical about buying online, but the Scent Finder was spot on. The packaging is top tier.", rating: 5 },
        { id: 3, name: "Elena R.", role: "Verified Buyer", text: "Fast shipping to Accra. The presentation is beautiful. Will definitely order again.", rating: 4.5 },
        { id: 4, name: "David O.", role: "Verified Buyer", text: "A truly premium experience. The negotiator feature was fun and I got a great deal.", rating: 5 },
    ];

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <div className="text-center" style={{ marginBottom: '60px' }}>
                <h1 className="section-title">Client Stories</h1>
                <p className="gold-text">Experiences from the Elite</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {reviews.map(review => (
                    <div key={review.id} className="glass-card" style={{ padding: '40px', borderRadius: '12px' }}>
                        <div style={{ color: '#C5A059', fontSize: '1.5rem', marginBottom: '20px' }}><FaQuoteLeft /></div>
                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '30px', lineHeight: '1.8' }}>"{review.text}"</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#1a1a1a' }}>{review.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{review.role}</span>
                            </div>
                            <div style={{ color: '#C5A059' }}>
                                {[...Array(Math.floor(review.rating))].map((_, i) => <FaStar key={i} />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
