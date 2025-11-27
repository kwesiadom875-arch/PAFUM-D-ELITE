import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const ProductGrid = ({ products, loading, user, addToCart, onQuickView }) => {
    const gridRef = useRef(null);

    useEffect(() => {
        if (!loading && products.length > 0 && gridRef.current) {
            const cards = gridRef.current.querySelectorAll('.luxury-card');

            // Reset any previous animations
            gsap.killTweensOf(cards);

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
    }, [products, loading]);

    if (loading) {
        return (
            <div className="product-grid-loading" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>Loading archives...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="request-cta" style={{ textAlign: 'center', marginTop: '80px', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '15px' }}>No matches found</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Try adjusting your search or filters.</p>
                <button
                    className="btn-outline"
                    onClick={() => window.location.reload()}
                >
                    Reset Filters
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="product-grid" ref={gridRef}>
                {products.map((product) => (
                    <ProductCard
                        key={product.id || product._id}
                        product={product}
                        user={user}
                        addToCart={addToCart}
                        onQuickView={onQuickView}
                    />
                ))}
            </div>

            {/* REQUEST CTA - Always show at bottom unless empty (handled above) or maybe show it anyway? 
                In original Shop.jsx it was always at bottom. Let's keep it.
            */}
            <div className="request-cta" style={{ textAlign: 'center', marginTop: '80px', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '15px' }}>Didn't find what you're looking for?</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Our archives are vast, but sometimes the perfect scent is yet to be discovered.</p>
                <Link to="/request">
                    <button className="btn-outline">Make a Request</button>
                </Link>
            </div>
        </>
    );
};

ProductGrid.propTypes = {
    products: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    user: PropTypes.object,
    addToCart: PropTypes.func.isRequired,
    onQuickView: PropTypes.func.isRequired
};

ProductGrid.defaultProps = {
    loading: false,
    user: null
};

export default ProductGrid;
