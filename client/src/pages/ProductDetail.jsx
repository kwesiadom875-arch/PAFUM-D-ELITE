import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import LuxuryNegotiator from '../components/LuxuryNegotiator';
import { FaGlobe, FaThermometerHalf, FaClock, FaStar, FaMars, FaFlask, FaTag } from 'react-icons/fa';
import './ProductDetail.css';

// --- COLOR MAPPING LOGIC ---
 // --- FRAGRANTICA STYLE COLOR MAPPING ---
const getAccordColor = (note) => {
  const n = note.toLowerCase().trim();

  // CITRUS (Mustard Yellow)
  if (n.includes('citrus') || n.includes('lemon') || n.includes('bergamot')) return '#EBD342';
  
  // WHITE FLORAL (White/Off-White)
  if (n.includes('white floral') || n.includes('tuberose') || n.includes('jasmine')) return '#FFFEF0';
  
  // FLORAL (Soft Pink)
  if (n.includes('floral') || n.includes('rose')) return '#F2CCDB';
  
  // WOODY (Medium Brown)
  if (n.includes('woody') || n.includes('cedar')) return '#966338';
  
  // OUD / DARK WOODS (Dark Brown)
  if (n.includes('oud') || n.includes('agarwood')) return '#4A3121';
  
  // AROMATIC (Teal/Sage)
  if (n.includes('aromatic') || n.includes('lavender') || n.includes('sage')) return '#679186';
  
  // FRESH SPICY (Light Green)
  if (n.includes('fresh spicy') || n.includes('ginger')) return '#A7CF61';
  
  // WARM SPICY (Brick Red)
  if (n.includes('warm spicy') || n.includes('cinnamon') || n.includes('cardamom')) return '#913228';
  
  // VANILLA (Cream)
  if (n.includes('vanilla')) return '#F3DFAC';
  
  // AMBER (Orange)
  if (n.includes('amber')) return '#D68A29';
  
  // POWDERY (Pale Beige)
  if (n.includes('powdery') || n.includes('iris')) return '#E8DCD1';
  
  // MUSKY (Light Grey)
  if (n.includes('musky') || n.includes('musk')) return '#D6D6D6';
  
  // SWEET (Candy Pink)
  if (n.includes('sweet') || n.includes('fruity')) return '#E86B87';
  
  // LEATHER / ANIMALIC (Very Dark Brown)
  if (n.includes('leather') || n.includes('animalic')) return '#2E1D16';
  
  // EARTHY (Dirt Brown)
  if (n.includes('earthy') || n.includes('patchouli')) return '#6E553E';
  
  // GREEN (Grass Green)
  if (n.includes('green') || n.includes('herbal')) return '#59964F';
  
  // MARINE (Sky Blue)
  if (n.includes('marine') || n.includes('aquatic')) return '#7CB9D1';
  
  // BALSAMIC (Dark Purple/Red)
  if (n.includes('balsamic') || n.includes('resinous')) return '#632A38';

  return '#C5A059'; // Default Gold
};

