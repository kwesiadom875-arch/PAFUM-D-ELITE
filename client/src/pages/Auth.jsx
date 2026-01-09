import React, { useState, useContext, useRef, useEffect } from 'react';
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaFacebookF, FaApple, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import './Auth.css';
import gsap from 'gsap';

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const { login } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const cardRef = useRef(null);
    const formRef = useRef(null);

    // Check query param on mount
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode');
        if (mode === 'signup') {
            setIsSignUp(true);
        } else if (mode === 'signin') {
            setIsSignUp(false);
        }
    }, [location]);

    // Form States
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const toggleMode = () => {
        // Animate form flip
        if (formRef.current) {
            gsap.to(formRef.current, {
                rotationY: 90,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                    setFormData({ username: '', email: '', password: '' });

                    gsap.fromTo(formRef.current,
                        { rotationY: -90, opacity: 0 },
                        { rotationY: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
                    );
                }
            });
        } else {
            setIsSignUp(!isSignUp);
            setError('');
            setSuccess('');
            setFormData({ username: '', email: '', password: '' });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (pwd) => {
        return pwd.length >= 12;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Sign Up Logic
                if (!validatePassword(formData.password)) {
                    setError('Password must be at least 12 characters.');
                    setLoading(false);
                    return;
                }
                const res = await axios.post(`${API_URL}/api/auth/register`, formData);
                setSuccess(res.data.message || 'Account created! Please verify your email.');
                // Optional: Switch to sign in or wait for verification
            } else {
                // Sign In Logic
                const res = await axios.post(`${API_URL}/api/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
                login(res.data.user, res.data.token);
                navigate('/profile');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403 && !isSignUp) {
                setError('Please verify your email before signing in.');
            } else {
                setError(err.response?.data?.message || 'Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Entrance animation on mount
    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
            );
        }
    }, []);

    return (
        <div className="auth-wrapper">
            <div className="auth-card" ref={cardRef}>
                {/* Header Section */}
                <div className="auth-header">
                    <div className="auth-logo-icon">
                        <FaUser />
                    </div>
                    <h2>{isSignUp ? 'Create an account' : 'Sign in with email'}</h2>
                    <p>
                        {isSignUp
                            ? 'Join the Elite Circle for exclusive scents.'
                            : 'Make a new doc to bring your words, data, and teams together. For free'}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="auth-form" ref={formRef}>
                    {isSignUp && (
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {!isSignUp && (
                        <div className="forgot-password">
                            <Link to="/forgot-password" style={{ color: '#C5A059', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot password?</Link>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Get Started' : 'Get Started')}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>Or sign in with</span>
                </div>

                {/* Social Buttons */}
                <div className="social-row">
                    <button className="social-btn google"><FaGoogle /></button>
                    <button className="social-btn facebook"><FaFacebookF /></button>
                    <button className="social-btn apple"><FaApple /></button>
                </div>

                {/* Toggle Mode */}
                <div className="auth-footer">
                    <p>
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button onClick={toggleMode} className="toggle-link">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
