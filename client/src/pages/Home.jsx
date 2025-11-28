import React, { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import IntroAnimation from '../components/home/IntroAnimation';
import HeroSection from '../components/home/HeroSection';
import CategoryBanners from '../components/home/CategoryBanners';
import FeaturedCollection from '../components/home/FeaturedCollection';
import FeaturesRow from '../components/home/FeaturesRow';
import './Home.css';

const Home = () => {
  const [showIntro, setShowIntro] = useState(true);

  // Check if intro has already been shown in this session to avoid annoyance
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  return (
    <PageTransition>
      <div className="home-container">
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

        {!showIntro && (
          <>
            <HeroSection />
            <CategoryBanners />
            <FeaturedCollection />
            <FeaturesRow />
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Home;