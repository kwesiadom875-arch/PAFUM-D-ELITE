// import React, { useState, useContext } from 'react';
// import { FaUser, FaLock, FaEnvelope, FaGoogle, FaFacebookF, FaApple, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../config';
// import { CartContext } from '../context/CartContext';
// import './Auth.css';

// const Auth = () => {
//     const [isSignUp, setIsSignUp] = useState(false);
//     const { login } = useContext(CartContext);
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Check query param on mount
//     React.useEffect(() => {
//         const params = new URLSearchParams(location.search);
//         const mode = params.get('mode');
//         if (mode === 'signup') {
//             setIsSignUp(true);
//         } else if (mode === 'signin') {
//             setIsSignUp(false);
//         }
//     }, [location]);

//     // Form States
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         password: ''
//     });
//     const [showPassword, setShowPassword] = useState(false);

//     // UI States
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const toggleMode = () => {
//         setIsSignUp(!isSignUp);
//         setError('');
//         setSuccess('');
//         setFormData({ username: '', email: '', password: '' });
//     };

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const validatePassword = (pwd) => {
//         return pwd.length >= 12;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');
//         setLoading(true);

//         try {
//             if (isSignUp) {
//                 // Sign Up Logic
//                 if (!validatePassword(formData.password)) {
//                     setError('Password must be at least 12 characters.');
//                     setLoading(false);
//                     return;
//                 }
//                 const res = await axios.post(`${API_URL}/api/auth/register`, formData);
//                 setSuccess(res.data.message || 'Account created! Please verify your email.');
//                 // Optional: Switch to sign in or wait for verification
//             } else {
//                 // Sign In Logic
//                 const res = await axios.post(`${API_URL}/api/auth/login`, {
//                     email: formData.email,
//                     password: formData.password
//                 });
//                 login(res.data.user, res.data.token);
//                 navigate('/profile');
//             }
//         } catch (err) {
//             console.error(err);
//             if (err.response?.status === 403 && !isSignUp) {
//                 setError('Please verify your email before signing in.');
//             } else {
//                 setError(err.response?.data?.message || 'Authentication failed. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-wrapper">
//             <div className="auth-card">
//                 {/* Header Section */}
//                 <div className="auth-header">
//                     <div className="auth-logo-icon">
//                         <FaUser />
//                     </div>
//                     <h2>{isSignUp ? 'Create an account' : 'Sign in with email'}</h2>
//                     <p>
//                         {isSignUp
//                             ? 'Join the Elite Circle for exclusive scents.'
//                             : 'Make a new doc to bring your words, data, and teams together. For free'}
//                     </p>
//                 </div>

//                 {/* Error/Success Messages */}
//                 {error && <div className="auth-message error">{error}</div>}
//                 {success && <div className="auth-message success">{success}</div>}

//                 {/* Form Section */}
//                 <form onSubmit={handleSubmit} className="auth-form">
//                     {isSignUp && (
//                         <div className="input-group">
//                             <FaUser className="input-icon" />
//                             <input
//                                 type="text"
//                                 name="username"
//                                 placeholder="Username"
//                                 value={formData.username}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>
//                     )}

//                     <div className="input-group">
//                         <FaEnvelope className="input-icon" />
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <FaLock className="input-icon" />
//                         <input
//                             type={showPassword ? "text" : "password"}
//                             name="password"
//                             placeholder="Password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             required
//                         />
//                         <button
//                             type="button"
//                             className="password-toggle"
//                             onClick={() => setShowPassword(!showPassword)}
//                         >
//                             {showPassword ? <FaEyeSlash /> : <FaEye />}
//                         </button>
//                     </div>

//                     {!isSignUp && (
//                         <div className="forgot-password">
//                             <a href="#">Forgot password?</a>
//                         </div>
//                     )}

//                     <button type="submit" className="submit-btn" disabled={loading}>
//                         {loading ? 'Processing...' : (isSignUp ? 'Get Started' : 'Get Started')}
//                     </button>
//                 </form>

//                 {/* Divider */}
//                 <div className="auth-divider">
//                     <span>Or sign in with</span>
//                 </div>

//                 {/* Social Buttons */}
//                 <div className="social-row">
//                     <button className="social-btn google"><FaGoogle /></button>
//                     <button className="social-btn facebook"><FaFacebookF /></button>
//                     <button className="social-btn apple"><FaApple /></button>
//                 </div>

//                 {/* Toggle Mode */}
//                 <div className="auth-footer">
//                     <p>
//                         {isSignUp ? "Already have an account?" : "Don't have an account?"}
//                         <button onClick={toggleMode} className="toggle-link">
//                             {isSignUp ? 'Sign In' : 'Sign Up'}
//                         </button>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Auth;
