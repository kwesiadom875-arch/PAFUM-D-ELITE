import React from 'react';

const TransparentImg = ({ src, alt, className, style, ...props }) => {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            {...props}
        />
    );
};

export default TransparentImg;
