import React from 'react';
import { Link } from 'react-router-dom';

import TransparentImg from '../TransparentImg';

const RelatedProducts = ({ related }) => {
    return (
        <div className="related-section container">
            <h3>You May Also Like</h3>
            <div className="related-grid">
                {related.map(item => (
                    <Link to={`/product/${item.id || item._id}`} key={item.id || item._id} className="related-card">
                        <div className="related-img"><TransparentImg src={item.image} alt={item.name} /></div>
                        <h4>{item.name}</h4>
                        <span>GH₵{item.price}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
