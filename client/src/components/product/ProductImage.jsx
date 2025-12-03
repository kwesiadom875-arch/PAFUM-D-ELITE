import React, { useState, useEffect } from 'react';
import TransparentImg from '../TransparentImg';
import API_URL from '../../config';

/**
 * Robust Product Image Component
 * Handles:
 * 1. Loading states
 * 2. Error fallbacks (local image)
 * 3. Blocked domains (fimgs.net)
 * 4. Zoom/Lightbox interactions (future proofing)
 */
const ProductImage = ({ src, alt, className, style }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fallback image path - downloaded locally
    const FALLBACK_IMAGE = '/images/goku_pisello.jpg';

    useEffect(() => {
        // Reset state when prop changes
        setHasError(false);
        setIsLoading(true);

        if (!src) {
            setImgSrc(FALLBACK_IMAGE);
            setIsLoading(false);
        } else if (src.includes('fimgs.net') || src.includes('fragrantica.com')) {
            // Use proxy for Fragrantica images to avoid 403 Forbidden
            const proxyUrl = `${API_URL}/proxy-image?url=${encodeURIComponent(src)}`;
            setImgSrc(proxyUrl);
        } else {
            setImgSrc(src);
        }
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            console.warn(`Image failed to load: ${src}. Switching to fallback.`);
            setHasError(true);
            setImgSrc(FALLBACK_IMAGE);
            setIsLoading(false);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className={`product-image-wrapper ${className || ''}`} style={{ position: 'relative', ...style }}>
            {/* Loading Skeleton/Spinner */}
            {isLoading && (
                <div className="image-skeleton" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-loading 1.5s infinite',
                    borderRadius: 'inherit',
                    zIndex: 1
                }}></div>
            )}

            <TransparentImg
                src={imgSrc}
                alt={alt}
                className={className}
                style={{
                    ...style,
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                }}
                onError={handleError}
                onLoad={handleLoad}
            />


        </div>
    );
};

export default ProductImage;
