import React from 'react';
import { FaTruck, FaShieldAlt, FaGift, FaStar } from 'react-icons/fa';
import './FeaturesRow.css';

const features = [
    {
        id: 1,
        icon: <FaTruck />,
        title: "Free Shipping",
        text: "On orders over $100"
    },
    {
        id: 2,
        icon: <FaShieldAlt />,
        title: "100% Authentic",
        text: "Guaranteed genuine products"
    },
    {
        id: 3,
        icon: <FaGift />,
        title: "Luxury Packaging",
        text: "Beautiful gift-ready boxes"
    },
    {
        id: 4,
        icon: <FaStar />,
        title: "Sample Program",
        text: "Try before you buy"
    }
];

const FeaturesRow = () => {
    return (
        <section className="features-row-section">
            <div className="container">
                <div className="features-grid">
                    {features.map((feature) => (
                        <div key={feature.id} className="feature-item">
                            <div className="feature-icon-box">
                                {feature.icon}
                            </div>
                            <h4 className="feature-title">{feature.title}</h4>
                            <p className="feature-text">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesRow;
