import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { magneticButton } from '../../utils/gsapUtils';
import './FooterCTAMagnetic.css';

const FooterCTAMagnetic = () => {
    const sectionRef = useRef(null);
    const primaryBtnRef = useRef(null);
    const secondaryBtnRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Title reveal animation
            if (titleRef.current) {
                gsap.from(titleRef.current.children, {
                    y: 100,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%'
                    }
                });
            }

            // Gradient animation - use sectionRef instead of class selector
            if (sectionRef.current) {
                gsap.to(sectionRef.current, {
                    backgroundPosition: '200% center',
                    duration: 8,
                    ease: 'none',
                    repeat: -1
                });
            }
        }, sectionRef);

        // Magnetic button effects
        const cleanupPrimary = magneticButton(primaryBtnRef, 0.4);
        const cleanupSecondary = magneticButton(secondaryBtnRef, 0.3);

        return () => {
            ctx.revert();
            if (cleanupPrimary) cleanupPrimary();
            if (cleanupSecondary) cleanupSecondary();
        };
    }, []);

    return (
        <section className="footer-cta-magnetic" ref={sectionRef}>
            <div className="cta-content">
                <h2 ref={titleRef}>
                    <span>Ready to Find</span>
                    <span>Your Next Scent?</span>
                </h2>
                <p>Let our AI guide you to your perfect fragrance match</p>

                <div className="cta-buttons-magnetic">
                    <Link
                        to="/find-your-scent"
                        className="btn-magnetic btn-primary-magnetic"
                        ref={primaryBtnRef}
                    >
                        <span className="btn-text">Start AI Quiz</span>
                        <span className="btn-hover-effect"></span>
                    </Link>

                    <Link
                        to="/shop"
                        className="btn-magnetic btn-secondary-magnetic"
                        ref={secondaryBtnRef}
                    >
                        <span className="btn-text">Shop All Perfumes</span>
                        <span className="btn-hover-effect"></span>
                    </Link>
                </div>
            </div>

            {/* Animated background elements */}
            <div className="cta-bg-elements">
                <div className="floating-particle particle-1"></div>
                <div className="floating-particle particle-2"></div>
                <div className="floating-particle particle-3"></div>
                <div className="floating-particle particle-4"></div>
                <div className="floating-particle particle-5"></div>
            </div>
        </section>
    );
};

export default FooterCTAMagnetic;
