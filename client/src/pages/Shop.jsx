import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaHeart, FaEye } from 'react-icons/fa';
import TransparentImg from '../components/TransparentImg';
import QuickViewModal from '../components/QuickViewModal';
import ErrorBoundary from '../components/ErrorBoundary';
import './Shop.css';
import PageTransition from '../components/PageTransition';
import AddToCartButton from '../components/AddToCartButton';
import gsap from 'gsap';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productGridRef = useRef(null);

  // Access user from CartContext
  const { addToCart, user } = useContext(CartContext);

  // Categories for the top bar - conditionally show Ultra Niche
  const userTier = user?.tier || 'Bronze';
  const canSeeUltraNiche = userTier === 'Diamond' || userTier === 'Elite Diamond';
  const categories = canSeeUltraNiche
    ? ["All", "Luxury", "Niche", "Ultra Niche"]
    : ["All", "Luxury", "Niche"];

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  // GSAP Animation for product cards on load
  useEffect(() => {
    if (filteredProducts.length > 0 && productGridRef.current) {
      const cards = productGridRef.current.querySelectorAll('.luxury-card');

      gsap.fromTo(cards,
        {
          opacity: 0,
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, [filteredProducts]);

  // Unified Filter & Sort Logic
  const applyFilters = (category, search, sort, allProducts = products) => {
    let result = [...allProducts];

    // 0. Filter out Ultra Niche products if user doesn't have access
    if (!canSeeUltraNiche) {
      result = result.filter(p => p.category !== 'Ultra Niche');
    }

    // 1. Filter by Category - EXACT MATCH to prevent "Niche" matching "Ultra Niche"
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
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

  // Helper to check access - FIXED to handle new accounts
  const canAccessProduct = (product) => {
    if (product.category === 'Ultra Niche') {
      // Only Diamond and Elite Diamond members can access Ultra Niche
      if (!user) return false; // Not logged in
      const tier = user.tier || 'Bronze'; // Default to Bronze if no tier set
      return tier === 'Diamond' || tier === 'Elite Diamond';
    }
    return true;
  };

  // Card hover animation
  const handleCardHover = (e, isEntering) => {
    const card = e.currentTarget;
    const image = card.querySelector('.image-frame img');

    if (isEntering) {
      gsap.to(card, {
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (image) {
        gsap.to(image, {
          scale: 1.05,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    } else {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (image) {
        gsap.to(image, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }
  };

  return (
    <PageTransition>
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
        <div className="product-grid" ref={productGridRef}>
          {filteredProducts.map((product, index) => {
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

            const isLocked = !canAccessProduct(product);

            return (
              <div
                key={product.id || product._id}
                className={`luxury-card ${isLocked ? 'locked-card' : ''}`}
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >

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
                  {!isLocked && (
                    <button
                      className="quickview-btn"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent link click
                        setSelectedProduct(product);
                      }}
                    >
                      <FaEye />
                    </button>
                  )}

                  {isLocked ? (
                    <div className="locked-overlay">
                      <span style={{ fontSize: '3rem' }}>🔒</span>
                      <p>Exclusive to Diamond Members</p>
                    </div>
                  ) : (
                    <Link to={`/product/${product.id || product._id}`}>
                      <TransparentImg src={product.image} alt={product.name} className={!hasStock ? 'grayscale' : ''} />
                    </Link>
                  )}

                  {/* SLIDE UP ACTION BAR */}
                  {!isLocked && (
                    <div className="action-overlay">
                      <AddToCartButton
                        onClick={() => addToCart(product)}
                        price={product.price}
                        disabled={!hasStock}
                        className={!hasStock ? 'disabled-btn' : ''}
                      />
                    </div>
                  )}
                </div>

                {/* TEXT INFO */}
                <div className="card-details">
                  <span className="card-category">{product.category}</span>
                  {isLocked ? (
                    <h3 className="card-name" style={{ filter: 'blur(4px)' }}>Exclusive Scent</h3>
                  ) : (
                    <Link to={`/product/${product.id || product._id}`}>
                      <h3 className="card-name">{product.name}</h3>
                    </Link>
                  )}
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
    </PageTransition>
  );
};

export default Shop;