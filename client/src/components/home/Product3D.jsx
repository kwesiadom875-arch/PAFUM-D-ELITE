import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import axios from 'axios';
import PropTypes from 'prop-types';
import API_URL from '../../config';
import { retryRequest } from '../../utils/errorHandler';
import './Product3D.css';

gsap.registerPlugin(ScrollTrigger);

// 3D Bottle Component
const Bottle = ({ scrollProgress, productColor }) => {
    const bottleRef = useRef();

    useFrame(() => {
        if (bottleRef.current && scrollProgress.current !== undefined) {
            // Rotate bottle based on scroll
            bottleRef.current.rotation.y = scrollProgress.current * Math.PI * 2;
        }
    });

    // Convert product color or use default gold
    const liquidColor = productColor || "#d4a574";

    return (
        <group ref={bottleRef}>
            {/* Bottle Body - Cylinder */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.5}
                />
            </mesh>

            {/* Bottle Cap */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} />
                <meshStandardMaterial
                    color="#C5A059"
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Liquid Inside */}
            <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.75, 0.75, 2.5, 32]} />
                <meshPhysicalMaterial
                    color={liquidColor}
                    transparent
                    opacity={0.6}
                    roughness={0.1}
                    metalness={0.2}
                />
            </mesh>
        </group>
    );
};

Bottle.propTypes = {
    scrollProgress: PropTypes.object.isRequired,
    productColor: PropTypes.string
};

const Product3D = () => {
    const containerRef = useRef(null);
    const scrollProgress = useRef(0);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProduct();
    }, []);

    const fetchFeaturedProduct = async () => {
        try {
            await retryRequest(async () => {
                // Fetch from featured showcase (first product)
                const res = await axios.get(`${API_URL}/api/featured-showcase`);
                if (res.data && res.data.length > 0) {
                    setProduct(res.data[0]); // Use first featured product
                } else {
                    // Fallback to any product
                    const fallbackRes = await axios.get(`${API_URL}/api/products?limit=1`);
                    if (fallbackRes.data && fallbackRes.data.length > 0) {
                        setProduct(fallbackRes.data[0]);
                    }
                }
            });
        } catch (err) {
            console.error('Failed to fetch product:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                pin: '.canvas-container',
                scrub: 1,
                onUpdate: (self) => {
                    scrollProgress.current = self.progress;
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    if (loading) {
        return (
            <section className="product-3d-section" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#C5A059', fontSize: '1.5rem' }}>Loading...</p>
            </section>
        );
    }

    // Parse notes from product data
    const parseNotes = (notesString) => {
        if (!notesString) return [];
        return notesString.split(',').map(note => note.trim()).slice(0, 3);
    };

    const topNotes = product?.notes ? parseNotes(product.notes) : ['Jasmine', 'Saffron', 'Bergamot'];
    const productName = product?.name || 'Premium Fragrance';
    const productBrand = product?.brand || 'Luxury Brand';

    return (
        <section className="product-3d-section" ref={containerRef}>
            <div className="canvas-container">
                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} />

                    {/* Lighting */}
                    <ambientLight intensity={0.3} color="#C5A059" />
                    <spotLight
                        position={[5, 5, 5]}
                        angle={0.3}
                        penumbra={1}
                        intensity={1}
                        castShadow
                        color="#ffffff"
                    />
                    <spotLight
                        position={[-5, 5, -5]}
                        angle={0.3}
                        penumbra={1}
                        intensity={0.5}
                        color="#C5A059"
                    />

                    {/* 3D Bottle */}
                    <Bottle scrollProgress={scrollProgress} productColor="#d4a574" />

                    {/* Environment for reflections */}
                    <Environment preset="city" />
                </Canvas>

                {/* Product Name Overlay */}
                <div className="product-name-overlay">
                    <h2>{productName}</h2>
                    <p>{productBrand}</p>
                </div>
            </div>

            <div className="product-info-overlay">
                <div className="info-item" data-scroll-reveal="1">
                    <span className="info-label">Concentration</span>
                    <span className="info-value">{product?.concentration || 'Eau de Parfum'}</span>
                </div>
                <div className="info-item" data-scroll-reveal="2">
                    <span className="info-label">Notes</span>
                    <span className="info-value">{topNotes.join(', ')}</span>
                </div>
                <div className="info-item" data-scroll-reveal="3">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{product?.gender || 'Unisex'}</span>
                </div>
                <div className="info-item" data-scroll-reveal="4">
                    <span className="info-label">Price</span>
                    <span className="info-value">GH₵{product?.price || '299'}</span>
                </div>
            </div>
        </section>
    );
};

export default Product3D;
