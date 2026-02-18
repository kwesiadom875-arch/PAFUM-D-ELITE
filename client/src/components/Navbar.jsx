import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config';
import { FaShoppingBag, FaBars, FaTimes, FaTrash, FaUser, FaCamera } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { cart, removeFromCart, getCartTotal, user, logout } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

  const handleVisualSearch = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size too large (Max 5MB)");
      return;
    }

    setIsSearching(true);
    const toastId = toast.loading("Analyzing image...", { autoClose: false });

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(`${API_URL}/api/search/visual`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { brand, name, description } = res.data.analysis;

      toast.update(toastId, {
        render: `Found: ${brand} - ${name}`,
        type: "success",
        isLoading: false,
        autoClose: 5000
      });

      // Navigate to shop with search query
      navigate(`/shop?search=${encodeURIComponent(name)}`);

    } catch (error) {
      console.error("Visual Search Error", error);
      toast.update(toastId, {
        render: "Could not identify perfume. Try another image.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsSearching(false);
      event.target.value = ''; // Reset input
    }
  };

  return (
    <>
      <nav className="navbar glass-card">
        <div className="container nav-container">
          {/* Mobile Hamburger */}
          <div className="mobile-toggle" onClick={toggleMenu}>
            <FaBars />
          </div>

          {/* Left Group */}
          <div className="nav-left desktop-only">
            <Link to="/shop">Collection</Link>
            <Link to="/request">Request</Link>
            <Link to="/about">About</Link>
            <Link to="/olfactory-map">Scent Map</Link>
          </div>

          {/* Center Logo */}
          <Link to="/" className="logo">
            Parfum <span style={{ color: '#C5A059' }}>D'Elite</span>
          </Link>

          {/* Right Group */}
          <div className="nav-right">
            <Link to="/find-your-scent" className="desktop-only" style={{ color: '#C5A059', marginRight: '1.5rem' }}>Ask Josie</Link>

            {/* Visual Search Icon */}
            <div className="nav-icon" style={{ cursor: 'pointer', marginRight: '1rem' }} title="Search by Image">
              <label htmlFor="visual-search-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaCamera />
              </label>
              <input
                id="visual-search-input"
                type="file"
                accept="image/*"
                onChange={handleVisualSearch}
                style={{ display: 'none' }}
                disabled={isSearching}
              />
            </div>

            {/* Profile Icon & Tier */}
            <div
              className="nav-profile-group"
              onClick={() => navigate(user ? '/profile' : '/auth?mode=signin')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '1rem' }}
            >
              {user && user.tier && (
                <span className="tier-badge" style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(197, 160, 89, 0.1)',
                  color: '#C5A059',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {user.tier}
                </span>
              )}
              <div className="nav-icon" style={{ marginRight: 0 }}>
                <FaUser />
              </div>
            </div>

            {/* Cart Icon */}
            <div className="cart-icon" onClick={toggleCart}>
              <FaShoppingBag />
              <span className="cart-count">{cart.length}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={toggleMenu}><FaTimes /></button>
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/about" onClick={toggleMenu}>About</Link>
          <Link to="/olfactory-map" onClick={toggleMenu}>Scent Map</Link>
          <Link to="/shop" onClick={toggleMenu}>Collection</Link>
          <Link to="/find-your-scent" onClick={toggleMenu} style={{ color: '#C5A059' }}>Ask Josie</Link>

          {user ? (
            <>
              <Link to="/profile" onClick={toggleMenu}>Profile</Link>
              {user.isAdmin || user.isSuperAdmin ? <Link to="/admin" style={{ color: '#C5A059' }}>Admin</Link> : null}
              {user.isTester && <Link to="/climate-tests" onClick={toggleMenu} style={{ color: '#4CAF50' }}>Climate Tests</Link>}
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
