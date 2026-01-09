import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom hook for GSAP animations
 * @param {Function} animationCallback - Function containing GSAP animation code
 * @param {Array} dependencies - Dependencies array for useEffect
 */
export const useGSAPAnimation = (animationCallback, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      const ctx = gsap.context(() => {
        animationCallback(elementRef.current);
      }, elementRef);

      return () => ctx.revert(); // Cleanup
    }
  }, dependencies);

  return elementRef;
};

/**
 * Stagger animation for multiple elements
 */
export const staggerFadeIn = (elements, options = {}) => {
  const defaults = {
    opacity: 0,
    y: 50,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    ...options
  };

  return gsap.from(elements, defaults);
};

/**
 * Scale bounce animation (for buttons, cart items)
 */
export const scaleBounce = (element, options = {}) => {
  const defaults = {
    scale: 1.1,
    duration: 0.3,
    ease: 'back.out(1.7)',
    ...options
  };

  return gsap.to(element, defaults);
};

/**
 * Slide in animation
 */
export const slideIn = (element, direction = 'left', options = {}) => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    top: { y: -100 },
    bottom: { y: 100 }
  };

  const defaults = {
    ...directions[direction],
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    ...options
  };

  return gsap.from(element, defaults);
};

/**
 * Counter animation (for numbers)
 */
export const animateCounter = (element, endValue, options = {}) => {
  const defaults = {
    duration: 1.5,
    ease: 'power1.out',
    ...options
  };

  const obj = { value: 0 };
  
  return gsap.to(obj, {
    value: endValue,
    ...defaults,
    onUpdate: () => {
      if (element) {
        element.textContent = Math.round(obj.value);
      }
    }
  });
};

/**
 * Flip card animation (for auth forms)
 */
export const flipCard = (element, options = {}) => {
  const defaults = {
    rotationY: 180,
    duration: 0.6,
    ease: 'power2.inOut',
    transformStyle: 'preserve-3d',
    ...options
  };

  return gsap.to(element, defaults);
};

export default useGSAPAnimation;
