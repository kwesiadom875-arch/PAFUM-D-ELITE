import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const RequestScent = () => {
    const [vibe, setVibe] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vibe.trim()) return;

        try {
            await axios.post(`${API_URL}/api/requests`, { userVibe: vibe, email, phone, aiRecommendation: "User Request" });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting request", error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '50px', borderRadius: '16px', textAlign: 'center' }}>
                <h1 className="section-title" style={{ fontSize: '2rem' }}>Request a Scent</h1>
                <p style={{ color: '#666', marginBottom: '40px' }}>
                    Didn't find what you're looking for? Describe your dream fragrance, and our concierge will scour the archives for you.
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#fafafa' }}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#fafafa' }}
                            />
                        </div>
                        <textarea
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="Describe your dream fragrance..."
                            style={{
                                width: '100%',
                                height: '150px',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                fontFamily: 'inherit',
                                marginBottom: '30px',
                                resize: 'none',
                                backgroundColor: '#fafafa'
                            }}
                        />
                        <button type="submit" className="btn-primary full-width">Submit Request</button>
                    </form>
                ) : (
                    <div className="animate-fade-up">
                        <h3 style={{ color: '#C5A059', marginBottom: '15px' }}>Request Received</h3>
                        <p>Our sommeliers have received your request. We will notify you if we find a match.</p>
                        <button className="btn-outline" style={{ marginTop: '30px' }} onClick={() => setSubmitted(false)}>Make Another Request</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestScent;
