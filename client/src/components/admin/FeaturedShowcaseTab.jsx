import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { CardSkeleton } from '../LoadingSkeleton';

const FeaturedShowcaseTab = () => {
    const [products, setProducts] = useState([]);
    const [featuredShowcase, setFeaturedShowcase] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const [productsRes, showcaseRes] = await Promise.all([
                    axios.get(`${API_URL}/api/products`),
                    axios.get(`${API_URL}/api/featured-showcase`)
                ]);

                setProducts(productsRes.data);
                setFeaturedShowcase(showcaseRes.data || []);
                setSelectedProducts(showcaseRes.data.map(p => p._id || p.id) || []);
            });
        } catch (err) {
            handleError(err, 'Failed to load showcase data');
        } finally {
            setIsFetching(false);
        }
    };

    const handleToggleProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            if (selectedProducts.length >= 4) {
                toast.warning('Maximum 4 products allowed in showcase');
                return;
            }
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleSaveFeaturedShowcase = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product');
            return;
        }
        if (selectedProducts.length > 4) {
            toast.error('Maximum 4 products allowed');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/featured-showcase`,
                { productIds: selectedProducts },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Featured showcase updated with ${selectedProducts.length} products!`);
            fetchData();
        } catch (error) {
            handleError(error, 'Failed to update featured showcase');
        }
    };

    return (
        <div className="glass-card form-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Featured Showcase Products</h3>
            <p style={{ marginBottom: '20px', color: '#888' }}>
                Select up to 4 products to feature in the horizontal scroll showcase on the homepage.
                Currently selected: <strong>{selectedProducts.length}/4</strong>
            </p>

            <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                <button
                    className="btn-primary"
                    onClick={handleSaveFeaturedShowcase}
                    disabled={selectedProducts.length === 0}
                    style={{ marginBottom: '10px' }}
                >
                    Save Featured Showcase ({selectedProducts.length} products)
                </button>
                {selectedProducts.length > 0 && (
                    <button
                        className="btn-secondary"
                        onClick={() => setSelectedProducts([])}
                        style={{ marginLeft: '10px' }}
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                maxHeight: '600px',
                overflowY: 'auto',
                padding: '10px'
            }}>
                {isFetching ? (
                    <CardSkeleton count={4} />
                ) : (
                    products.map(product => {
                        const productId = product._id || product.id;
                        const isSelected = selectedProducts.includes(productId);

                        return (
                            <div
                                key={productId}
                                onClick={() => handleToggleProduct(productId)}
                                style={{
                                    border: isSelected ? '3px solid #C5A059' : '2px solid #ddd',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: isSelected ? '#fff9f0' : 'white',
                                    position: 'relative',
                                    boxShadow: isSelected ? '0 4px 12px rgba(197, 160, 89, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#C5A059',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        {selectedProducts.indexOf(productId) + 1}
                                    </div>
                                )}
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'contain',
                                        marginBottom: '10px',
                                        borderRadius: '8px'
                                    }}
                                />
                                <h4 style={{
                                    fontSize: '0.95rem',
                                    marginBottom: '5px',
                                    color: isSelected ? '#C5A059' : '#333'
                                }}>
                                    {product.name}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                                    {product.brand || 'Premium Brand'}
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#C5A059', fontWeight: 'bold' }}>
                                    GH₵{product.price}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FeaturedShowcaseTab;
