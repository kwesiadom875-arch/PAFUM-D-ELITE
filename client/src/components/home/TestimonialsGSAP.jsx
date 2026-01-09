import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './TestimonialsGSAP.css';

const TestimonialsGSAP = () => {
    const carouselRef = useRef(null);
    const wrapperRef = useRef(null);
    const animationRef = useRef(null);

    const testimonials = [
        {
            name: "Nana",
            role: "Beauty Enthusiast",
            text: "A terrific piece of praise. The packaging was immaculate and the scent lasts all day.",
            avatar: "N"
        },
        {
            name: "Ama",
            role: "Collector",
            text: "Josie recommended the perfect scent for my wedding. Incredible service and attention to detail.",
            avatar: "A"
        },
        {
            name: "Kojo",
            role: "Verified Buyer",
            text: "Negotiated a great price on the Sauvage. Fast delivery and authentic product.",
            avatar: "K"
        },
        {
            name: "Esi",
            role: "Fragrance Lover",
            text: "The unboxing experience was magical. I felt like royalty opening my package.",
            avatar: "E"
        },
        {
            name: "Kwame",
            role: "Elite Member",
            text: "The Ultra Niche collection is unmatched. Truly unique scents I can't find anywhere else.",
            avatar: "K"
        }
    ];

    // Duplicate testimonials for seamless loop
    const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

    useEffect(() => {
        if (!carouselRef.current) return;

        const carousel = carouselRef.current;
        const cardWidth = 400; // min-width + gap
        const totalWidth = cardWidth * testimonials.length;

        // Set up infinite loop animation
        animationRef.current = gsap.to(carousel, {
            x: -totalWidth,
            duration: 30,
            ease: 'none',
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
            }
        });

        // Pause on hover
        const handleMouseEnter = () => {
            if (animationRef.current) {
                gsap.to(animationRef.current, { timeScale: 0, duration: 0.5 });
            }
        };

        const handleMouseLeave = () => {
            if (animationRef.current) {
                gsap.to(animationRef.current, { timeScale: 1, duration: 0.5 });
            }
        };

        if (wrapperRef.current) {
            wrapperRef.current.addEventListener('mouseenter', handleMouseEnter);
            wrapperRef.current.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.kill();
            }
            if (wrapperRef.current) {
                wrapperRef.current.removeEventListener('mouseenter', handleMouseEnter);
                wrapperRef.current.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <section className="testimonials-gsap-section">
            <div className="testimonials-header">
                <h3 className="gold-text">Testimonials</h3>
                <h2>What Our Clients Say</h2>
                <p>Real experiences from our valued customers</p>
            </div>

            <div className="testimonials-wrapper" ref={wrapperRef}>
                <div className="testimonials-carousel" ref={carouselRef}>
                    {duplicatedTestimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="quote-icon">"</div>
                            <p className="testimonial-text">{testimonial.text}</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">{testimonial.avatar}</div>
                                <div className="author-info">
                                    <span className="author-name">{testimonial.name}</span>
                                    <span className="author-role">{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="testimonials-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
        </section>
    );
};

export default TestimonialsGSAP;
