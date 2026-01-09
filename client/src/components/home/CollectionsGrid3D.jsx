import React, { useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartContext } from '../../context/CartContext';
import './CollectionsGrid3D.css';

gsap.registerPlugin(ScrollTrigger);

const CollectionsGrid3D = () => {
    const { user } = useContext(CartContext);
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    const collections = [
        {
            id: 'niche',
            title: 'Niche',
            description: 'Rare, artisanal creations for the true connoisseur. Discover scents that tell a unique story.',
            image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop',
            backDescription: 'Explore exclusive fragrances from independent perfume houses. Each bottle represents the vision of master perfumers.',
            link: '/shop?category=Niche'
        },
        {
            id: 'luxury',
            title: 'Luxury',
            description: 'Iconic scents from the world\'s top fashion houses. Timeless elegance and sophistication.',
            image: 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop',
            backDescription: 'Premium fragrances from renowned brands like Chanel, Dior, and Tom Ford. Experience luxury in every spray.',
            link: '/shop?category=Luxury'
        },
        {
            id: 'ultra-niche',
            title: 'Ultra Niche',
            description: 'Exclusive masterpieces reserved for our elite members. The pinnacle of perfumery.',
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
            backDescription: 'Ultra-rare fragrances with limited availability. Access granted only to Diamond and Elite Diamond members.',
            link: '/shop?category=Ultra%20Niche',
            restricted: true
        }
    ];

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Stagger entrance animation
            gsap.from(cardsRef.current, {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleCardFlip = (index) => {
        const card = cardsRef.current[index];
        if (!card) return;

        const isFlipped = card.classList.contains('flipped');

        if (isFlipped) {
            card.classList.remove('flipped');
        } else {
            card.classList.add('flipped');
        }
    };

    // Filter out Ultra Niche if user doesn't have access
    const visibleCollections = collections.filter(col => {
        if (col.restricted) {
            return user?.tier === 'Diamond' || user?.tier === 'Elite Diamond';
        }
        return true;
    });

    return (
        <section className="collections-3d-section container" ref={sectionRef}>
            <div className="section-header">
                <h3 className="gold-text">Collections</h3>
                <h2 className="section-title">Explore Our World</h2>
                <p className="section-subtitle">
                    Curated categories designed to match your unique taste and lifestyle
                </p>
            </div>

            <div className="collections-3d-grid">
                {visibleCollections.map((collection, index) => (
                    <div
                        key={collection.id}
                        className="collection-3d-card"
                        ref={el => cardsRef.current[index] = el}
                        onClick={() => handleCardFlip(index)}
                    >
                        <div className="card-inner">
                            {/* Front Face */}
                            <div className="card-face card-front">
                                <div className="card-image-wrapper">
                                    <img src={collection.image} alt={collection.title} />
                                    <div className="card-overlay"></div>
                                </div>
                                <div className="card-content">
                                    <h3>{collection.title}</h3>
                                    <p>{collection.description}</p>
                                    <span className="flip-hint">Click to learn more</span>
                                </div>
                            </div>

                            {/* Back Face */}
                            <div className="card-face card-back">
                                <div className="card-back-content">
                                    <h3>{collection.title}</h3>
                                    <p>{collection.backDescription}</p>
                                    <Link
                                        to={collection.link}
                                        className="btn-primary"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Explore Collection
                                    </Link>
                                    <span className="flip-hint">Click to flip back</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CollectionsGrid3D;
