import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaHeart, FaEye } from 'react-icons/fa';
import TransparentImg from '../components/TransparentImg';
import QuickViewModal from '../components/QuickViewModal';
import ErrorBoundary from '../components/ErrorBoundary';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  // Unified Filter & Sort Logic
  const applyFilters = (category, search, sort, allProducts = products) => {
    let result = [...allProducts];

    // 1. Filter by Category
    if (category !== 'All') {
      result = result.filter(p => p.category.includes(category));
    }

    // 2. Filter by Search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.notes && p.notes.some(note => note.toLowerCase().includes(query)))
      );
    }

    // 3. Sort
    if (sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      // Assuming newer products have higher IDs or we just keep default order
      // If there's a createdAt, we'd use that. For now, default is fine.
    }

    setFilteredProducts(result);
  };

  const handleFilter = (category) => {
    setActiveFilter(category);
    applyFilters(category, searchQuery, sortOption);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(activeFilter, query, sortOption);
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSortOption(sort);
    applyFilters(activeFilter, searchQuery, sort);
  };

  return (
    <div className="shop-container container">

      {/* HERO SECTION */}
      <div className="shop-hero">
        <div className="hero-content">
          <h1 className="page-title">The Olfactory Archives</h1>
          <p className="hero-subtitle">Discover a curated collection of rare and exquisite fragrances.</p>
        </div>

        {/* Search & Sort Bar */}
        <div className="search-sort-bar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search the archives..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="sort-wrapper">
            <select value={sortOption} onChange={handleSort} className="sort-select">
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

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

          // Badge Logic
          const isNew = product._id && product._id.length > 10 && Math.random() > 0.7; // Mock logic for "New"
          const isTrending = product.price > 1500 && Math.random() > 0.8;

          return (
            <div key={product.id || product._id} className="luxury-card">

              {/* IMAGE FRAME */}
              <div className="image-frame">
                {/* Badges */}
                <div className="badges-container">
                  {product.price > 2000 && <span className="badge-top badge-bestseller">Best Seller</span>}
                  {isNew && <span className="badge-top badge-new">New Arrival</span>}
                  {isTrending && <span className="badge-top badge-trending">Trending</span>}

                  {!hasStock && <span className="badge-top badge-out">Out of Stock</span>}
                  {hasStock && totalStock < 5 && <span className="badge-top badge-low">Only {totalStock} Left</span>}
                </div>

                {/* Wishlist Icon */}
                <button className="wishlist-btn"><FaHeart /></button>

                {/* Quick View Icon */}
                <button
                  className="quickview-btn"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent link click
                    setSelectedProduct(product);
                  }}
                >
                  <FaEye />
                </button>

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

      {/* QUICK VIEW MODAL */}
      {selectedProduct && (
        <ErrorBoundary>
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default Shop;