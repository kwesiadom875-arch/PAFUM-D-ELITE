import './ProductSkeleton.css';

const ProductSkeleton = () => {
    return (
        <div className="skeleton-container">
            {/* Left Column: Image Placeholder */}
            <div className="sk-image shimmer"></div>

            {/* Right Column: Text Placeholders */}
            <div className="sk-content">
                <div className="sk-title shimmer"></div>
                <div className="sk-price shimmer"></div>

                <div className="sk-description">
                    <div className="sk-desc-line shimmer"></div>
                    <div className="sk-desc-line shimmer"></div>
                    <div className="sk-desc-line short shimmer"></div>
                </div>

                <div className="sk-actions">
                    <div className="sk-btn shimmer"></div>
                    <div className="sk-btn shimmer"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
