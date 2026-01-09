import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AutoCommon.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setSubmitted(true);
            toast.success("Reset link sent to your email.");
        } catch (err) {
            toast.error("Failed to process request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <h2>Forgot Password</h2>
                <p className="auth-subtitle">Enter your email to reset your password.</p>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', color: '#e0e0e0' }}>
                        <p>If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.</p>
                        <p style={{ marginTop: '20px' }}>Please check your inbox and spam folder.</p>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="gold-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
