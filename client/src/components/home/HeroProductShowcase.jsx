import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TransparentImg from '../TransparentImg';
import { retryRequest } from '../../utils/errorHandler';
import { CardSkeleton } from '../LoadingSkeleton';
import './HeroProductShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const HeroProductShowcase = () => {
    const containerRef = useRef(null);
    const scrollerRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                // Fetch from new featured showcase endpoint (max 4 products)
                const res = await axios.get(`${API_URL}/api/featured-showcase`);
                if (res.data && res.data.length > 0) {
                    setProducts(res.data);
                } else {
                    // Fallback to regular products if no featured products set
                    const fallbackRes = await axios.get(`${API_URL}/api/products?limit=4`);
                    setProducts(fallbackRes.data.slice(0, 4));
                }
            });
        } catch (err) {
            console.error('Failed to fetch featured products, using fallback:', err);
            // Use default fallback
            setProducts([
                { _id: '1', name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', image: '/images/mfk_540.jpg', price: 350 },
                { _id: '2', name: 'Oud Wood', brand: 'Tom Ford', image: '/images/tf_oudwood.jpg', price: 280 },
                { _id: '3', name: 'Layton', brand: 'Parfums de Marly', image: '/images/pdm_layton.jpg', price: 320 },
                { _id: '4', name: 'Lost Cherry', brand: 'Tom Ford', image: '/images/tf_cherry.jpg', price: 395 }
            ]);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current || !scrollerRef.current || products.length === 0) return;

        const ctx = gsap.context(() => {
            // Calculate scroll distance based on number of products
            const cardWidth = 700; // Approximate card width including gap
            const totalScrollWidth = cardWidth * products.length;

            // Horizontal scroll animation
            gsap.to(scrollerRef.current, {
                x: () => -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    invalidateOnRefresh: true
                }
            });

            // Parallax for product images
            const images = scrollerRef.current.querySelectorAll('.showcase-product-image');
            images.forEach((img, i) => {
                gsap.to(img, {
                    y: i % 2 === 0 ? -50 : 50,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [products]);

    if (products.length === 0) return null;

    return (
        <section className="hero-showcase-section" ref={containerRef}>
            <div className="showcase-scroller" ref={scrollerRef}>
                {isFetching ? (
                    <div style={{ display: 'flex', gap: '2rem', padding: '0 5vw' }}>
                        <CardSkeleton count={4} />
                    </div>
                ) : (
                    products.map((product, index) => (
                        <div key={product._id} className="showcase-product-card" data-index={index}>
                            <div className="showcase-product-image-wrapper">
                                <TransparentImg
                                    src={product.image}
                                    alt={product.name}
                                    className="showcase-product-image"
                                />
                            </div>
                            <div className="showcase-product-info">
                                <span className="showcase-brand">{product.brand || 'Premium Brand'}</span>
                                <h2>{product.name}</h2>
                                <p className="showcase-price">${product.price || '299'}</p>
                                <Link
                                    to={`/product/${product._id}`}
                                    className="btn-primary showcase-cta"
                                >
                                    Explore
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section >
    );
};

export default HeroProductShowcase;
