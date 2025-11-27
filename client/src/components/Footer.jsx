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
                    <h3 className="footer-logo">Parfum <span style={{ color: '#C5A059' }}>D'Elite</span></h3>
                    <p>Experience the essence of luxury. Curated scents for the distinguished individual.</p>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FaFacebook /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="Twitter"><FaTwitter /></a>
                    </div>
                </div>

                {/* Links Section */}
                <div className="footer-links-group">
                    <div className="footer-col">
                        <h4>Shop</h4>
                        <Link to="/shop">All Perfumes</Link>
                        <Link to="/shop?category=Luxury">Luxury Collection</Link>
                        <Link to="/shop?category=Niche">Niche Scents</Link>
                        <Link to="/find-your-scent">Scent Finder</Link>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/terms">Terms & Conditions</Link>
                    </div>

                    <div className="footer-col">
                        <h4>Account</h4>
                        <Link to="/profile">My Profile</Link>
                        <Link to="/cart">Shopping Bag</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/auth?mode=signin">Sign In</Link>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Parfum D'Elite. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
