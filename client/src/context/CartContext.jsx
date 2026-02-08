import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../config';
import { CartContext } from './CartContextType';
export { CartContext };

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCart([]); // Clear cart on logout
  };

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn('Session expired. Logging out...');
        logout();
      } else {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  // On initial load, check for a token in localStorage to keep the user logged in.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the auth token for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Refresh user data to ensure roles/permissions are up to date
      refreshUser();
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  // --- Cart Logic ---
  const addToCart = (product, negotiatedPrice = null) => {
    const finalPrice = negotiatedPrice || product.price;
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        setTimeout(() => toast.info(`Updated quantity for ${product.name}`), 0);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, price: finalPrice } : item
        );
      }
      setTimeout(() => toast.success(`Added ${product.name} to cart`), 0);
      return [...prev, { ...product, quantity: 1, price: finalPrice }];
    });
  };

  const decreaseCartItem = (id) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === id);
      if (existing.quantity === 1) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, decreaseCartItem, removeFromCart, clearCart, getCartTotal,
      user, login, logout, refreshUser
    }}>
      {children}
    </CartContext.Provider>
  );
};