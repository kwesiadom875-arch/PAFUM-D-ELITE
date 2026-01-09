import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import './CategoryBanners.css';

const CategoryBanners = () => {
    const [categories, setCategories] = useState([
        {
            id: 1,
            title: "Women's Fragrances",
            subtitle: "Elegant & captivating scents",
            link: "/shop?category=Women",
            image: "https://images.unsplash.com/photo-1585120040315-2241b774ad0f?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Men's Fragrances",
            subtitle: "Bold & sophisticated scents",
            link: "/shop?category=Men",
            image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Luxury Collections",
            subtitle: "Exclusive designer perfumes",
            link: "/shop?category=Luxury",
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2669&auto=format&fit=crop"
        }
    ]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/config/home_banners`);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    // Filter out empty ones if any, or just use them
                    const validBanners = res.data.filter(b => b.title || b.image);
                    if (validBanners.length > 0) {
                        setCategories(validBanners);
                    }
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();
    }, []);

    return (
        <section className="category-banners-section">
            <div className="container">
                <div className="banners-grid">
                    {categories.map((cat, index) => (
                        <div key={index} className="banner-item">
                            <div className="banner-image" style={{ backgroundImage: `url(${cat.image})` }}></div>
                            <div className="banner-overlay"></div>
                            <div className="banner-content">
                                <h3 className="banner-title">{cat.title}</h3>
                                <p className="banner-subtitle">{cat.subtitle}</p>
                                <Link to={cat.link} className="banner-link">Shop Now</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryBanners;
