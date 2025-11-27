import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const ComparePage = () => {
    const { compareList, removeFromCompare } = useCompare();

    if (compareList.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2>No items to compare</h2>
                <Link to="/shop" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Go to Shop</Link>
            </div>
        );
    }

    const attributes = [
        { label: 'Price', key: 'price', format: (val) => `GH₵${val}` },
        { label: 'Category', key: 'category' },
        { label: 'Concentration', key: 'concentration' },
        { label: 'Gender', key: 'gender' },
        { label: 'Season', key: 'season' },
        { label: 'Top Notes', key: 'notes', format: (val) => val ? val.split(', ')[0] : '-' },
        { label: 'Heart Notes', key: 'notes', format: (val) => val ? val.split(', ')[1] : '-' },
        { label: 'Base Notes', key: 'notes', format: (val) => val ? val.split(', ')[2] : '-' },
        { label: 'Sillage', key: 'sillage', format: (val) => val || 'Moderate' },
        { label: 'Longevity', key: 'longevity', format: (val) => val || '8+ Hours' },
    ];

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <h1 className="section-title text-center" style={{ marginBottom: '40px' }}>Scent Comparison</h1>

            <div className="glass-card" style={{ overflowX: 'auto', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', width: '20%' }}>Feature</th>
                            {compareList.map(product => (
                                <th key={product._id} style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #333', width: `${80 / compareList.length}%` }}>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => removeFromCompare(product._id)}
                                            style={{ position: 'absolute', top: '-10px', right: '0', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                        >
                                            <FaTimes />
                                        </button>
                                        <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px' }} />
                                        <div style={{ fontSize: '1.1rem', color: '#C5A059' }}>{product.name}</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attributes.map((attr, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#888', borderBottom: '1px solid #333' }}>{attr.label}</td>
                                {compareList.map(product => (
                                    <td key={product._id} style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #333' }}>
                                        {attr.format ? attr.format(product[attr.key]) : (product[attr.key] || '-')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr>
                            <td style={{ padding: '15px', borderBottom: 'none' }}></td>
                            {compareList.map(product => (
                                <td key={product._id} style={{ padding: '15px', textAlign: 'center', borderBottom: 'none' }}>
                                    <Link to={`/product/${product._id}`} className="btn-secondary" style={{ fontSize: '0.9rem', padding: '8px 15px' }}>View Details</Link>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;
