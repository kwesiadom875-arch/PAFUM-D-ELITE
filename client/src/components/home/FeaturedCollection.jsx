import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../../config';
import { CartContext } from '../../context/CartContext';
import ProductCard from '../shop/ProductCard';
import QuickViewModal from '../QuickViewModal';
import ErrorBoundary from '../ErrorBoundary';
import './FeaturedCollection.css';

const FeaturedCollection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addToCart, user } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products`);
                // Filter for "Luxury" or just take the first 4 for now
                // Ideally backend would have a /featured endpoint
                const featured = res.data.slice(0, 4);
                setProducts(featured);
            } catch (err) {
                console.error("Error fetching featured products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="loading-spacer"></div>;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="section-header text-center">
                    <span className="section-label">CURATED SELECTION</span>
                    <h2 className="section-title">Featured Fragrances</h2>
                    <p className="section-subtitle">Handpicked selection of our most sought-after perfumes</p>
                </div>

                <div className="featured-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product._id || product.id}
                            product={product}
                            user={user}
                            addToCart={addToCart}
                            onQuickView={setSelectedProduct}
                        />
                    ))}
                </div>

                <div className="view-all-container text-center">
                    <Link to="/shop" className="btn-link">View All Collections</Link>
                </div>
            </div>

            {selectedProduct && (
                <ErrorBoundary>
                    <QuickViewModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                </ErrorBoundary>
            )}
        </section>
    );
};

export default FeaturedCollection;
