import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const RequestScent = () => {
    const [step, setStep] = useState(0);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [vibe, setVibe] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/catalog/brands`);
            setBrands(res.data);
        } catch (error) {
            console.error("Error fetching brands", error);
        }
    };

    const fetchProducts = async (brand) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/catalog/products?brand=${encodeURIComponent(brand)}`);
            setProducts(res.data);
            setStep(1);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        fetchProducts(brand);
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setStep(2);
    };

    const handleCustomRequest = () => {
        setSelectedProduct(null);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${API_URL}/api/requests`, {
                userVibe: vibe,
                email,
                phone,
                brand: selectedBrand,
                productName: selectedProduct ? selectedProduct.name : null,
                aiRecommendation: "User Request"
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting request", error);
        }
    };

    const filteredBrands = brands.filter(b => b.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderBrandSelection = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Select a Brand</h2>
            <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '30px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredBrands.map((brand, index) => (
                    <div
                        key={index}
                        onClick={() => handleBrandSelect(brand)}
                        style={{
                            padding: '20px',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#fff'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#C5A059'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                    >
                        {brand}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button className="btn-outline" onClick={() => { setSelectedBrand(null); setStep(2); }}>
                    Brand not listed? Make a custom request
                </button>
            </div>
        </motion.div>
    );

    const renderProductSelection = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>
                &larr; Back to Brands
            </button>
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>{selectedBrand} Collection</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {products.map((product, index) => (
                    <div
                        key={index}
                        onClick={() => handleProductSelect(product)}
                        style={{
                            padding: '20px',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: '#fff'
                        }}
                    >
                        <h4 style={{ marginBottom: '10px' }}>{product.name}</h4>
                        {product.price > 0 && <p style={{ color: '#C5A059' }}>${product.price}</p>}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button className="btn-outline" onClick={handleCustomRequest}>
                    Product not listed? Request specific item
                </button>
            </div>
        </motion.div>
    );

    const renderRequestForm = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <button onClick={() => setStep(selectedBrand ? 1 : 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>
                &larr; Back
            </button>
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>
                {selectedProduct ? `Request ${selectedProduct.name}` : 'Custom Request'}
            </h2>
            {selectedBrand && !selectedProduct && <p style={{ color: '#666', marginBottom: '20px' }}>Brand: {selectedBrand}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#fafafa' }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#fafafa' }}
                    />
                </div>
                <textarea
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder={selectedProduct ? "Any specific details? (e.g. Size, Concentration)" : "Describe your dream fragrance..."}
                    required={!selectedProduct}
                    style={{
                        width: '100%',
                        height: '150px',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        fontFamily: 'inherit',
                        marginBottom: '30px',
                        resize: 'none',
                        backgroundColor: '#fafafa'
                    }}
                />
                <button type="submit" className="btn-primary full-width">Submit Request</button>
            </form>
        </motion.div>
    );

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
            <div className="glass-card" style={{ padding: '50px', borderRadius: '16px' }}>
                {!submitted ? (
                    <AnimatePresence mode="wait">
                        {step === 0 && renderBrandSelection()}
                        {step === 1 && renderProductSelection()}
                        {step === 2 && renderRequestForm()}
                    </AnimatePresence>
                ) : (
                    <div className="animate-fade-up" style={{ textAlign: 'center' }}>
                        <h3 style={{ color: '#C5A059', marginBottom: '15px' }}>Request Received</h3>
                        <p>Our sommeliers have received your request. We will notify you if we find a match.</p>
                        <button className="btn-outline" style={{ marginTop: '30px' }} onClick={() => { setSubmitted(false); setStep(0); setSelectedBrand(null); setSelectedProduct(null); setVibe(''); }}>Make Another Request</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestScent;
