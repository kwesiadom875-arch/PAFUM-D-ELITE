import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container footer-container">

                {/* Brand Section */}
                <div className="footer-col brand-col">
                    <h3 className="footer-logo">Parfum D'Elite</h3>
                    <p className="footer-tagline">Your premier destination for authentic luxury fragrances</p>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FaFacebook /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="Twitter"><FaTwitter /></a>
                    </div>
                </div>

                {/* Shop Links */}
                <div className="footer-col">
                    <h4>Shop</h4>
                    <Link to="/shop?sort=newest">New Arrivals</Link>
                    <Link to="/shop?category=Luxury">Luxury</Link>
                    <Link to="/shop?category=Niche">Niche</Link>
                    <Link to="/shop">Collections</Link>
                    <Link to="/shop?onSale=true">Sale</Link>
                </div>

                {/* Customer Care */}
                <div className="footer-col">
                    <h4>Customer Care</h4>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/shipping">Shipping Info</Link>
                    <Link to="/returns">Returns</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/size-guide">Size Guide</Link>
                </div>

                {/* Newsletter */}
                <div className="footer-col newsletter-col">
                    <h4>Join the Elite</h4>
                    <p>Subscribe to receive updates and exclusive offers</p>
                    <form className="footer-newsletter-form">
                        <input type="email" placeholder="Your email address" />
                        <button type="submit" aria-label="Subscribe">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Parfumerie. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
