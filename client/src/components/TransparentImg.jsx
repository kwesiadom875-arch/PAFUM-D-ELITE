import React, { useEffect, useState, useRef } from 'react';

const TransparentImg = ({ src, alt, className, style, ...props }) => {
    const [processedSrc, setProcessedSrc] = useState(null);
    const canvasRef = useRef(null);

    const isExternal = src && src.startsWith('http');

    useEffect(() => {
        // If it's a local file, we don't need to process it
        if (!isExternal) {
            setProcessedSrc(src);
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous"; // Crucial for canvas manipulation

        // Route through our local proxy to avoid CORS
        img.src = `http://localhost:5001/proxy-image?url=${encodeURIComponent(src)}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Loop through pixels (R, G, B, A)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Threshold for "White" (Adjustable)
                // If pixel is very light (near white), make it transparent
                if (r > 230 && g > 230 && b > 230) {
                    data[i + 3] = 0; // Set Alpha to 0 (Transparent)
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedSrc(canvas.toDataURL());
        };

        img.onerror = () => {
            console.warn("Proxy failed, falling back to original");
            setProcessedSrc(src);
        };

    }, [src, isExternal]);

    return (
        <img
            src={processedSrc || src}
            alt={alt}
            className={className}
            style={style}
            {...props}
        />
    );
};

export default TransparentImg;
