import React, { useState } from 'react';
import LuxuryNegotiator from '../LuxuryNegotiator';
import { FaHeart } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config';

import TransparentImg from '../TransparentImg';
import CompareButton from '../compare/CompareButton';

const ProductHero = ({ product, finalPrice, addToCart, setFinalPrice }) => {
    const [selectedSize, setSelectedSize] = useState(null);

    const handleSizeSelect = (sizeOption) => {
        setSelectedSize(sizeOption.size);
        setFinalPrice(sizeOption.price);
    };

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert('⚠️ Please select a size before adding to cart');
            return;
        }

        const sizeVariant = product.sizes?.find(s => s.size === selectedSize);
        const itemToAdd = {
            ...product,
            selectedSize: selectedSize || null,
            price: sizeVariant ? sizeVariant.price : finalPrice,
            quantity: 1
        };

        addToCart(itemToAdd, finalPrice);
    };

    const handleAddToWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Or redirect to login
                alert('Please log in to add to wishlist');
                return;
            }
            await axios.post(`${API_URL}/api/user/wishlist/add/${product._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Added to wishlist!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Product already in wishlist');
            } else {
                console.error('Error adding to wishlist:', error);
                alert('Could not add to wishlist');
            }
        }
    };

    // Check if product has stock
    const hasStock = product.sizes && product.sizes.length > 0
        ? product.sizes.some(s => s.stockQuantity > 0)
        : product.stockQuantity > 0;

    const getTotalStock = () => {
        if (product.sizes && product.sizes.length > 0) {
            return product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0);
        }
        return product.stockQuantity || 0;
    };

    return (
        <div className="pdp-hero container">
            <div className="hero-image-stage animate-fade-up">
                <div className="glow-effect"></div>
                <TransparentImg src={product.image} alt={product.name} className="hero-bottle" />
            </div>

            <div className="hero-buy-box">
                <div className="brand-tag animate-slide-right">Parfum D'Elite / {product.category}</div>
                <h1 className="hero-title animate-slide-right" style={{ animationDelay: '0.1s' }}>{product.name}</h1>
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
