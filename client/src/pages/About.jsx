import React from 'react';
import { motion } from 'framer-motion';
import { FaGem, FaHandshake, FaLeaf, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './About.css';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const About = () => {
    return (
        <div className="about-container">
            {/* Hero Section */}
            <div className="about-hero">
                <motion.div
                    className="about-hero-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>Redefining Luxury in the Tropics</h1>
                    <p>Authentic. Curated. Climate-Optimized.</p>
                </motion.div>
            </div>

            {/* Philosophy Section */}
            <section className="about-section philosophy-section">
                <div className="philosophy-grid">
                    <motion.div
                        className="philosophy-text"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="section-title" style={{ left: 0, transform: 'none', textAlign: 'left', margin: '0 0 2rem 0' }}>
                            Climate-Optimized Curation
                        </h2>
                        <p>
                            At Parfum D'Élite, we understand that fragrance is a living art form that changes with its environment.
                            A scent that whispers in Paris may scream in Accra, or vanish entirely in the tropical heat.
                        </p>
                        <p>
                            Unlike international retailers, we don't just sell perfumes; we stress-test them.
                            Every bottle in our collection undergoes a rigorous <strong>Climate-Optimization Protocol</strong> in Accra's unique humidity and heat.
                        </p>
                        <p>
                            We verify longevity, projection, and note development to ensure that what you buy isn't just a luxury brand—it's a masterpiece that performs.
                        </p>
                    </motion.div>
                    <motion.div
                        className="philosophy-image"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Placeholder for a high-quality image of perfume bottles in sunlight or a tropical setting */}
                        <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1000&auto=format&fit=crop" alt="Perfume in sunlight" />
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="about-section values-section">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Our Core Values
                </motion.h2>

                <motion.div
                    className="values-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div className="value-card" variants={fadeInUp}>
                        <FaGem className="value-icon" />
                        <h4>Authenticity</h4>
                        <p>We never compromise. Every bottle is 100% authentic, verified through a multi-layer inspection process. When in doubt, we throw it out.</p>
                    </motion.div>

                    <motion.div className="value-card" variants={fadeInUp}>
                        <FaHandshake className="value-icon" />
                        <h4>Trust</h4>
                        <p>We are building a community, not just a customer base. We believe in honest communication, reliable shipping, and long-term relationships.</p>
                    </motion.div>

                    <motion.div className="value-card" variants={fadeInUp}>
                        <FaLeaf className="value-icon" />
                        <h4>Curation</h4>
                        <p>We are trend-setters, not just retailers. We reject thousands of products to bring you only the few that truly deserve to be in your collection.</p>
                    </motion.div>

                    <motion.div className="value-card" variants={fadeInUp}>
                        <FaHeart className="value-icon" />
                        <h4>Passion</h4>
                        <p>We do this because we love it. This passion drives us to find the hidden gems and share the joy of olfactory discovery with you.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Founders Section */}
            <section className="about-section founders-section">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    The Founders
                </motion.h2>

                <div className="founders-grid">
                    <motion.div
                        className="founder-card"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="founder-image">
                            {/* Placeholder for Manu-Ofosu's photo */}
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" alt="Manu-Ofosu Agya-Kwesi Adom" />
                        </div>
                        <div className="founder-info">
                            <h3>Manu-Ofosu Agya-Kwesi Adom</h3>
                            <span className="founder-role">Co-Founder & Operations Lead</span>
                            <p className="founder-bio">
                                The architect of the Parfum D'Élite experience. Manu-Ofosu ensures that every interaction, from the first message to the unboxing, is seamless.
                                His obsession with operational excellence guarantees that your luxury experience is never compromised by logistics.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="founder-card"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="founder-image">
                            {/* Placeholder for Oscar's photo */}
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop" alt="Oscar Ekow Menya Mensah" />
                        </div>
                        <div className="founder-info">
                            <h3>Oscar Ekow Menya Mensah</h3>
                            <span className="founder-role">Co-Founder & Creative Director</span>
                            <p className="founder-bio">
                                The nose and the eye behind the brand. Oscar's deep knowledge of fragrance chemistry and market trends drives our curation.
                                He personally oversees the climate-testing process, ensuring every scent tells a story that endures.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2>Experience the Difference</h2>
                    <p>Join the community of connoisseurs who refuse to compromise.</p>
                    <Link to="/shop" className="cta-button">Explore the Collection</Link>
                </motion.div>
            </section>
        </div>
    );
};

export default About;
