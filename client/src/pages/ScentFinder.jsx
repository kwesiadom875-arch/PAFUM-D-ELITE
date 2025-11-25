import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './ScentFinder.css';

const ScentFinder = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.post(`${API_URL}/api/ai/scent-discovery`, { query });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching scent discovery results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container finder-page">
      <div className="finder-window glass-card">
        <h2 style={{ color: '#C5A059' }}>AI-Powered Scent Discovery</h2>
        <p className="scent-finder-description">
          Describe a mood, a memory, or a desired feeling in your own words, and let our AI find the perfect scent for you.
        </p>
        <form onSubmit={handleSearch} className="scent-finder-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'A walk in a pine forest after the rain'"
            className="scent-finder-input"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Discovering...' : 'Discover'}
          </button>
        </form>

        {loading && <div className="loading-message">Josie is analyzing your request...</div>}

        {!loading && searched && results.length === 0 && (
          <div className="no-results-message">
            <p>No scents found for your query.</p>
            <p>Try being more descriptive or check your spelling.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-grid">
            {results.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <div className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">GH₵{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScentFinder;