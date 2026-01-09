import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { retryRequest } from '../../utils/errorHandler';
import './ImmersiveHero.css';

gsap.registerPlugin(ScrollTrigger);

const ImmersiveHero = () => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const textRef = useRef(null);
    const overlayRef = useRef(null);
    const [featured, setFeatured] = useState(null);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            await retryRequest(async () => {
                const res = await axios.get(`${API_URL}/api/featured`);
                if (res.data && res.data.name) {
                    setFeatured(res.data);
                }
            });
        } catch (err) {
            console.error('Failed to fetch featured:', err);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Parallax text animation
            gsap.to(textRef.current, {
                y: 200,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            // Overlay fade
            gsap.to(overlayRef.current, {
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '50% top',
                    scrub: 1
                }
            });

            // Scroll indicator fade
            gsap.to('.scroll-indicator', {
                opacity: 0,
                y: -20,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '20% top',
                    scrub: 1
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="immersive-hero" ref={containerRef}>
            <div className="hero-video-container">
                <video
                    ref={videoRef}
                    className="hero-video-bg"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source
                        src={featured?.videoUrl || "/Baccarat Rouge 540-smooth.mp4"}
                        type="video/mp4"
                    />
                </video>

                <div className="hero-overlay" ref={overlayRef}></div>

                <div className="hero-content" ref={textRef}>
                    <h1 className="hero-title">
                        {featured?.name || "The Essence of Luxury"}
                    </h1>
                    <p className="hero-subtitle">
                        {featured?.tagline || "A journey through the senses"}
                    </p>
                    <Link to="/shop" className="hero-cta">
                        Discover
                    </Link>
                </div>

                <div className="scroll-indicator">
                    <span>Scroll to explore</span>
                    <div className="scroll-line"></div>
                </div>
            </div>
        </section>
    );
};

export default ImmersiveHero;
