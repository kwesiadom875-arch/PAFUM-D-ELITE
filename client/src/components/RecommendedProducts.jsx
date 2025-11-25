import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecommendedProducts.css';

const RecommendedProducts = ({ userId, productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let url;
        if (userId) {
          url = `http://localhost:5000/api/recommendations/user/${userId}`;
        } else if (productId) {
          url = `http://localhost:5000/api/recommendations/product/${productId}`;
        } else {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get(url, {
          headers: {
            Authorization: token,
          },
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, productId]);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommended-products">
      <h2>{userId ? 'Recommended for You' : 'You Might Also Like'}</h2>
      <div className="products-grid">
        {recommendations.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
