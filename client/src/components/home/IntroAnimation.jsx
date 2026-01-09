import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import TextPlugin from 'gsap/TextPlugin';
import './IntroAnimation.css';

gsap.registerPlugin(TextPlugin);

const IntroAnimation = ({ onComplete }) => {
    const containerRef = useRef(null);
    const textContainerRef = useRef(null);
    const logoRef = useRef(null);
    const cursorRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial state
            gsap.set(logoRef.current, { scale: 2.5, opacity: 0 }); // Set scale initially, animate opacity/parts
            gsap.set(".logo-part", { opacity: 0 }); // Hide all parts initially

            // 1. Typewriter effect for "WELC"
            tl.to(".part-1", { text: "WELC", duration: 0.5, ease: "none" })

                // 2. Logo Build-Up (Replaces simple pop)
                .addLabel("logoStart")
                .to(logoRef.current, { opacity: 1, duration: 0.1 }, "logoStart")

                // Rings spin and scale in
                .fromTo(".logo-ring-1",
                    { scale: 0, rotation: -180, opacity: 0, transformOrigin: "50% 50%" },
                    { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
                    "logoStart"
                )
                .fromTo(".logo-ring-2",
                    { scale: 0, rotation: 180, opacity: 0, transformOrigin: "50% 50%" },
                    { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
                    "logoStart+=0.1"
                )

                // Main shape slides up
                .fromTo(".logo-main",
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                    "logoStart+=0.2"
                )

                // Accent slides down
                .fromTo(".logo-accent",
                    { y: -50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                    "logoStart+=0.3"
                )

                // 3. Typewriter effect for "ME TO"
                .to(".part-2", { text: "ME TO", duration: 0.6, ease: "none" }, "logoStart+=0.8")

                // 4. Typewriter effect for "PARFUM D'ELITE" (New Line)
                .to(".part-3", { text: "PARFUM D'ELITE", duration: 1.2, ease: "none" })

                // Blink cursor during typing
                .to(cursorRef.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.5 }, 0)

                // Hold
                .to({}, { duration: 2.5 })

                // Fade out and complete
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    onStart: () => {
                        if (containerRef.current) containerRef.current.style.pointerEvents = 'none';
                    }
                })
                .call(onComplete);

        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div className="intro-overlay" ref={containerRef}>
            <div className="intro-content" ref={textContainerRef}>
                <div className="line-1">
                    <span className="part-1"></span>
                    <div className="logo-container">
                        <div ref={logoRef} className="intro-logo-inline">
                            {/* Custom Logo SVG */}
                            <svg viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <g>
                                        <circle className="logo-part logo-ring-1" cx="500" cy="499.65" r="202.25" style={{ fill: 'none', stroke: '#D4AF46', strokeWidth: 6, strokeMiterlimit: 10 }} />
                                        <ellipse className="logo-part logo-ring-2" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -206.8605 499.898)" cx="500" cy="499.65" rx="193.25" ry="193.25" style={{ fill: 'none', stroke: '#D4AF37', strokeWidth: 5, strokeMiterlimit: 10 }} />
                                    </g>
                                    <g>
                                        <path className="logo-part logo-main" d="M486.28,486.56l-54.05,80.09c13.81-9.65,26.87-14.48,39.18-14.48c11.16,0,26.21,3.9,45.16,11.69l25.23,10.49
                                            c7.35,3.01,12.35,4.52,15.01,4.52c4.87,0,10.67-4.91,17.4-14.74l4.12,2.52c-0.8,1.24-1.28,1.99-1.46,2.26l-8.77,12.48l-8.5,13.28
                                            c-0.18,0.35-0.8,1.24-1.86,2.66c-8.32-2.04-18.77-5.93-31.34-11.69c-17.44-7.88-30.99-13.28-40.64-16.2s-18.95-4.38-27.89-4.38
                                            c-9.47,0-17.53,2.12-24.17,6.38s-13.28,11.55-19.92,21.91l-3.98-2.79l27.36-41.3c-10.89-13.63-16.34-28.91-16.34-45.82
                                            c0-14.25,4.43-26.7,13.28-37.32c8.85-10.62,19.21-15.94,31.08-15.94c10.09,0,19.3,5,27.62,15.01l0.8-1.33l3.98-6.91
                                            c3.28-5.49,4.91-10.05,4.91-13.68c0-1.59-0.58-3.19-1.73-4.78c1.68-0.09,2.57-0.13,2.66-0.13l7.17-0.27c1.15,0,3.76-0.27,7.84-0.8
                                            l1.86-0.27c-2.04,2.66-5.89,8.37-11.55,17.13c-2.74,4.25-5.84,8.81-9.3,13.68l-2.12,3.05c0.8,1.06,1.24,1.68,1.33,1.86l7.7,10.76
                                            c12.93,17.8,27.71,26.7,44.36,26.7c10.45,0,19.86-5.18,28.22-15.54c8.37-10.36,12.55-22.05,12.55-35.06
                                            c0-20.63-14.56-30.95-43.7-30.95c-12.66,0-36.04,1.33-70.12,3.98l-38.52,3.05c-8.59,0.71-17.53,1.06-26.83,1.06
                                            c-16.82,0-28.29-2.08-34.4-6.24l10.23-37.32l4.65,1.2l-0.4,2.26c-1.15,5.14-1.73,8.9-1.73,11.29c0,4.34,1.9,7.37,5.71,9.1
                                            c3.81,1.73,10.49,2.59,20.05,2.59c14.61,0,36.12-1.15,64.55-3.45c32.05-2.57,54.45-3.85,67.2-3.85c37.54,0,56.31,12.8,56.31,38.38
                                            c0,15.32-5.53,29.84-16.6,43.56c-13.1,16.2-29.62,24.31-49.54,24.31c-10.01,0-18.64-2.12-25.9-6.38s-15.27-11.86-24.04-22.84
                                            L486.28,486.56z M482.16,481.25c-4.87-6.73-9.34-11.55-13.41-14.48s-8.37-4.38-12.88-4.38c-7.7,0-14.1,2.94-19.19,8.83
                                            c-5.09,5.89-7.64,13.35-7.64,22.38c0,12.4,6.06,25.81,18.19,40.24L482.16,481.25z" fill="#000000" />
                                    </g>
                                    <path className="logo-part logo-accent" d="M507.94,401.65l15.87-22c3.09-4.28,5.58-7.2,7.47-8.76c1.89-1.56,4.03-2.34,6.44-2.34c4.4,0,6.59,2.14,6.59,6.42
                                        c0,3.46-3.37,7.71-10.1,12.73l-24.31,18.34c-1.65,1.22-2.78,1.83-3.4,1.83c-0.96,0-1.44-0.44-1.44-1.32
                                        C505.05,405.93,506.01,404.3,507.94,401.65z" fill="#000000" />
                                </g>
                            </svg>
                        </div>
                    </div>
                    <span className="part-2"></span>
                </div>
                <div className="line-2">
                    <span className="part-3"></span><span ref={cursorRef} className="cursor">|</span>
                </div>
            </div>
        </div>
    );
};

export default IntroAnimation;
