import React, { useEffect, useRef, useState } from 'react';

const TransparentImg = ({ src, alt, className, style, ...props }) => {
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            try {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const width = canvas.width;
                const height = canvas.height;

                // Helper to check if a pixel is "white"
                const isWhite = (index) => {
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    return r > 230 && g > 230 && b > 230;
                };

                // Flood Fill Algorithm (BFS)
                const queue = [];
                const visited = new Set();

                // Add corners to queue
                const corners = [
                    [0, 0],
                    [width - 1, 0],
                    [0, height - 1],
                    [width - 1, height - 1]
                ];

                corners.forEach(([x, y]) => {
                    const index = (y * width + x) * 4;
                    if (isWhite(index)) {
                        queue.push([x, y]);
                        visited.add(index);
                    }
                });

                while (queue.length > 0) {
                    const [x, y] = queue.shift();
                    const index = (y * width + x) * 4;

                    // Make transparent
                    data[index + 3] = 0;

                    // Check neighbors
                    const neighbors = [
                        [x + 1, y],
                        [x - 1, y],
                        [x, y + 1],
                        [x, y - 1]
                    ];

                    for (const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nIndex = (ny * width + nx) * 4;
                            if (!visited.has(nIndex) && isWhite(nIndex)) {
                                visited.add(nIndex);
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                setIsLoaded(true);
            } catch (e) {
                console.warn("TransparentImg: CORS or Canvas error. Falling back to CSS blend mode.", e);
                setHasError(true);
            }
        };

        img.onerror = () => {
            console.error("TransparentImg: Image failed to load.", src);
            setHasError(true);
        };

    }, [src]);

    if (hasError) {
        // Fallback: Use mix-blend-mode: multiply which works well for white backgrounds on dark themes
        // Note: This might darken internal white parts, but it's better than a white box.
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={{
                    ...style,
                    mixBlendMode: 'multiply',
                    filter: 'contrast(1.1)' // Slight contrast boost to help pop against dark bg
                }}
                {...props}
            />
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                ...style,
                display: isLoaded ? 'block' : 'none'
            }}
            aria-label={alt}
            role="img"
            {...props}
        />
    );
};

export default TransparentImg;
