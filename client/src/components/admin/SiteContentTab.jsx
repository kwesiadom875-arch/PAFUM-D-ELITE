import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';

const SiteContentTab = () => {
    const [banners, setBanners] = useState([
        { id: 1, title: '', subtitle: '', link: '', image: '', accessTier: 'All' },
        { id: 2, title: '', subtitle: '', link: '', image: '', accessTier: 'All' },
        { id: 3, title: '', subtitle: '', link: '', image: '', accessTier: 'All' }
    ]);

    const [heroConfig, setHeroConfig] = useState({
        title: 'Discover Your Signature Scent',
        subtitle: 'Experience the art of luxury perfumery. Crafted for the elite.',
        buttonText: 'SHOP COLLECTION',
        buttonLink: '/shop',
        backgroundImage: '' // Optional override
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const [bannersRes, heroRes] = await Promise.allSettled([
                axios.get(`${API_URL}/api/config/home_banners`),
                axios.get(`${API_URL}/api/config/home_hero`)
            ]);

            if (bannersRes.status === 'fulfilled' && Array.isArray(bannersRes.value.data)) {
                setBanners(bannersRes.value.data);
            }
            if (heroRes.status === 'fulfilled' && heroRes.value.data) {
                setHeroConfig(prev => ({ ...prev, ...heroRes.value.data }));
            }
        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBannerChange = (index, field, value) => {
        const newBanners = [...banners];
        newBanners[index] = { ...newBanners[index], [field]: value };
        setBanners(newBanners);
    };

    const handleHeroChange = (field, value) => {
        setHeroConfig(prev => ({ ...prev, [field]: value }));
    };

    const saveContent = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await Promise.all([
                axios.post(`${API_URL}/api/config/home_banners`, { value: banners }, { headers }),
                axios.post(`${API_URL}/api/config/home_hero`, { value: heroConfig }, { headers })
            ]);

            toast.success('Site content updated successfully!');
        } catch (error) {
            console.error("Error saving content:", error);
            toast.error('Failed to update content');
        }
    };

    if (loading) return <div style={{ color: '#333' }}>Loading content...</div>;

    return (
        <div className="admin-tab-content form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Site Content Management</h3>
                <button className="btn-gold" onClick={saveContent}>
                    <FaSave style={{ marginRight: '8px' }} /> Save Changes
                </button>
            </div>

            {/* HERO SECTION */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
                <h4 style={{ color: '#C5A059', marginBottom: '15px' }}>Homepage Hero Section</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Hero Title</label>
                        <input
                            type="text"
                            value={heroConfig.title}
                            onChange={(e) => handleHeroChange('title', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Hero Subtitle</label>
                        <input
                            type="text"
                            value={heroConfig.subtitle}
                            onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Button Text</label>
                        <input
                            type="text"
                            value={heroConfig.buttonText}
                            onChange={(e) => handleHeroChange('buttonText', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Button Link</label>
                        <input
                            type="text"
                            value={heroConfig.buttonLink}
                            onChange={(e) => handleHeroChange('buttonLink', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Background Image/Video URL (Optional Override)</label>
                        <input
                            type="text"
                            value={heroConfig.backgroundImage}
                            onChange={(e) => handleHeroChange('backgroundImage', e.target.value)}
                            placeholder="Leave empty to use default image"
                        />
                    </div>
                </div>
            </div>

            {/* BANNERS SECTION */}
            <h4 style={{ color: '#C5A059', marginBottom: '15px' }}>Category Banners</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {banners.map((banner, index) => (
                    <div key={index} className="glass-card" style={{ padding: '20px' }}>
                        <h4 style={{ color: '#C5A059', marginBottom: '15px' }}>Banner {index + 1}</h4>

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={banner.title}
                                onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                                placeholder="e.g. Women's Fragrances"
                            />
                        </div>

                        <div className="form-group">
                            <label>Subtitle</label>
                            <input
                                type="text"
                                value={banner.subtitle}
                                onChange={(e) => handleBannerChange(index, 'subtitle', e.target.value)}
                                placeholder="e.g. Elegant & captivating scents"
                            />
                        </div>

                        <div className="form-group">
                            <label>Link Destination</label>
                            <select
                                value={[
                                    '/shop',
                                    '/shop?category=Women',
                                    '/shop?category=Men',
                                    '/shop?category=Luxury',
                                    '/shop?category=Niche',
                                    '/shop?category=Ultra Niche'
                                ].includes(banner.link) ? banner.link : 'custom'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== 'custom') {
                                        handleBannerChange(index, 'link', val);
                                    }
                                }}
                            >
                                <option value="/shop">Shop - All</option>
                                <option value="/shop?category=Women">Shop - Women</option>
                                <option value="/shop?category=Men">Shop - Men</option>
                                <option value="/shop?category=Luxury">Shop - Luxury</option>
                                <option value="/shop?category=Niche">Shop - Niche</option>
                                <option value="/shop?category=Ultra Niche">Shop - Ultra Niche</option>
                                <option value="custom">Custom URL</option>
                            </select>

                            {![
                                '/shop',
                                '/shop?category=Women',
                                '/shop?category=Men',
                                '/shop?category=Luxury',
                                '/shop?category=Niche',
                                '/shop?category=Ultra Niche'
                            ].includes(banner.link) && (
                                    <input
                                        type="text"
                                        style={{ marginTop: '10px' }}
                                        value={banner.link}
                                        onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
                                        placeholder="e.g. /shop?category=Women"
                                    />
                                )}
                        </div>

                        <div className="form-group">
                            <label>Access Tier</label>
                            <select
                                value={banner.accessTier || 'All'}
                                onChange={(e) => handleBannerChange(index, 'accessTier', e.target.value)}
                            >
                                <option value="All">All Users</option>
                                <option value="Gold">Gold & Above</option>
                                <option value="Diamond">Diamond & Above</option>
                                <option value="Elite Diamond">Elite Diamond Only</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Image URL</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={banner.image}
                                    onChange={(e) => handleBannerChange(index, 'image', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {banner.image && (
                            <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '150px' }}>
                                <img src={banner.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SiteContentTab;
