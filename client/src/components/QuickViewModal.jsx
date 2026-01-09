import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from '../context/CartContext';
import TransparentImg from './TransparentImg';
import { FaTimes, FaShoppingBag } from 'react-icons/fa';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
    const { addToCart } = useContext(CartContext);

    if (!product) return null;

    const hasStock = product.sizes && product.sizes.length > 0
        ? product.sizes.some(s => s.stockQuantity > 0)
        : product.stockQuantity > 0;

    return (
        <div className="quickview-overlay" onClick={onClose}>
            <div className="quickview-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>

                <div className="quickview-grid">
                    {/* Image Section */}
                    <div className="quickview-image">
                        <TransparentImg src={product.image} alt={product.name} />
                    </div>

                    {/* Details Section */}
                    <div className="quickview-details">
                        <span className="qv-category">{product.category}</span>
                        <h2 className="qv-title">{product.name}</h2>
                        <p className="qv-price">GH₵{product.price}</p>

                        <div className="qv-description">
                            <p>{product.description || "An exquisite fragrance from our collection."}</p>
                        </div>

                        {product.notes && (
                            <div className="qv-notes">
                                <h4>Key Notes:</h4>
                                <div className="notes-tags">
                                    {(Array.isArray(product.notes)
                                        ? product.notes
                                        : typeof product.notes === 'string'
                                            ? product.notes.split(',').map(n => n.trim())
                                            : []
                                    ).map((note, idx) => (
                                        <span key={idx} className="note-tag">{note}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="qv-actions">
                            {hasStock ? (
                                <button
                                    className="qv-add-btn"
                                    onClick={() => {
                                        addToCart(product);
                                        onClose();
                                    }}
                                >
                                    <FaShoppingBag style={{ marginRight: '8px' }} />
                                    Add to Cart
                                </button>
                            ) : (
                                <button className="qv-add-btn disabled" disabled>
                                    Out of Stock
                                </button>
                            )}

                            <a href={`/product/${product.id || product._id}`} className="qv-view-full">
                                View Full Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

QuickViewModal.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        image: PropTypes.string,
        category: PropTypes.string,
        description: PropTypes.string,
        notes: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        stockQuantity: PropTypes.number,
        sizes: PropTypes.arrayOf(PropTypes.shape({
            stockQuantity: PropTypes.number
        }))
    }),
    onClose: PropTypes.func.isRequired
};

QuickViewModal.defaultProps = {
    product: null
};

export default QuickViewModal;
