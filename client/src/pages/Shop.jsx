import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaHeart } from 'react-icons/fa';
import TransparentImg from '../components/TransparentImg';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const { addToCart } = useContext(CartContext);

  // Categories for the top bar
  const categories = ["All", "Floral", "Woody", "Fresh", "Spicy"];

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  // Filter Logic
  const handleFilter = (category) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category.includes(category)));
    }
  };

  return (
    <div className="shop-container container">

      {/* HEADER */}
      <div className="shop-header">
        <h1 className="page-title">The Olfactory Archives</h1>
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => handleFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map(product => {
          // Check stock status
          const hasStock = product.sizes && product.sizes.length > 0
            ? product.sizes.some(s => s.stockQuantity > 0)
            : product.stockQuantity > 0;

          const totalStock = product.sizes && product.sizes.length > 0
            ? product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0)
            : product.stockQuantity || 0;

          return (
            <div key={product.id || product._id} className="luxury-card">

              {/* IMAGE FRAME */}
              <div className="image-frame">
                {/* Badge */}
                {product.price > 2000 && <span className="badge-top">Best Seller</span>}

                {!hasStock && <span className="badge-top out-of-stock-badge">Out of Stock</span>}
                {hasStock && totalStock < 5 && <span className="badge-top low-stock-badge">Only {totalStock} Left</span>}

                {/* Wishlist Icon */}
                <button className="wishlist-btn"><FaHeart /></button>

                <Link to={`/product/${product.id || product._id}`}>
                  <TransparentImg src={product.image} alt={product.name} className={!hasStock ? 'grayscale' : ''} />
                </Link>

                {/* SLIDE UP ACTION BAR */}
                <div className="action-overlay">
                  {hasStock ? (
                    <button onClick={() => addToCart(product)}>
                      Add to Cart — GH₵{product.price}
                    </button>
                  ) : (
                    <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>

              {/* TEXT INFO */}
              <div className="card-details">
                <span className="card-category">{product.category}</span>
                <Link to={`/product/${product.id || product._id}`}>
                  <h3 className="card-name">{product.name}</h3>
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {/* REQUEST CTA */}
      <div className="request-cta" style={{ textAlign: 'center', marginTop: '80px', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '15px' }}>Didn't find what you're looking for?</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Our archives are vast, but sometimes the perfect scent is yet to be discovered.</p>
        <Link to="/request">
          <button className="btn-outline">Make a Request</button>
        </Link>
      </div>
    </div>
  );
};

export default Shop;