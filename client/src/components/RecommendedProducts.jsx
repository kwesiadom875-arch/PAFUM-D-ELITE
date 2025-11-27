import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import API_URL from '../config';
import { retryRequest } from '../utils/errorHandler';
import ProductSkeleton from './ProductSkeleton';
import './RecommendedProducts.css';

const RecommendedProducts = ({ userId, productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let url;
        if (userId) {
          url = `${API_URL}/api/recommendations/user/${userId}`;
        } else if (productId) {
          url = `${API_URL}/api/recommendations/product/${productId}`;
        } else {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');

        await retryRequest(async () => {
          const response = await axios.get(url, {
            headers: {
              Authorization: token,
            },
          });
          setRecommendations(response.data);
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, productId]);

  if (loading) {
    return (
      <div className="recommended-products">
        <h2 className="section-title">{userId ? 'Curated For You' : 'You Might Also Like'}</h2>
        <div className="products-grid">
          <ProductSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommended-products">
      <h2 className="section-title">{userId ? 'Curated For You' : 'You Might Also Like'}</h2>
      <div className="products-grid">
        {recommendations.map(product => (
          <a href={`/product/${product.id}`} key={product.id} className="product-card">
            <div className="card-image-wrapper">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="card-info">
              <h3>{product.name}</h3>
              <p className="card-brand">{product.brand || "Parfum D'Elite"}</p>
              <p className="card-price">GH₵ {product.price}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

RecommendedProducts.propTypes = {
  userId: PropTypes.string,
  productId: PropTypes.string
};

export default RecommendedProducts;
