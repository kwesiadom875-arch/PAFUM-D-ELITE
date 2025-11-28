import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaEye } from 'react-icons/fa';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import TransparentImg from '../TransparentImg';
import AddToCartButton from '../AddToCartButton';
import CompareButton from '../compare/CompareButton';
import './ProductCard.css';

const ProductCard = ({ product, user, addToCart, onQuickView }) => {
    const cardRef = useRef(null);
    const imageRef = useRef(null);

    // Stock Logic
    const hasStock = product.sizes && product.sizes.length > 0
        ? product.sizes.some(s => s.stockQuantity > 0)
        : product.stockQuantity > 0;

    const totalStock = product.sizes && product.sizes.length > 0
        ? product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0)
        : product.stockQuantity || 0;

    // Badge Logic (Mock)
    const isNew = product._id && product._id.length > 10 && parseInt(product._id.slice(-1), 16) > 10; // Deterministic "random" based on ID
    const isTrending = product.price > 1500 && product.price % 100 > 50; // Deterministic based on price

    // Access Logic
    const canAccessProduct = () => {
        if (product.category === 'Ultra Niche') {
            if (!user) return false;
            const tier = user.tier || 'Bronze';
            return tier === 'Diamond' || tier === 'Elite Diamond';
        }
        return true;
    };

    const isLocked = !canAccessProduct();

    // Hover Animation
    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            y: -8,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            duration: 0.3,
            ease: 'power2.out'
        });

        if (imageRef.current) {
            gsap.to(imageRef.current, {
                scale: 1.05,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            y: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            duration: 0.3,
            ease: 'power2.out'
        });

        if (imageRef.current) {
            gsap.to(imageRef.current, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    };

    return (
        <div
            ref={cardRef}
            className={`luxury-card ${isLocked ? 'locked-card' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* IMAGE FRAME */}
            <div className="image-frame">
                {/* Compare Button (Right Side) */}
                {!isLocked && (
                    <div style={{ position: 'absolute', top: '85px', right: '15px', zIndex: 10 }}>
                        <CompareButton product={product} />
                    </div>
                )}

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
                            e.preventDefault();
                            onQuickView(product);
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
                        <div ref={imageRef} style={{ width: '100%', height: '100%' }}>
                            <TransparentImg src={product.image} alt={product.name} className={!hasStock ? 'grayscale' : ''} />
                        </div>
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
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        image: PropTypes.string,
        category: PropTypes.string,
        stockQuantity: PropTypes.number,
        sizes: PropTypes.arrayOf(PropTypes.shape({
            stockQuantity: PropTypes.number
        })),
        notes: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    user: PropTypes.shape({
        tier: PropTypes.string
    }),
    addToCart: PropTypes.func.isRequired,
    onQuickView: PropTypes.func.isRequired
};

ProductCard.defaultProps = {
    user: null
};

export default ProductCard;
