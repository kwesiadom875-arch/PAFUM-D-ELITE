import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import QuickViewModal from '../components/QuickViewModal';
import ErrorBoundary from '../components/ErrorBoundary';
import PageTransition from '../components/PageTransition';
import ShopHero from '../components/shop/ShopHero';
import ShopFilters from '../components/shop/ShopFilters';
import ProductGrid from '../components/shop/ProductGrid';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Access user from CartContext
  const { addToCart, user } = useContext(CartContext);

  // Categories for the top bar - conditionally show Ultra Niche
  const userTier = user?.tier || 'Bronze';
  const canSeeUltraNiche = userTier === 'Diamond' || userTier === 'Elite Diamond';
  const categories = canSeeUltraNiche
    ? ["All", "Luxury", "Niche", "Ultra Niche"]
    : ["All", "Luxury", "Niche"];

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(err => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, []);

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
      // If we had a createdAt field, we would sort by that
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
    <PageTransition>
      <div className="shop-container container">
        {/* HERO SECTION */}
        <div className="shop-hero">
          <ShopHero
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            sortOption={sortOption}
            onSortChange={handleSort}
          />

          <ShopFilters
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={handleFilter}
          />
        </div>

        {/* PRODUCT GRID */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          user={user}
          addToCart={addToCart}
          onQuickView={setSelectedProduct}
        />

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