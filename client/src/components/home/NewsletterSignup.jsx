import React, { useState } from 'react';
import './NewsletterSignup.css';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        setStatus('subscribed');
        setEmail('');
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <section className="newsletter-section">
            <div className="container text-center">
                <h2 className="section-title" style={{ color: 'white' }}>Join the Elite</h2>
                <p className="newsletter-subtitle">Subscribe to receive updates, access to exclusive deals, and more.</p>

                {status === 'subscribed' ? (
                    <p className="success-msg">Thank you for subscribing!</p>
                ) : (
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">Subscribe</button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default NewsletterSignup;
