import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import TransparentImg from '../TransparentImg';
import { retryRequest } from '../../utils/errorHandler';
import { CardSkeleton } from '../LoadingSkeleton';
import './FeaturedCarousel.css';

gsap.registerPlugin(ScrollTrigger, Draggable);

const FeaturedCarousel = () => {
    const containerRef = useRef(null);
    const carouselRef = useRef(null);
    const progressBarRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const res = await axios.get(`${API_URL}/api/products?limit=8`);
                setProducts(res.data.slice(0, 8));
            });
        } catch (err) {
            console.error('Failed to fetch products, using fallback:', err);
            // Fallback products
            setProducts([
                { _id: '1', name: 'Baccarat Rouge 540', brand: 'MFK', image: '/images/halfeti.png', price: 350 },
                { _id: '2', name: 'Oud Wood', brand: 'Tom Ford', image: '/images/halfeti.png', price: 280 },
                { _id: '3', name: 'Aventus', brand: 'Creed', image: '/images/halfeti.png', price: 445 }
            ]);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current || !carouselRef.current || products.length === 0) return;

        const ctx = gsap.context(() => {
            // Pin section while scrolling
            const scrollWidth = carouselRef.current.scrollWidth;
            const viewportWidth = window.innerWidth;

            const tl = gsap.to(carouselRef.current, {
                x: () => -(scrollWidth - viewportWidth + 200),
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    end: () => `+=${scrollWidth - viewportWidth + 200}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        // Update progress bar
                        if (progressBarRef.current) {
                            gsap.to(progressBarRef.current, {
                                scaleX: self.progress,
                                duration: 0.1
                            });
                        }
                    }
                }
            });

            // Parallax effect on product images
            const cards = carouselRef.current.querySelectorAll('.featured-card');
            cards.forEach((card, i) => {
                const img = card.querySelector('.featured-product-img');
                if (img) {
                    gsap.to(img, {
                        y: -30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, [products]);

    const displayProducts = products.length > 0 ? products : [];

    return (
        <section className="featured-carousel-section" ref={containerRef}>
            <div className="featured-header">
                <h3 className="gold-text">Featured Selection</h3>
                <h2>Handpicked For You</h2>
                <p>Scroll to explore our curated collection of premium fragrances</p>
            </div>

            <div className="carousel-wrapper">
                <div className="featured-carousel" ref={carouselRef}>
                    {isFetching ? (
                        <div style={{ display: 'flex', gap: '2rem', padding: '0 2rem' }}>
                            <CardSkeleton count={4} />
                        </div>
                    ) : (
                        displayProducts.map((product, index) => (
                            <div key={product._id} className="featured-card">
                                <div className="featured-card-inner">
                                    <div className="featured-image-wrapper">
                                        <TransparentImg
                                            src={product.image}
                                            alt={product.name}
                                            className="featured-product-img"
                                        />
                                    </div>
                                    <div className="featured-info">
                                        <span className="featured-brand">{product.brand || 'Premium'}</span>
                                        <h3>{product.name}</h3>
                                        <p className="featured-price">${product.price || '299'}</p>
                                        <Link to={`/product/${product._id}`} className="btn-primary">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar" ref={progressBarRef}></div>
            </div>
        </section>
    );
};

export default FeaturedCarousel;
