import React from 'react';
import { Link } from 'react-router-dom';
import TransparentImg from '../components/TransparentImg';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">

      {/* --- SECTION 1: HERO (Floating Bottles) --- */}
      <section className="hero-section container">
        <div className="hero-text">
          <h2 className="fade-in">Explore Your Scent Story</h2>
          <p className="hero-sub fade-in delay-1">
            Unbottle a new experience. Discover luxury perfumes that tell your story.
          </p>
          <Link to="/shop" className="btn-primary fade-in delay-2">Explore</Link>
        </div>

        <div className="hero-visuals fade-in delay-3">
          {/* We use the bottles from the image logic */}
          <TransparentImg src="/images/1-million.png" alt="1 Million" className="float-bottle left" />
          <TransparentImg src="/images/sauvage.png" alt="Sauvage" className="float-bottle center" />
          <TransparentImg src="/images/gentleman.png" alt="Gentleman" className="float-bottle right" />
        </div>
      </section>

      {/* --- SECTION 2: CURATOR'S NOTES (Split Layout) --- */}
      <section className="curator-section container">
        <div className="curator-content">
          <h3 className="gold-text">The Curator's Notes</h3>
          <h1>Penhaligon's Halfeti</h1>
          <p>
            This is the ultimate woody and spicy fragrance, inspired by the opulent goods traded in Turkey.
            Halfeti is a dark, mysterious, and captivating scent. It opens with a rich blend of saffron and citrus,
            settles into a heart of rose and nutmeg, and dries down into a luxurious base of leather, precious oud, and sandalwood.
          </p>
          <div className="action-row">
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <Link to="/find-your-scent" className="btn-outline">Ask Josie</Link>
          </div>
        </div>
        <div className="curator-image">
          {/* The big bottle from your reference */}
          <TransparentImg src="/images/halfeti.png" alt="Halfeti" />
        </div>
      </section>

      {/* --- SECTION 3: COLLECTIONS (Two Cards) --- */}
      <section className="collections-section container">
        <h2 className="section-title text-center">Explore Our Collections</h2>
        <div className="collections-grid">

          <div className="collection-card glass-card">
            <div className="img-wrapper">
              <img src="https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop" alt="Designer" />
            </div>
            <h3>Designer Fragrances</h3>
            <p>Iconic scents from the world's top fashion houses.</p>
          </div>

          <div className="collection-card glass-card">
            <div className="img-wrapper">
              <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop" alt="Niche" />
            </div>
            <h3>Niche Perfumes</h3>
            <p>Rare, artisanal creations for the true connoisseur.</p>
          </div>

        </div>
      </section>

      {/* --- SECTION 4: REVIEWS (Grid) --- */}
      <section className="reviews-section container">
        <h2 className="section-title text-center">Client Stories</h2>
        <div className="reviews-grid">
          {[
            { name: "Nana", role: "Beauty Enthusiast", text: "A terrific piece of praise. The packaging was immaculate." },
            { name: "Ama", role: "Collector", text: "Josie recommended the perfect scent for my wedding. Incredible." },
            { name: "Kojo", role: "Verified Buyer", text: "Negotiated a great price on the Sauvage. Fast delivery." }
          ].map((review, i) => (
            <div key={i} className="review-card glass-card">
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

      {/* --- SECTION 5: FOOTER CTA --- */}
      <section className="footer-cta">
        <h2>Ready to Find Your Next Scent?</h2>
        <div className="cta-buttons">
          <Link to="/shop" className="btn-primary">Shop All Perfumes</Link>
          <Link to="/find-your-scent" className="btn-outline">Start AI Quiz</Link>
        </div>
      </section>

    </div>
  );
};

export default Home;