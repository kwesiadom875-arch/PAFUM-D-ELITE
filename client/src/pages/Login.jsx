import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(CartContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the Login Route
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);

      // Pass User AND Token to Context
      login(res.data.user, res.data.token);

      navigate('/profile');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#C5A059' }}>Sign In</h2>

        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            color: '#ff6b6b',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }}
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <input
              style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }}
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '0.9rem' }}>
          Not a member? <Link to="/signup" style={{ color: '#C5A059' }}>Join the Circle</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;