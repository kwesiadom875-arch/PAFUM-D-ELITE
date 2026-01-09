import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import './AutoCommon.css'; // Shared CSS

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(CartContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            login(res.data.user, res.data.token);
            toast.success("Welcome back, Elite Member.");
            navigate('/profile');
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed";
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
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Access your curated collection.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <Link to="/forgot-password" style={{ color: '#C5A059', fontSize: '0.8rem', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New to Parfum D'Elite?</p>
                    <Link to="/signup" className="gold-link">Request Membership</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;