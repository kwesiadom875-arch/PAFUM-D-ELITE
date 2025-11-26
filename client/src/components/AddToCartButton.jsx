import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';

const AddToCartButton = ({ onClick, price, disabled, className }) => {
    const [isAdded, setIsAdded] = useState(false);

    const handleClick = (e) => {
        if (disabled || isAdded) return;

        // Call the parent onClick handler
        if (onClick) onClick(e);

        // Trigger animation state
        setIsAdded(true);

        // Reset after 2 seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <motion.button
            className={className}
            onClick={handleClick}
            disabled={disabled}
            whileTap={!disabled && !isAdded ? { scale: 0.95 } : {}}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: isAdded ? '#4CAF50' : undefined, // Green when added
                borderColor: isAdded ? '#4CAF50' : undefined,
                color: isAdded ? 'white' : undefined,
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}
        >
            <AnimatePresence mode="wait">
                {isAdded ? (
                    <motion.div
                        key="added"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <FaCheck /> Added!
                    </motion.div>
                ) : (
                    <motion.div
                        key="default"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {disabled ? 'Out of Stock' : `Add to Cart — GH₵${price}`}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default AddToCartButton;
