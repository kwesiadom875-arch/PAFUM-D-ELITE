import React from 'react';
import './BrandEssence.css';

const BrandEssence = () => {
    return (
        <section className="brand-essence-section">
            <div className="container essence-container">
                <div className="essence-image">
                    {/* Placeholder Image */}
                    <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop" alt="Perfume Ingredients" />
                </div>
                <div className="essence-content">
                    <h2 className="section-title">The Essence of Luxury</h2>
                    <p>
                        At Parfum D'Elite, we believe that a fragrance is more than just a scent—it is an extension of your identity.
                        Our master perfumers travel the globe to source the rarest ingredients, from the sun-drenched jasmine fields of Grasse
                        to the ancient oud forests of Southeast Asia.
                    </p>
                    <p>
                        Each bottle is a masterpiece, crafted with patience, precision, and passion. We invite you to discover a world
                        where art and alchemy meet.
                    </p>
                    <div className="signature">
                        <span>Josie</span>
                        <small>Master Perfumer</small>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandEssence;
