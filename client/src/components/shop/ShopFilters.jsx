import React from 'react';
import PropTypes from 'prop-types';

const ShopFilters = ({ categories, activeFilter, onFilterChange }) => {
    return (
        <div className="filter-bar">
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                    onClick={() => onFilterChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

ShopFilters.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default ShopFilters;
