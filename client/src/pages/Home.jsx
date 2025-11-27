import React from 'react';
import PageTransition from '../components/PageTransition';
import ImmersiveHero from '../components/home/ImmersiveHero';
import StoryPanel from '../components/home/StoryPanel';
import Product3D from '../components/home/Product3D';
import CollectionsGrid3D from '../components/home/CollectionsGrid3D';
import TestimonialsGSAP from '../components/home/TestimonialsGSAP';
import FooterCTAMagnetic from '../components/home/FooterCTAMagnetic';
import './Home.css';

const Home = () => {
  // Story panel content
  const storyPanels = [
    {
      title: "The Essence",
      description: "Every fragrance begins with nature's finest ingredients, carefully sourced from around the world. From the jasmine fields of Grasse to the oud forests of Southeast Asia.",
      image: "/images/story-essence.jpg"
    },
    {
      title: "The Craft",
      description: "Master perfumers blend art and science, creating harmonious compositions that tell stories and evoke emotions. Each note is precisely measured, each accord carefully balanced.",
      image: "/images/story-craft.jpg"
    },
    {
      title: "The Experience",
      description: "A perfume is more than a scent—it's a journey, a memory, an extension of your identity. Discover fragrances that resonate with your soul.",
      image: "/images/story-experience.jpg"
    }
  ];

  return (
    <PageTransition>
      <div className="home-immersive">
        {/* Hero Section - Full-screen video with parallax */}
        <ImmersiveHero />

        {/* Story Panels - Scroll-triggered narrative */}
        {storyPanels.map((panel, index) => (
          <StoryPanel
            key={index}
            title={panel.title}
            description={panel.description}
            image={panel.image}
            index={index + 1}
          />
        ))}

        {/* 3D Product Showcase - Interactive rotating bottle */}
        <Product3D />

        {/* Collections Grid - 3D flip cards */}
        <CollectionsGrid3D />

        {/* Testimonials - Floating cards */}
        <TestimonialsGSAP />

        {/* Footer CTA - Magnetic buttons */}
        <FooterCTAMagnetic />
      </div>
    </PageTransition>
  );
};

export default Home;