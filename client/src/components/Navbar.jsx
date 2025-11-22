import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingBag } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { cart } = useContext(CartContext);

  return (
    <nav className="navbar glass-card">
      <div className="container nav-container">
        <Link to="/" className="logo">
          Parfum <span style={{ color: '#C5A059' }}>D'Elite</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Collection</Link>
          <Link to="/find-your-scent" style={{ color: '#C5A059' }}>Ask Josie</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <Link to="/cart" className="cart-icon">
          <FaShoppingBag />
          <span className="cart-count">{cart.length}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;