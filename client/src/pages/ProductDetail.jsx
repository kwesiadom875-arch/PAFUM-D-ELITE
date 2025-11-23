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
import RelatedProducts from '../components/product/RelatedProducts';
import ProductSkeleton from '../components/ProductSkeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [finalPrice, setFinalPrice] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${id}`).then(res => {
      setProduct(res.data);
      setFinalPrice(res.data.price);
    });
    axios.get(`${API_URL}/api/products`).then(res => {
      const others = res.data.filter(p => p.id !== parseInt(id) && p._id !== id);
      setRelated(others.slice(0, 4));
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
        product={product}
        finalPrice={finalPrice}
        addToCart={addToCart}
        setFinalPrice={setFinalPrice}
      />

      {/* BENTO GRID */}
      <ProductBento
        top={top}
        heart={heart}
        base={base}
      />

      {/* ACCORDS SECTION */}
      <ProductAccords
        notesArray={notesArray}
      />

      {/* RELATED */}
      <RelatedProducts
        related={related}
      />

    </div>
  );
};

export default ProductDetail;