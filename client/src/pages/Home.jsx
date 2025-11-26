import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import TransparentImg from '../components/TransparentImg';
import { CartContext } from '../context/CartContext';
import './Home.css';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import SlideUp from '../components/animations/SlideUp';

const Home = () => {
  const { user } = useContext(CartContext);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [featured, setFeatured] = useState(null);

  // Framer Motion Scroll Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Transform scroll progress to video time (assuming ~10s video)
  // We'll update the video time in a useEffect to avoid re-renders
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      if (videoRef.current && videoRef.current.duration) {
        // Map 0-1 progress to video duration
        // We stop a bit before the end to avoid looping or black frames if any
        const time = latest * (videoRef.current.duration - 0.1);
        videoRef.current.currentTime = Math.max(0, time);
      }
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Reveal opacity based on scroll
  const revealOpacity = useTransform(smoothProgress, [0.8, 0.95], [0, 1]);
  const overlayOpacity = useTransform(smoothProgress, [0.7, 0.9], [1, 0]);

  useEffect(() => {
    fetchFeatured();
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
    <PageTransition>
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
              <source src={featured && featured.videoUrl ? featured.videoUrl : "/Baccarat Rouge 540-smooth.mp4"} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <motion.div className="video-overlay" style={{ opacity: overlayOpacity }}>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                The Essence of Nature
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Scroll to discover
              </motion.p>
              <motion.div
                className="scroll-indicator"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ↓
              </motion.div>
            </motion.div>

            {/* REVEAL SECTION */}
            <motion.div className="product-reveal" style={{ opacity: revealOpacity, pointerEvents: 'none' }}>
              <div className="reveal-card glass-card" style={{ pointerEvents: 'auto' }}>
                <div className="reveal-content">
                  <h3>{featured ? featured.name : "Ikira PEACHWOOD"}</h3>
                  <p>{featured ? featured.tagline : "A journey through the elements, captured in a bottle."}</p>
                  <Link to={featured ? featured.link : "/shop"} className="btn-primary">Shop Now</Link>
                </div>
                <div className="reveal-image">
                  <img src={featured ? featured.image : "/images/halfeti.png"} alt={featured ? featured.name : "Ikira Peachwood"} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- SECTION 2: CURATOR'S NOTES (Editorial Spotlight) --- */}
        <section className="curator-section container">
          <FadeIn>
            <div className="curator-bg-letter">
              {featured ? featured.name.charAt(0) : "H"}
            </div>
          </FadeIn>
          <div className="curator-content">
            <SlideUp>
              <h3 className="gold-text">The Curator's Notes</h3>
              <h1>{featured ? featured.name : "Penhaligon's Halfeti"}</h1>
              <p>
                {featured ? featured.description : "This is the ultimate woody and spicy fragrance, inspired by the opulent goods traded in Turkey. Halfeti is a dark, mysterious, and captivating scent. It opens with a rich blend of saffron and citrus, settles into a heart of rose and nutmeg, and dries down into a luxurious base of leather, precious oud, and sandalwood."}
              </p>
              <div className="action-row">
                <Link to={featured ? featured.link : "/shop"} className="btn-primary">Shop Now</Link>
                <Link to="/find-your-scent" className="btn-outline">Ask Josie</Link>
              </div>
            </SlideUp>
          </div>
          <div className="curator-image">
            <FadeIn delay={0.2}>
              <TransparentImg src={featured ? featured.image : "/images/halfeti.png"} alt={featured ? featured.name : "Halfeti"} />
            </FadeIn>
          </div>
        </section>

        {/* --- SECTION 3: COLLECTIONS (Interactive Windows) --- */}
        <section className="collections-section container">
          <SlideUp>
            <h2 className="section-title text-center">Explore Our Collections</h2>
          </SlideUp>
          <div className="collections-grid">

            <Link to="/shop" className="collection-card">
              <FadeIn delay={0.1}>
                <div className="img-wrapper">
                  <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop" alt="Niche" />
                </div>
                <div className="collection-info">
                  <h3>Niche</h3>
                  <p>Rare, artisanal creations for the true connoisseur. Discover scents that tell a unique story.</p>
                </div>
              </FadeIn>
            </Link>

            <Link to="/shop" className="collection-card">
              <FadeIn delay={0.2}>
                <div className="img-wrapper">
                  <img src="https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop" alt="Luxury" />
                </div>
                <div className="collection-info">
                  <h3>Luxury</h3>
                  <p>Iconic scents from the world's top fashion houses. Timeless elegance and sophistication.</p>
                </div>
              </FadeIn>
            </Link>

            {user?.tier === 'Elite Diamond' && (
              <Link to="/shop" className="collection-card">
                <FadeIn delay={0.3}>
                  <div className="img-wrapper">
                    <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop" alt="Ultra Niche" />
                  </div>
                  <div className="collection-info">
                    <h3>Ultra Niche</h3>
                    <p>Exclusive masterpieces reserved for our elite members. The pinnacle of perfumery.</p>
                  </div>
                </FadeIn>
              </Link>
            )}

          </div>
        </section>

        {/* --- SECTION 4: REVIEWS (Carousel) --- */}
        <section className="reviews-section container">
          <SlideUp>
            <h2 className="section-title text-center">Client Stories</h2>
          </SlideUp>
          <div className="reviews-grid">
            {[
              { name: "Nana", role: "Beauty Enthusiast", text: "A terrific piece of praise. The packaging was immaculate and the scent lasts all day." },
              { name: "Ama", role: "Collector", text: "Josie recommended the perfect scent for my wedding. Incredible service and attention to detail." },
              { name: "Kojo", role: "Verified Buyer", text: "Negotiated a great price on the Sauvage. Fast delivery and authentic product." },
              { name: "Esi", role: "Fragrance Lover", text: "The unboxing experience was magical. I felt like royalty opening my package." },
              { name: "Kwame", role: "Elite Member", text: "The Ultra Niche collection is unmatched. Truly unique scents I can't find anywhere else." }
            ].map((review, i) => (
              <SlideUp key={i} delay={i * 0.1}>
                <div className="review-card">
                  <p>"{review.text}"</p>
                  <div className="reviewer">
                    <div className="avatar"></div>
                    <div>
                      <span className="name">{review.name}</span>
                      <span className="role">{review.role}</span>
                    </div>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </section>

        {/* --- SECTION 5: FOOTER CTA (Final Invitation) --- */}
        <section className="footer-cta">
          <SlideUp>
            <h2>Ready to Find Your Next Scent?</h2>
            <div className="cta-buttons">
              <Link to="/find-your-scent" className="btn-primary">Start AI Quiz</Link>
              <Link to="/shop" className="btn-outline" style={{ color: 'white', borderColor: 'white' }}>Shop All Perfumes</Link>
            </div>
          </SlideUp>
        </section>

      </div>
    </PageTransition>
  );
};

export default Home;