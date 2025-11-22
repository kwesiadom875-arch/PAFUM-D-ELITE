import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      {/* Background Overlay */}
      <div className="hero-overlay">
        <div className="hero-content">
          <h2 className="fade-in">Redefine Your Scent</h2>
          <h1 className="fade-in delay-1">
            PARFUM <span className="gold-text">D'ELITE</span>
          </h1>
          <p className="fade-in delay-2">
            Experience the art of olfactory mastery. Negotiate your price with our 
            concierge AI and join the Elite Circle.
          </p>
          
          <div className="fade-in delay-3">
            <Link to="/shop" className="btn-primary hero-btn">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;