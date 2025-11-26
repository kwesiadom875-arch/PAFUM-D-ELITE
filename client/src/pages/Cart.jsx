import React, { useContext, useRef, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import './Cart.css';
import gsap from 'gsap';

const Cart = () => {
  const { cart, removeFromCart, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  const totalAmount = getCartTotal();
  const cartItemsRef = useRef([]);
  const totalRef = useRef(null);

  // Animate cart items on mount
  useEffect(() => {
    if (cart.length > 0) {
      gsap.fromTo(
        '.cart-item-mini',
        {
          opacity: 0,
          x: -50,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          clearProps: 'all'
        }
      );
    }
  }, [cart.length]);

  // Animate total when it changes
  useEffect(() => {
    if (totalRef.current && totalAmount > 0) {
      gsap.from(totalRef.current, {
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    }
  }, [totalAmount]);

  // Handle remove with animation
  const handleRemove = (itemId, index) => {
    const element = document.querySelector(`[data-cart-index="${index}"]`);

    if (element) {
      gsap.to(element, {
        x: -100,
        opacity: 0,
        height: 0,
        marginBottom: 0,
        padding: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => removeFromCart(itemId)
      });
    } else {
      removeFromCart(itemId);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your collection is empty.</h2>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2 className="section-title">Your Selection</h2>

      <div className="cart-grid">
        {/* LEFT: CART ITEMS */}
        <div className="cart-items-review" style={{ flex: 2 }}>
          {cart.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              data-cart-index={index}
              className="glass-card cart-item-mini"
              style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px', padding: '20px' }}
            >
              <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              <div className="item-details" style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{item.name}</h4>
                <p className="price" style={{ color: '#C5A059', fontWeight: 'bold' }}>GH₵{item.price}</p>
                {item.selectedSize && (
                  <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: '4px', color: '#555' }}>
                    Size: {item.selectedSize}
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>Qty: {item.quantity || 1}</p>
                <button
                  className="remove-btn-mini"
                  onClick={() => handleRemove(item.id, index)}
                  style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', marginTop: '5px' }}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="checkout-right" style={{ flex: 1 }}>
          <div className="glass-card cart-summary sticky-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>GH₵{totalAmount}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at Checkout</span>
            </div>
            <hr style={{ borderColor: 'rgba(0,0,0,0.1)', margin: '20px 0' }} />
            <div className="summary-row total">
              <span>Total</span>
              <span ref={totalRef} style={{ color: '#C5A059' }}>GH₵{totalAmount}</span>
            </div>

            <button
              className="btn-primary full-width"
              onClick={() => navigate('/checkout')}
              style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              Proceed to Checkout <FaArrowRight />
            </button>

            <p className="secure-note" style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', color: '#888' }}>
              <span role="img" aria-label="lock">🔒</span> Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;