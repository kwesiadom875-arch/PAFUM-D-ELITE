import React from 'react';
import LuxuryNegotiator from '../LuxuryNegotiator';

import TransparentImg from '../TransparentImg';

const ProductHero = ({ product, finalPrice, addToCart, setFinalPrice }) => {
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

                <div className="action-area animate-slide-right" style={{ animationDelay: '0.4s' }}>
                    <button className="btn-gold full-width" onClick={() => addToCart(product, finalPrice)}>
                        Add to Cart
                    </button>
                    <LuxuryNegotiator product={product} onDealAccepted={setFinalPrice} />
                </div>
            </div>
        </div>
    );
};

export default ProductHero;
