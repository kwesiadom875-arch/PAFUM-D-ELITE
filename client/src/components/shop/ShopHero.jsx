import React from 'react';
import PropTypes from 'prop-types';

const ShopHero = ({ searchQuery, onSearchChange, sortOption, onSortChange }) => {
    return (
        <div className="shop-hero-content">
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
                        onChange={onSearchChange}
                        className="search-input"
                    />
                </div>

                <div className="sort-wrapper">
                    <select value={sortOption} onChange={onSortChange} className="sort-select">
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

ShopHero.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    sortOption: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired
};

export default ShopHero;
