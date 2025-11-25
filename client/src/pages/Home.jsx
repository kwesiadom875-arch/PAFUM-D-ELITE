import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import TransparentImg from '../components/TransparentImg';
import { CartContext } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(CartContext);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [showReveal, setShowReveal] = useState(false);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    fetchFeatured();
    const handleScroll = () => {
      if (!videoRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const video = videoRef.current;

      // Calculate scroll progress within the container
      const startY = container.offsetTop;
      const endY = startY + container.offsetHeight - window.innerHeight;
      const scrollY = window.scrollY;

      // Normalize progress between 0 and 1
      let progress = (scrollY - startY) / (endY - startY);
      progress = Math.max(0, Math.min(progress, 1));

      // Update video time
      if (video.duration) {
        video.currentTime = video.duration * progress;
      }

      // Show reveal at the end (last 15%)
      setShowReveal(progress > 0.85);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/featured`);
      if (res.data && res.data.name) {
        setFeatured(res.data);
      }
    } catch (err) { console.error("Failed to fetch featured:", err); }
  };

  return (
    <div className="home-container">

      {/* --- SECTION 1: SCROLL HERO (Scrollytelling) --- */}
      <div className="scroll-hero-container" ref={containerRef}>
        <div className="sticky-video-wrapper">
          <video
            ref={videoRef}
            className="hero-video"
            muted
            playsInline
            preload="auto"
          >
            <source src="/hero-video-smooth.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className={`video-overlay ${showReveal ? 'fade-out' : ''}`}>
            <h2 className="fade-in">The Essence of Nature</h2>
            <p className="fade-in delay-1">Scroll to discover</p>
            <div className="scroll-indicator">↓</div>
          </div>

          {/* REVEAL SECTION */}
          <div className={`product-reveal ${showReveal ? 'visible' : ''}`}>
            <div className="reveal-card glass-card">
              <div className="reveal-content">
                <h3>{featured ? featured.name : "Ikira PEACHWOOD"}</h3>
                <p>{featured ? featured.tagline : "A journey through the elements, captured in a bottle."}</p>
                <Link to={featured ? featured.link : "/shop"} className="btn-primary">Shop Now</Link>
              </div>
              <div className="reveal-image">
                <img src={featured ? featured.image : "/images/halfeti.png"} alt={featured ? featured.name : "Ikira Peachwood"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CURATOR'S NOTES (Editorial Spotlight) --- */}
      <section className="curator-section container">
        <div className="curator-bg-letter">
          {featured ? featured.name.charAt(0) : "H"}
        </div>
        <div className="curator-content">
          <h3 className="gold-text">The Curator's Notes</h3>
          <h1>{featured ? featured.name : "Penhaligon's Halfeti"}</h1>
          <p>
            {featured ? featured.description : "This is the ultimate woody and spicy fragrance, inspired by the opulent goods traded in Turkey. Halfeti is a dark, mysterious, and captivating scent. It opens with a rich blend of saffron and citrus, settles into a heart of rose and nutmeg, and dries down into a luxurious base of leather, precious oud, and sandalwood."}
          </p>
          <div className="action-row">
            <Link to={featured ? featured.link : "/shop"} className="btn-primary">Shop Now</Link>
            <Link to="/find-your-scent" className="btn-outline">Ask Josie</Link>
          </div>
        </div>
        <div className="curator-image">
          <TransparentImg src={featured ? featured.image : "/images/halfeti.png"} alt={featured ? featured.name : "Halfeti"} />
        </div>
      </section>

      {/* --- SECTION 3: COLLECTIONS (Interactive Windows) --- */}
      <section className="collections-section container">
        <h2 className="section-title text-center">Explore Our Collections</h2>
        <div className="collections-grid">

          <Link to="/shop" className="collection-card">
            <div className="img-wrapper">
              <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop" alt="Niche" />
            </div>
            <div className="collection-info">
              <h3>Niche</h3>
              <p>Rare, artisanal creations for the true connoisseur. Discover scents that tell a unique story.</p>
            </div>
          </Link>

          <Link to="/shop" className="collection-card">
            <div className="img-wrapper">
              <img src="https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop" alt="Luxury" />
            </div>
            <div className="collection-info">
              <h3>Luxury</h3>
              <p>Iconic scents from the world's top fashion houses. Timeless elegance and sophistication.</p>
            </div>
          </Link>

          {user?.tier === 'Elite Diamond' && (
            <Link to="/shop" className="collection-card">
              <div className="img-wrapper">
                <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop" alt="Ultra Niche" />
              </div>
              <div className="collection-info">
                <h3>Ultra Niche</h3>
                <p>Exclusive masterpieces reserved for our elite members. The pinnacle of perfumery.</p>
              </div>
            </Link>
          )}

        </div>
      </section>

      {/* --- SECTION 4: REVIEWS (Carousel) --- */}
      <section className="reviews-section container">
        <h2 className="section-title text-center">Client Stories</h2>
        <div className="reviews-grid">
          {[
            { name: "Nana", role: "Beauty Enthusiast", text: "A terrific piece of praise. The packaging was immaculate and the scent lasts all day." },
            { name: "Ama", role: "Collector", text: "Josie recommended the perfect scent for my wedding. Incredible service and attention to detail." },
            { name: "Kojo", role: "Verified Buyer", text: "Negotiated a great price on the Sauvage. Fast delivery and authentic product." },
            { name: "Esi", role: "Fragrance Lover", text: "The unboxing experience was magical. I felt like royalty opening my package." },
            { name: "Kwame", role: "Elite Member", text: "The Ultra Niche collection is unmatched. Truly unique scents I can't find anywhere else." }
          ].map((review, i) => (
            <div key={i} className="review-card">
              <p>"{review.text}"</p>
              <div className="reviewer">
                <div className="avatar"></div>
                <div>
                  <span className="name">{review.name}</span>
                  <span className="role">{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 5: FOOTER CTA (Final Invitation) --- */}
      <section className="footer-cta">
        <h2>Ready to Find Your Next Scent?</h2>
        <div className="cta-buttons">
          <Link to="/find-your-scent" className="btn-primary">Start AI Quiz</Link>
          <Link to="/shop" className="btn-outline" style={{ color: 'white', borderColor: 'white' }}>Shop All Perfumes</Link>
        </div>
      </section>

    </div>
  );
};

export default Home;