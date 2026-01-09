import gsap from 'gsap';

/**
 * Magnetic button effect - button follows cursor on hover
 * @param {React.RefObject} buttonRef - Reference to button element
 * @param {number} strength - Magnetic strength (0-1), default 0.3
 */
export const magneticButton = (buttonRef, strength = 0.3) => {
  if (!buttonRef.current) return;

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    
    gsap.to(buttonRef.current, {
      x,
      y,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  buttonRef.current.addEventListener('mousemove', handleMouseMove);
  buttonRef.current.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    if (buttonRef.current) {
      buttonRef.current.removeEventListener('mousemove', handleMouseMove);
      buttonRef.current.removeEventListener('mouseleave', handleMouseLeave);
    }
  };
};

/**
 * Parallax image effect on scroll
 * @param {React.RefObject} imageRef - Reference to image element
 * @param {number} speed - Parallax speed (pixels), default -100
 */
export const parallaxImage = (imageRef, speed = -100) => {
  if (!imageRef.current) return;

  const tl = gsap.to(imageRef.current, {
    y: speed,
    ease: 'none',
    scrollTrigger: {
      trigger: imageRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  return () => tl.kill();
};

/**
 * Stagger fade-in animation for multiple elements
 * @param {string} selector - CSS selector for elements
 * @param {object} options - Animation options
 */
export const staggerFadeIn = (selector, options = {}) => {
  const {
    delay = 0.1,
    duration = 0.8,
    y = 50,
    stagger = 0.15,
    trigger = null,
    start = 'top 80%'
  } = options;

  const tl = gsap.from(selector, {
    y,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    scrollTrigger: trigger ? {
      trigger,
      start,
      toggleActions: 'play none none none'
    } : undefined
  });

  return () => tl.kill();
};

/**
 * Horizontal scroll animation
 * @param {React.RefObject} containerRef - Container element
 * @param {React.RefObject} scrollerRef - Element to scroll horizontally
 * @param {object} options - Scroll options
 */
export const horizontalScroll = (containerRef, scrollerRef, options = {}) => {
  if (!containerRef.current || !scrollerRef.current) return;

  const {
    pin = true,
    scrub = 1,
    end = null
  } = options;

  const scrollWidth = scrollerRef.current.scrollWidth;
  const viewportWidth = window.innerWidth;

  const tl = gsap.to(scrollerRef.current, {
    x: () => -(scrollWidth - viewportWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: containerRef.current,
      pin,
      scrub,
      end: end || `+=${scrollWidth}`,
      invalidateOnRefresh: true
    }
  });

  return () => tl.kill();
};

/**
 * 3D card flip animation
 * @param {React.RefObject} cardRef - Card element reference
 * @param {boolean} isFlipped - Flip state
 */
export const flipCard = (cardRef, isFlipped) => {
  if (!cardRef.current) return;

  gsap.to(cardRef.current, {
    rotationY: isFlipped ? 180 : 0,
    duration: 0.6,
    ease: 'power2.inOut'
  });
};

/**
 * Infinite loop carousel animation
 * @param {React.RefObject} carouselRef - Carousel element
 * @param {object} options - Animation options
 */
export const infiniteLoop = (carouselRef, options = {}) => {
  if (!carouselRef.current) return;

  const {
    duration = 20,
    direction = 'left',
    paused = false
  } = options;

  const xValue = direction === 'left' ? '-=100%' : '+=100%';

  const tl = gsap.to(carouselRef.current, {
    x: xValue,
    duration,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.wrap(direction === 'left' ? -100 : 0, direction === 'left' ? 0 : 100, '%')
    },
    paused
  });

  return tl;
};

/**
 * Scale animation on hover
 * @param {React.RefObject} elementRef - Element reference
 * @param {number} scale - Scale value, default 1.05
 */
export const hoverScale = (elementRef, scale = 1.05) => {
  if (!elementRef.current) return;

  const handleMouseEnter = () => {
    gsap.to(elementRef.current, {
      scale,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(elementRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  elementRef.current.addEventListener('mouseenter', handleMouseEnter);
  elementRef.current.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('mouseenter', handleMouseEnter);
      elementRef.current.removeEventListener('mouseleave', handleMouseLeave);
    }
  };
};

/**
 * Text reveal animation (character by character)
 * @param {React.RefObject} textRef - Text element reference
 * @param {object} options - Animation options
 */
export const textReveal = (textRef, options = {}) => {
  if (!textRef.current) return;

  const {
    duration = 0.05,
    stagger = 0.03,
    delay = 0
  } = options;

  const text = textRef.current.textContent;
  textRef.current.innerHTML = text
    .split('')
    .map(char => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`)
    .join('');

  const tl = gsap.to(textRef.current.children, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    delay,
    ease: 'power2.out'
  });

  return () => tl.kill();
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Batch kill animations
 * @param {Array} animations - Array of GSAP timelines/tweens
 */
export const killAnimations = (animations) => {
  animations.forEach(anim => {
    if (anim && typeof anim.kill === 'function') {
      anim.kill();
    }
  });
};
