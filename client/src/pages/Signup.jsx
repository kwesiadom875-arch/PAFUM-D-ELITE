import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the Register Endpoint
      await axios.post(`${API_URL}/api/auth/register`, formData);
      alert("Registration Successful! Please Login.");
      navigate('/login'); // Send them to login page
    } catch (error) {
      alert(error.response?.data?.message || "An unknown registration error occurred.");
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#C5A059' }}>Join the Elite</h2>
        <form onSubmit={handleSubmit}>
          <input 
            style={{width:'100%', padding:'10px', marginBottom:'10px'}} 
            name="username" placeholder="Username" onChange={handleChange} required 
          />
          <input 
            style={{width:'100%', padding:'10px', marginBottom:'10px'}} 
            name="email" type="email" placeholder="Email" onChange={handleChange} required 
          />
          <input 
            style={{width:'100%', padding:'10px', marginBottom:'10px'}} 
            name="password" type="password" placeholder="Password" onChange={handleChange} required 
          />
          <button type="submit" className="btn-primary" style={{width:'100%'}}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '15px', color: '#999' }}>
          Already a member? <Link to="/login" style={{ color: '#C5A059' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;