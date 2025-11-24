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
    text: "Checkout Now",
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
      <h2 className="section-title">Your Selection</h2>

      <div className="cart-grid">
        {/* LEFT: ITEMS */}
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={index} className="glass-card cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <p className="price">GH₵{item.price}</p>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT: TOTAL & PAY */}
        <div className="glass-card cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>GH₵{totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free (Elite Standard)</span>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
          <div className="summary-row total">
            <span>Total</span>
            <span style={{ color: '#C5A059' }}>GH₵{totalAmount}</span>
          </div>

          {/* THE PAYSTACK BUTTON */}
          <div className="paystack-wrapper">
            <PaystackButton className="btn-primary" {...componentProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;