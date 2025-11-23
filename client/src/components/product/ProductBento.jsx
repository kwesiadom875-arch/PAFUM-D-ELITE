import React from 'react';
import { FaGlobe, FaThermometerHalf, FaMars, FaFlask, FaTag, FaStar } from 'react-icons/fa';

const ProductBento = ({ top, heart, base }) => {
    return (
        <div className="bento-grid container">
            <div className="bento-card intel-card animate-pop-in delay-1">
                <h3>Scent Intel</h3>
                <ul className="intel-rows">
                    <li><span className="icon-row"><FaTag /> Brand</span> <span>D'Elite Private</span></li>
                    <li><span className="icon-row"><FaFlask /> Concentration</span> <span>Eau de Parfum</span></li>
                    <li><span className="icon-row"><FaMars /> Gender</span> <span>Unisex</span></li>
                    <li><span className="icon-row"><FaGlobe /> Origin</span> <span>France</span></li>
                    <li><span className="icon-row"><FaThermometerHalf /> Season</span> <span>Winter</span></li>
                </ul>
            </div>

            <div className="bento-card pyramid-card animate-pop-in delay-2">
                <h3>Composition</h3>
                <p className="composition-sub">Olfactory structure</p>
                <div className="pyramid-visual">
                    <div className="pyramid-level top"><span className="note-name">{top}</span><span className="note-type">Top</span></div>
                    <div className="pyramid-level heart"><span className="note-name">{heart}</span><span className="note-type">Heart</span></div>
                    <div className="pyramid-level base"><span className="note-name">{base}</span><span className="note-type">Base</span></div>
                </div>
            </div>

            <div className="bento-card review-card animate-pop-in delay-3">
                <div className="score-box">
                    <span className="big-score">4.9</span>
                    <div className="stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                    <span className="review-count">2 Reviews</span>
                </div>
                <div className="review-snippet">
                    <p>"Lasts all day. The {base} note is incredible."</p>
                    <div className="snippet-header"><span>Josie</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProductBento;
