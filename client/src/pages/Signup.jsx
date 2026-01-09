import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AutoCommon.css';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, formData);
            toast.success("Account Created! Please Log In.");
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed";
            setError(msg);
            if (!err.response || err.response.status >= 500) {
                toast.error("Server error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <h2>Join the Elite</h2>
                <p className="auth-subtitle">Begin your olfactory journey.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input name="username" type="text" placeholder="Username" onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Processing..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already a member?</p>
                    <Link to="/login" className="gold-link">Access Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;