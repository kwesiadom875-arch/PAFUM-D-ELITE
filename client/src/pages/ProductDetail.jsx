import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import './ProductDetail.css';

// Import Extracted Components
import ProductHero from '../components/product/ProductHero';
import ProductBento from '../components/product/ProductBento';
import ClimateStats from '../components/product/ClimateStats';
import ProductAccords from '../components/product/ProductAccords';
import RecommendedProducts from '../components/RecommendedProducts';
import ProductSkeleton from '../components/ProductSkeleton';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, user } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [negotiatorKey, setNegotiatorKey] = useState(0); // Force negotiator to reset
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({ count: 0, average: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset negotiator by changing key
    setNegotiatorKey(prev => prev + 1);
    setLoading(true);
    setError(null);

    axios.get(`${API_URL}/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setFinalPrice(res.data.price);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setError("Failed to load product.");
        setLoading(false);
      });

    // Fetch review aggregate
    axios.get(`${API_URL}/api/reviews/product/${id}`)
      .then(res => {
        const reviews = res.data;
        if (reviews.length > 0) {
          const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
          setReviewsData({ count: reviews.length, average: avg.toFixed(1) });
        }
      })
      .catch(err => console.error("Error fetching review aggregate:", err));
  }, [id, refreshReviews]);

  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="pdp-dark-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="text-center">
          <h2 style={{ color: '#C5A059' }}>Product Not Found</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>The scent you are looking for seems to have evaporated.</p>
          <a href="/shop" className="btn-gold" style={{ marginTop: '20px', display: 'inline-block' }}>Return to Shop</a>
        </div>
      </div>
    );
  }

  // Parse notes string into an array
  const notesArray = product.notes ? product.notes.split(', ') : ["Generic", "Scent"];
  const top = notesArray[0] || "Citrus";
  const heart = notesArray[1] || "Spice";
  const base = notesArray[2] || "Wood";

  return (
    <div className="pdp-dark-container">

      {/* HERO SECTION */}
      <ProductHero
        key={negotiatorKey}
        product={product}
        finalPrice={finalPrice}
        addToCart={addToCart}
        setFinalPrice={setFinalPrice}
        notesArray={notesArray}
        reviewsData={reviewsData}
      />

      {/* CLIMATE STATS */}
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <ClimateStats climateStats={product.climateStats} />
      </div>

      {/* BENTO GRID */}
      <ProductBento
        product={product}
        top={top}
        heart={heart}
        base={base}
        reviewsData={reviewsData}
      />

      {/* ACCORDS SECTION */}
      <ProductAccords
        product={product}
        notesArray={notesArray}
      />

      {/* REVIEWS SECTION */}
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 className="section-title text-center" style={{ marginBottom: '40px' }}>Olfactory Impressions</h2>

        <ReviewList productId={id} refreshTrigger={refreshReviews} />

        {user ? (
          <ReviewForm productId={id} onReviewSubmitted={() => setRefreshReviews(prev => prev + 1)} />
        ) : (
          <div className="glass-card text-center" style={{ padding: '30px', marginTop: '30px' }}>
            <p style={{ color: '#888', marginBottom: '15px' }}>Join the Elite to share your experience.</p>
            <a href="/login" className="btn-secondary">Log In to Review</a>
          </div>
        )}
      </div>

      {/* RECOMMENDED */}
      <RecommendedProducts
        productId={id}
      />

    </div>
  );
};

export default ProductDetail;