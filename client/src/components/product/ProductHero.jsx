import React from 'react';
import LuxuryNegotiator from '../LuxuryNegotiator';
import { FaHeart, FaStar } from 'react-icons/fa';

import ProductImage from './ProductImage';
import CompareButton from '../compare/CompareButton';
import useProductActions from '../../hooks/useProductActions';

// --- COLOR MAPPING LOGIC (Copied for Mobile Hero) ---
const getAccordColor = (note) => {
    const n = note.toLowerCase().trim();
    if (n.includes('citrus') || n.includes('lemon') || n.includes('bergamot')) return '#EBD342';
    if (n.includes('white floral') || n.includes('tuberose') || n.includes('jasmine')) return '#FFFEF0';
    if (n.includes('floral') || n.includes('rose')) return '#F2CCDB';
    if (n.includes('woody') || n.includes('cedar')) return '#966338';
    if (n.includes('oud') || n.includes('agarwood')) return '#4A3121';
    if (n.includes('aromatic') || n.includes('lavender') || n.includes('sage')) return '#679186';
    if (n.includes('fresh spicy') || n.includes('ginger')) return '#A7CF61';
    if (n.includes('warm spicy') || n.includes('cinnamon') || n.includes('cardamom')) return '#913228';
    if (n.includes('vanilla')) return '#F3DFAC';
    if (n.includes('amber')) return '#D68A29';
    if (n.includes('powdery') || n.includes('iris')) return '#E8DCD1';
    if (n.includes('musky') || n.includes('musk')) return '#D6D6D6';
    if (n.includes('sweet') || n.includes('fruity')) return '#E86B87';
    if (n.includes('leather') || n.includes('animalic')) return '#2E1D16';
    if (n.includes('earthy') || n.includes('patchouli')) return '#6E553E';
    if (n.includes('green') || n.includes('herbal')) return '#59964F';
    if (n.includes('marine') || n.includes('aquatic')) return '#7CB9D1';
    if (n.includes('balsamic') || n.includes('resinous')) return '#632A38';
    return '#C5A059';
};

const getTextColor = (hex) => {
    const darkBackgrounds = ['#2E1D16', '#4A3121', '#913228', '#632A38', '#556B2F', '#050505'];
    return darkBackgrounds.includes(hex) ? '#FFFFFF' : '#222222';
};

const ProductHero = ({ product, finalPrice, addToCart, setFinalPrice, notesArray, reviewsData }) => {
    const {
        selectedSize,
        handleSizeSelect,
        handleAddToCart,
        handleAddToWishlist,
        hasStock,
        getTotalStock
    } = useProductActions(product, addToCart, finalPrice, setFinalPrice);

    return (
        <div className="pdp-hero container">
            <div className="hero-image-stage animate-fade-up">
                <div className="glow-effect"></div>
                <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="hero-bottle"
                />

                {/* MOBILE ACCORDS CHART (Hidden on Desktop) */}
                {notesArray && (
                    <div className="mobile-accords-chart">
                        <div className="accords-stack">
                            {notesArray.slice(0, 6).map((note, index) => { // Limit to 6 for space
                                const bg = getAccordColor(note);
                                const txt = getTextColor(bg);
                                const widthPercent = Math.max(100 - (index * 10), 45);
                                return (
                                    <div key={index} className="accord-bar" style={{ backgroundColor: bg, width: `${widthPercent}%`, color: txt, fontSize: '0.7rem', padding: '4px 8px' }}>
                                        {note}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="hero-buy-box">
                <div className="brand-tag animate-slide-right">Parfum D'Elite / {product.category}</div>
                <h1 className="hero-title animate-slide-right" style={{ animationDelay: '0.1s' }}>{product.name}</h1>

                {/* Rating Summary */}
                {reviewsData && reviewsData.count > 0 && (
                    <div className="rating-summary animate-slide-right" style={{ animationDelay: '0.15s', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                        <div style={{ color: '#C5A059', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <FaStar size={14} />
                            <strong style={{ fontSize: '1rem', color: '#fcfcfc' }}>{reviewsData.average}</strong>
                        </div>
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>• {reviewsData.count} Olfactory Impressions</span>
                    </div>
                )}
                <div className="hero-price animate-slide-right" style={{ animationDelay: '0.2s' }}>GH₵{finalPrice}</div>
                <p className="hero-desc animate-slide-right" style={{ animationDelay: '0.3s' }}>{product.description}</p>

                {/* Stock Badge */}
                {!hasStock ? (
                    <div className="stock-badge out-of-stock">
                        ❌ Out of Stock
                    </div>
                ) : getTotalStock() < 5 && (
                    <div className="stock-badge low-stock">
                        🔥 Only {getTotalStock()} left in stock!
                    </div>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="size-selector animate-slide-right" style={{ animationDelay: '0.3s' }}>
                        <h3>Select Size</h3>
                        <div className="size-options">
                            {product.sizes.map(sizeOption => (
                                <button
                                    key={sizeOption.size}
                                    className={`size-btn ${selectedSize === sizeOption.size ? 'active' : ''} ${sizeOption.stockQuantity === 0 ? 'out-of-stock' : ''}`}
                                    onClick={() => handleSizeSelect(sizeOption)}
                                    disabled={sizeOption.stockQuantity === 0}
                                >
                                    <span className="size-label">{sizeOption.size}</span>
                                    <span className="size-price">GH₵{sizeOption.price}</span>
                                    {sizeOption.stockQuantity === 0 && (
                                        <span className="size-stock-badge">Out of Stock</span>
                                    )}
                                    {sizeOption.stockQuantity > 0 && sizeOption.stockQuantity < 3 && (
                                        <span className="size-stock-badge low">Only {sizeOption.stockQuantity} left</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="action-area animate-slide-right" style={{ animationDelay: '0.4s' }}>
                    <button
                        className="btn-gold full-width"
                        onClick={handleAddToCart}
                        disabled={!hasStock}
                    >
                        {hasStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                        className="btn-icon"
                        onClick={handleAddToWishlist}
                        disabled={!hasStock}
                        title="Add to Wishlist"
                    >
                        <FaHeart />
                    </button>
                    <div style={{ marginLeft: '10px' }}>
                        <CompareButton product={product} />
                    </div>
                    {hasStock && <LuxuryNegotiator product={product} onDealAccepted={setFinalPrice} />}
                </div>
            </div>
        </div>
    );
};

export default ProductHero;

