
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingBag, FaBars, FaTimes, FaTrash } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { cart, removeFromCart, getCartTotal, user, logout } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const handleCheckout = () => {
    toggleCart();
    navigate('/cart');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=signin');
    if (isMenuOpen) toggleMenu();
  };

  return (
    <>
      <nav className="navbar glass-card">
        <div className="container nav-container">
          {/* Mobile Hamburger */}
          <div className="mobile-toggle" onClick={toggleMenu}>
            <FaBars />
          </div>

          <Link to="/" className="logo">
            Parfum <span style={{ color: '#C5A059' }}>D'Elite</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            <Link to="/">Home</Link>
            <Link to="/shop">Collection</Link>
            <Link to="/find-your-scent" style={{ color: '#C5A059' }}>Ask Josie</Link>

            {user ? (
              <>
                <Link to="/profile">Profile</Link>
                <button className="nav-btn-outline" onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=signin">Sign In</Link>
                <Link to="/auth?mode=signup" className="nav-btn">Sign Up</Link>
              </>
            )}
          </div>

          {/* Cart Icon */}
          <div className="cart-icon" onClick={toggleCart}>
            <FaShoppingBag />
            <span className="cart-count">{cart.length}</span>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={toggleMenu}><FaTimes /></button>
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/shop" onClick={toggleMenu}>Collection</Link>
          <Link to="/find-your-scent" onClick={toggleMenu} style={{ color: '#C5A059' }}>Ask Josie</Link>

          {user ? (
            <>
              <Link to="/profile" onClick={toggleMenu}>Profile</Link>
              <button className="nav-btn-outline mobile-btn" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=signin" onClick={toggleMenu}>Sign In</Link>
              <Link to="/auth?mode=signup" onClick={toggleMenu} className="nav-btn mobile-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* --- SLIDE-OUT CART DRAWER --- */}
      <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}>
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3>Your Bag ({cart.length})</h3>
            <button className="close-btn" onClick={toggleCart}><FaTimes /></button>
          </div>

          <div className="drawer-items">
            {cart.length === 0 ? (
              <p className="empty-msg">Your bag is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="drawer-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>GH₵{item.price} x {item.quantity}</p>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="drawer-footer">
            <div className="total-row">
              <span>Total:</span>
              <span>GH₵{getCartTotal()}</span>
            </div>
            <button className="btn-gold" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
