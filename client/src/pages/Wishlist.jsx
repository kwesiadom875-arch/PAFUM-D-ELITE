import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import API_URL from '../config';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useContext(CartContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // We need to populate the wishlist products
        const productPromises = res.data.wishlist.map(productId =>
          axios.get(`${API_URL}/api/products/${productId}`)
        );
        const productResponses = await Promise.all(productPromises);
        const products = productResponses.map(res => res.data);
        setWishlist(products);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/user/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlist.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Could not remove from wishlist');
    }
  };

  if (loading) return <div className="wishlist-loading">Loading Wishlist...</div>;
  if (!user) return <div className="wishlist-loading">Please Log In to view your wishlist.</div>;

  return (
    <div className="container wishlist-page">
      <h2 className="section-title text-center">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-center">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product._id} className="wishlist-card">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="wishlist-info">
                <h4>{product.name}</h4>
                <p>GH₵{product.price}</p>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveFromWishlist(product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
