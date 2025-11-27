import React from 'react';
import { useCompare } from '../../context/CompareContext';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CompareTray = () => {
    const { compareList, removeFromCompare, clearCompare, isOpen, toggleTray } = useCompare();
    const navigate = useNavigate();

    if (compareList.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>
            {isOpen && (
                <div className="glass-card" style={{
                    padding: '20px',
                    marginBottom: '10px',
                    width: '300px',
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '1px solid #C5A059'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#C5A059' }}>Compare ({compareList.length}/3)</h4>
                        <button onClick={clearCompare} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>Clear All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                        {compareList.map(product => (
                            <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                                <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#C5A059' }}>GH₵{product.price}</div>
                                </div>
                                <button onClick={() => removeFromCompare(product._id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><FaTimes /></button>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                        onClick={() => navigate('/compare')}
                        disabled={compareList.length < 2}
                    >
                        Compare Now <FaArrowRight />
                    </button>
                    {compareList.length < 2 && <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Select at least 2 items</div>}
                </div>
            )}

            <button
                onClick={toggleTray}
                style={{
                    background: '#C5A059',
                    color: 'black',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                Compare ({compareList.length}) {isOpen ? '▼' : '▲'}
            </button>
        </div>
    );
};

export default CompareTray;
