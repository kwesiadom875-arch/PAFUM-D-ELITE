import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import './HeroSection.css';

const HeroSection = () => {
    const [config, setConfig] = useState({
        title: 'Discover Your Signature Scent',
        subtitle: 'Experience the art of luxury perfumery. Crafted for the elite.',
        buttonText: 'SHOP COLLECTION',
        buttonLink: '/shop',
        backgroundImage: ''
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/config/home_hero`);
                if (res.data) {
                    setConfig(prev => ({ ...prev, ...res.data }));
                }
            } catch (error) {
                console.error("Error fetching hero config:", error);
            }
        };
        fetchConfig();
    }, []);

    return (
        <section className="hero-section" style={config.backgroundImage ? { backgroundImage: `url(${config.backgroundImage})` } : {}}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <span className="hero-label fade-in-up">NEW COLLECTION</span>
                <h1 className="hero-title fade-in-up delay-1" dangerouslySetInnerHTML={{ __html: config.title.replace(/\n/g, '<br/>') }}>
                </h1>
                <p className="hero-subtitle fade-in-up delay-2">
                    {config.subtitle}
                </p>
                <div className="hero-cta fade-in-up delay-3">
                    <Link to={config.buttonLink} className="btn-primary">
                        {config.buttonText}
                    </Link>
                    <Link to="/find-your-scent" className="btn-secondary">
                        RARE GUIDE
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
