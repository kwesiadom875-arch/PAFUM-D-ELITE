import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const useProductActions = (product, addToCart, finalPrice, setFinalPrice) => {
    const [selectedSize, setSelectedSize] = useState(null);

    const handleSizeSelect = (sizeOption) => {
        setSelectedSize(sizeOption.size);
        setFinalPrice(sizeOption.price);
    };

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert('⚠️ Please select a size before adding to cart');
            return;
        }

        const sizeVariant = product.sizes?.find(s => s.size === selectedSize);
        const itemToAdd = {
            ...product,
            selectedSize: selectedSize || null,
            price: sizeVariant ? sizeVariant.price : finalPrice,
            quantity: 1
        };

        addToCart(itemToAdd, finalPrice);
    };

    const handleAddToWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to add to wishlist');
                return;
            }
            await axios.post(`${API_URL}/api/user/wishlist/add/${product._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Added to wishlist!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Product already in wishlist');
            } else {
                console.error('Error adding to wishlist:', error);
                alert('Could not add to wishlist');
            }
        }
    };

    const hasStock = product.sizes && product.sizes.length > 0
        ? product.sizes.some(s => s.stockQuantity > 0)
        : product.stockQuantity > 0;

    const getTotalStock = () => {
        if (product.sizes && product.sizes.length > 0) {
            return product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0);
        }
        return product.stockQuantity || 0;
    };

    return {
        selectedSize,
        handleSizeSelect,
        handleAddToCart,
        handleAddToWishlist,
        hasStock,
        getTotalStock
    };
};

export default useProductActions;