// Update Text Color Logic
// Since Fragrantica uses black text on almost everything except very dark bars:
const getTextColor = (hex) => {
  const darkBackgrounds = ['#2E1D16', '#4A3121', '#913228', '#632A38', '#556B2F', '#050505'];
  // If the hex matches a dark background, return white, else black
  return darkBackgrounds.includes(hex) ? '#FFFFFF' : '#222222';
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [finalPrice, setFinalPrice] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/products/${id}`).then(res => {
      setProduct(res.data);
      setFinalPrice(res.data.price);
    });
    axios.get('http://127.0.0.1:5000/api/products').then(res => {
      const others = res.data.filter(p => p.id !== parseInt(id) && p._id !== id);
      setRelated(others.slice(0, 4));
    });
  }, [id]);

  if (!product) return <div className="loading-text">Loading Essence...</div>;

  // Parse notes string into an array
  const notesArray = product.notes ? product.notes.split(', ') : ["Generic", "Scent"];
  const top = notesArray[0] || "Citrus";
  const heart = notesArray[1] || "Spice";
  const base = notesArray[2] || "Wood";

  return (
    <div className="pdp-dark-container">
      
      {/* HERO SECTION */}
      <div className="pdp-hero container">
        <div className="hero-image-stage">
          <div className="glow-effect"></div>
          <img src={product.image} alt={product.name} className="hero-bottle" />
        </div>

        <div className="hero-buy-box">
          <div className="brand-tag">Parfum D'Elite / {product.category}</div>
          <h1 className="hero-title">{product.name}</h1>
          <div className="hero-price">GH₵{finalPrice}</div>
          <p className="hero-desc">{product.description}</p>
          
          <div className="action-area">
            <button className="btn-gold full-width" onClick={() => addToCart(product, finalPrice)}>
              Add to Cart
            </button>
            <LuxuryNegotiator product={product} onDealAccepted={setFinalPrice} />
          </div>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="bento-grid container">
        <div className="bento-card intel-card">
          <h3>Scent Intel</h3>
          <ul className="intel-rows">
            <li><span className="icon-row"><FaTag/> Brand</span> <span>D'Elite Private</span></li>
            <li><span className="icon-row"><FaFlask/> Concentration</span> <span>Eau de Parfum</span></li>
            <li><span className="icon-row"><FaMars/> Gender</span> <span>Unisex</span></li>
            <li><span className="icon-row"><FaGlobe/> Origin</span> <span>France</span></li>
            <li><span className="icon-row"><FaThermometerHalf/> Season</span> <span>Winter</span></li>
          </ul>
        </div>

        <div className="bento-card pyramid-card">
          <h3>Composition</h3>
          <p className="composition-sub">Olfactory structure</p>
          <div className="pyramid-visual">
            <div className="pyramid-level top"><span className="note-name">{top}</span><span className="note-type">Top</span></div>
            <div className="pyramid-level heart"><span className="note-name">{heart}</span><span className="note-type">Heart</span></div>
            <div className="pyramid-level base"><span className="note-name">{base}</span><span className="note-type">Base</span></div>
          </div>
        </div>

        <div className="bento-card review-card">
          <div className="score-box">
            <span className="big-score">4.9</span>
            <div className="stars"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
            <span className="review-count">2 Reviews</span>
          </div>
          <div className="review-snippet">
            <p>"Lasts all day. The {base} note is incredible."</p>
            <div className="snippet-header"><span>Josie</span></div>
          </div>
        </div>
      </div>

      {/* --- NEW MAIN ACCORDS CHART --- */}
      {/* --- ACCORDS SECTION --- */}
      <div className="accords-section container">
        
        {/* LEFT: FRAGRANTICA CHART */}
        <div className="bento-card wide-card accords-chart-box">
          <h3>Main Accords</h3>
          
          <div className="accords-stack">
            {notesArray.map((note, index) => {
              const bg = getAccordColor(note);
              const txt = getTextColor(bg);
              // Fragrantica width logic: Decrements slowly
              const widthPercent = Math.max(100 - (index * 10), 45); 
              
              return (
                <div 
                  key={index} 
                  className="accord-bar" 
                  style={{ 
                    backgroundColor: bg,
                    width: `${widthPercent}%`,
                    color: txt
                  }}
                >
                  {note}
                </div>
              );
            })}
          </div>

          {/* CITATION ADDED HERE 👇 */}
          <div className="chart-source">
            Data sourced from <a href="https://www.fragrantica.com" target="_blank" rel="noreferrer">Fragrantica.com</a>
          </div>
        </div>

        {/* RIGHT: PERFUMER INFO */}
        <div className="bento-card wide-card">
          <h3>Perfumer(s)</h3>
          <p className="perfumer-name">Nathalie Gracia-Cetto</p>
          <p className="perfumer-name">Quentin Bisch</p>
          <div className="perfumer-signature">Master Perfumers</div>
        </div>
      </div>

      {/* RELATED */}
      <div className="related-section container">
        <h3>You May Also Like</h3>
        <div className="related-grid">
          {related.map(item => (
            <Link to={`/product/${item.id || item._id}`} key={item.id || item._id} className="related-card">
              <div className="related-img"><img src={item.image} alt={item.name} /></div>
              <h4>{item.name}</h4>
              <span>GH₵{item.price}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;