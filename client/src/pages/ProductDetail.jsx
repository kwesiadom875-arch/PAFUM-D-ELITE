import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import './ProductDetail.css';

// Import Extracted Components
import ProductHero from '../components/product/ProductHero';
import ProductBento from '../components/product/ProductBento';
import ProductAccords from '../components/product/ProductAccords';
import RecommendedProducts from '../components/RecommendedProducts';
import ProductSkeleton from '../components/ProductSkeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [negotiatorKey, setNegotiatorKey] = useState(0); // Force negotiator to reset

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset negotiator by changing key
    setNegotiatorKey(prev => prev + 1);

    axios.get(`${API_URL}/api/products/${id}`).then(res => {
      setProduct(res.data);
      setFinalPrice(res.data.price);
    });
  }, [id]);

  if (!product) return <ProductSkeleton />;

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
      />

      {/* BENTO GRID */}
      <ProductBento
        product={product}
        top={top}
        heart={heart}
        base={base}
      />

      {/* ACCORDS SECTION */}
      <ProductAccords
        product={product}
        notesArray={notesArray}
      />

      {/* RECOMMENDED */}
      <RecommendedProducts
        productId={id}
      />

    </div>
  );
};

export default ProductDetail;