import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { FaLock, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const VirtualVault = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVault = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/products/vault`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(res.data);

                // Animate entry
                setTimeout(() => {
                    gsap.from(".vault-card", {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "power3.out"
                    });
                }, 100);
            } catch (err) {
                console.error("Failed to fetch vault", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVault();
    }, []);

    if (loading) return <div className="vault-loading">Opening the Vault...</div>;
    if (products.length === 0) return null;

    return (
        <div className="virtual-vault-section">
            <h3 className="vault-title">The Virtual Vault</h3>
            <p className="vault-subtitle">Exclusive early-access and limited edition releases reserved for our Elite Circle.</p>

            <div className="vault-grid">
                {products.map(product => (
                    <div
                        key={product._id}
                        className={`vault-card ${!product.isUnlocked ? 'locked' : ''}`}
                        onClick={() => product.isUnlocked && navigate(`/product/${product.id}`)}
                    >
                        <div className="vault-img-wrapper">
                            <img src={product.image} alt={product.name} />
                            {!product.isUnlocked && (
                                <div className="lock-overlay">
                                    <FaLock size={30} />
                                    <span>Unlocked at {product.accessTier}</span>
                                </div>
                            )}
                            {product.isUnlocked && (
                                <div className="view-overlay">
                                    <FaExternalLinkAlt />
                                    <span>Preview Collection</span>
                                </div>
                            )}
                        </div>
                        <div className="vault-info">
                            <h4>{product.name}</h4>
                            <p>{product.brand}</p>
                            <span className="tier-tag">{product.accessTier} Exclusive</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualVault;
