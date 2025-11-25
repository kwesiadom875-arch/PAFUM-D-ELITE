
import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { PaystackButton } from 'react-paystack';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const totalAmount = getCartTotal();

  // PAYSTACK CONFIGURATION
  const publicKey = "pk_test_5c7f8d0eb20bc1ad8db4fd63a881a53a85539b94";

  const componentProps = {
    email: "user@example.com",
    amount: totalAmount * 100,
    currency: "GHS",
    metadata: { name: "Guest Shopper", phone: "0240000000" },
    publicKey,
    text: "Pay Now",
    onSuccess: async (reference) => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.post(`${API_URL}/api/user/purchase`, {
            items: cart.map(item => ({
              productId: item.id,
              productName: item.name,
              productImage: item.image,
              originalPrice: item.originalPrice || item.price,
              finalPrice: item.price,
              negotiated: item.negotiated || false
            }))
          }, {
            headers: { Authorization: token }
          });
        }
        alert("Payment Successful! Your profile has been updated.");
        clearCart();
        navigate('/profile');
      } catch (error) {
        console.error('Error recording purchase:', error);
        alert("Payment successful but couldn't update profile.");
        clearCart();
        navigate('/');
      }
    },
    onClose: () => alert("Transaction cancelled"),
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
      <h2 className="section-title">Secure Checkout</h2>

      <div className="cart-grid">
        {/* LEFT: SHIPPING & ITEMS */}
        <div className="checkout-left">

          {/* 1. SHIPPING FORM */}
          <div className="glass-card shipping-form">
            <h3>Shipping Details</h3>
            <div className="form-row">
              <input type="text" placeholder="First Name" className="input-field" />
              <input type="text" placeholder="Last Name" className="input-field" />
            </div>
            <input type="text" placeholder="Address Line 1" className="input-field full" />
            <div className="form-row">
              <input type="text" placeholder="City" className="input-field" />
              <input type="text" placeholder="Region" className="input-field" />
            </div>
            <input type="tel" placeholder="Phone Number" className="input-field full" />
          </div>

          {/* 2. CART ITEMS */}
          <div className="cart-items-review">
            <h3>Your Selection ({cart.length})</h3>
            {cart.map((item, index) => (
              <div key={index} className="glass-card cart-item-mini">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="price">GH₵{item.price}</p>
                </div>
                <button className="remove-btn-mini" onClick={() => removeFromCart(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="checkout-right">
          <div className="glass-card cart-summary sticky-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>GH₵{totalAmount}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free (Elite Standard)</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>GH₵0.00</span>
            </div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: '#C5A059' }}>GH₵{totalAmount}</span>
            </div>

            {/* THE PAYSTACK BUTTON */}
            <div className="paystack-wrapper">
              <PaystackButton className="btn-primary full-width" {...componentProps} />
            </div>

            <p className="secure-note">
              <span role="img" aria-label="lock">🔒</span> Secure SSL Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;