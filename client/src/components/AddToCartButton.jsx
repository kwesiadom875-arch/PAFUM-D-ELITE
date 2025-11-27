import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { FaCheck } from 'react-icons/fa';

const AddToCartButton = ({ onClick, price, disabled, className }) => {
    const [isAdded, setIsAdded] = useState(false);
    const buttonRef = useRef(null);
    const textRef = useRef(null);
    const rippleRef = useRef(null);

    const handleClick = (e) => {
        if (disabled || isAdded) return;

        const button = buttonRef.current;
        const text = textRef.current;

        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'cart-ripple';
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        button.appendChild(ripple);

        // GSAP animations
        const tl = gsap.timeline();

        // Button bounce
        tl.to(button, {
            scale: 0.95,
            duration: 0.1,
            ease: 'power2.in'
        })
            .to(button, {
                scale: 1.05,
                duration: 0.2,
                ease: 'back.out(1.7)'
            })
            .to(button, {
                scale: 1,
                duration: 0.15
            });

        // Ripple animation
        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
        });

        // Text change animation
        gsap.to(text, {
            y: -20,
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                setIsAdded(true);
                gsap.fromTo(text,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
                );
            }
        });

        // Call the parent onClick handler
        if (onClick) onClick(e);

        // Reset after 2 seconds
        setTimeout(() => {
            gsap.to(text, {
                y: -20,
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    setIsAdded(false);
                    gsap.fromTo(text,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.3 }
                    );
                }
            });
        }, 2000);
    };

    return (
        <button
            ref={buttonRef}
            className={className}
            onClick={handleClick}
            disabled={disabled}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: isAdded ? '#4CAF50' : undefined,
                borderColor: isAdded ? '#4CAF50' : undefined,
                color: isAdded ? 'white' : undefined,
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}
        >
            <div
                ref={textRef}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                {isAdded ? (
                    <>
                        <FaCheck /> Added!
                    </>
                ) : (
                    disabled ? 'Out of Stock' : `Add to Cart — GH₵${price}`
                )}
            </div>
        </button>
    );
};

AddToCartButton.propTypes = {
    onClick: PropTypes.func,
    price: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string
};

AddToCartButton.defaultProps = {
    onClick: () => { },
    disabled: false,
    className: ''
};

export default AddToCartButton;
