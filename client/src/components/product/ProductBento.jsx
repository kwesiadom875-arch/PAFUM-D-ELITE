import React from 'react';
import { FaGlobe, FaThermometerHalf, FaMars, FaFlask, FaTag, FaStar } from 'react-icons/fa';

const ProductBento = ({ product, top, heart, base, reviewsData }) => {
    const displayRating = reviewsData && reviewsData.count > 0 ? reviewsData.average : (product.rating || 4.5);
    const starCount = Math.round(displayRating);
    return (
        <div className="bento-grid container">
            <div className="bento-card intel-card animate-pop-in delay-1">
                <h3>Scent Intel</h3>
                <ul className="intel-rows">
                    <li><span className="icon-row"><FaTag /> Brand</span> <span>{product.brand || "Parfum D'Elite"}</span></li>
                    <li><span className="icon-row"><FaFlask /> Concentration</span> <span>{product.concentration || "Eau de Parfum"}</span></li>
                    <li><span className="icon-row"><FaMars /> Gender</span> <span>{product.gender || "Unisex"}</span></li>
                    <li><span className="icon-row"><FaGlobe /> Origin</span> <span>{product.origin || "France"}</span></li>
                    <li><span className="icon-row"><FaThermometerHalf /> Season</span> <span>{product.season || "All Year"}</span></li>
                </ul>
            </div>

            <div className="bento-card pyramid-card animate-pop-in delay-2">
                <h3>Composition</h3>
                <p className="composition-sub">Olfactory structure</p>
                <div className="pyramid-visual">
                    <div className="pyramid-level top" style={{ width: '40%', background: 'rgba(197, 160, 89, 0.15)', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                        <span className="note-name">{top}</span>
                        <span className="note-type">Top</span>
                    </div>
                    <div className="pyramid-level heart" style={{ width: '70%', background: 'rgba(197, 160, 89, 0.25)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', marginTop: '-5px' }}>
                        <span className="note-name">{heart}</span>
                        <span className="note-type">Heart</span>
                    </div>
                    <div className="pyramid-level base" style={{ width: '100%', background: 'rgba(197, 160, 89, 0.35)', clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)', marginTop: '-5px' }}>
                        <span className="note-name">{base}</span>
                        <span className="note-type">Base</span>
                    </div>
                </div>
            </div>

            <div className="bento-card review-card animate-pop-in delay-3">
                <div className="score-box">
                    <span className="big-score">{displayRating}</span>
                    <div className="stars" style={{ color: '#C5A059' }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color={i < starCount ? "#C5A059" : "rgba(0,0,0,0.1)"} />
                        ))}
                    </div>
                    <span className="review-count">
                        {reviewsData && reviewsData.count > 0
                            ? `${reviewsData.count} Community Reviews`
                            : 'Curated Excellence'}
                    </span>
                </div>
                <div className="review-snippet">
                    <p>"A masterpiece. The {base} note lingers beautifully."</p>
                    <div className="snippet-header"><span>Verified Buyer</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProductBento;
