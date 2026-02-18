import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OlfactoryMap.css';

const OlfactoryMap = () => {
    const [activeFilter, setActiveFilter] = useState({
        woody: true,
        floral: true,
        oriental: true,
        fresh: true
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayNodes, setDisplayNodes] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch from the backend API
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (products.length === 0) return;

        // Filter products based on active filters
        const activeFamilies = Object.keys(activeFilter).filter(k => activeFilter[k]);

        const filtered = products.filter(p => {
            // If no filter selected, show all (or could show none)
            if (activeFamilies.length === 0) return true;

            // Check category or notes for family keywords
            const family = p.category ? p.category.toLowerCase() : '';
            const notes = p.notes ? p.notes.toLowerCase() : '';

            return activeFamilies.some(f => family.includes(f) || notes.includes(f));
        });

        // Select up to 6 products for the map nodes
        // Central node + 5 surrounding
        const selected = filtered.slice(0, 6);

        // Pad with nulls if fewer than 6
        const padded = [...selected, ...Array(6 - selected.length).fill(null)];
        setDisplayNodes(padded);

    }, [products, activeFilter]);

    if (loading) {
        return (
            <div className="scent-map-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div style={{ width: '2rem', height: '2rem', border: '2px solid #d4af37', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    const [centralNode, node2, node3, node4, node5, node6] = displayNodes;

    return (
        <div className="scent-map-container">
            <header className="scent-map-header">
                <div className="header-left">
                    <div className="brand-wrapper">
                        <div className="brand-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>diamond</span>
                        </div>
                        <h2 className="brand-name">Parfum D'Elite</h2>
                    </div>
                    <nav className="nav-links">
                        <Link to="/shop" className="nav-link">Shop</Link>
                        <Link to="/olfactory-map" className="nav-link active">Discovery</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/journal" className="nav-link">Journal</Link>
                    </nav>
                </div>
                <div className="header-right">
                    <div className="search-bar">
                        <span className="material-symbols-outlined" style={{ color: '#8a8579' }}>search</span>
                        <input className="search-input" placeholder="Search fragrances..." />
                    </div>
                    <div className="icon-actions">
                        <Link to="/cart" className="icon-btn">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span className="badge">2</span>
                        </Link>
                        <Link to="/profile" className="icon-btn">
                            <span className="material-symbols-outlined">account_circle</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="content-wrapper">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h1 className="sidebar-title">Scent Map</h1>
                        <p className="sidebar-desc">Navigate our constellation of fragrances connected by shared olfactory notes.</p>
                    </div>
                    <div className="sidebar-content">
                        <details className="filter-group" open>
                            <summary className="filter-summary">
                                <span className="filter-title">Olfactory Family</span>
                                <span className="material-symbols-outlined">expand_more</span>
                            </summary>
                            <div className="filter-details">
                                <label className="checkbox-label">
                                    <input type="checkbox" className="custom-checkbox" checked={activeFilter.woody} onChange={() => setActiveFilter({ ...activeFilter, woody: !activeFilter.woody })} />
                                    <span>Woody</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" className="custom-checkbox" checked={activeFilter.floral} onChange={() => setActiveFilter({ ...activeFilter, floral: !activeFilter.floral })} />
                                    <span>Floral</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" className="custom-checkbox" checked={activeFilter.oriental} onChange={() => setActiveFilter({ ...activeFilter, oriental: !activeFilter.oriental })} />
                                    <span>Oriental</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" className="custom-checkbox" checked={activeFilter.fresh} onChange={() => setActiveFilter({ ...activeFilter, fresh: !activeFilter.fresh })} />
                                    <span>Fresh</span>
                                </label>
                            </div>
                        </details>

                        <div style={{ height: '1px', backgroundColor: '#e5e0d1', margin: '0 0.75rem' }}></div>

                        <details className="filter-group" open>
                            <summary className="filter-summary">
                                <span className="filter-title">Intensity</span>
                                <span className="material-symbols-outlined">expand_more</span>
                            </summary>
                            <div className="filter-details" style={{ paddingBottom: '1.5rem' }}>
                                <div className="slider-track">
                                    <div className="slider-fill"></div>
                                    <div className="slider-thumb"></div>
                                </div>
                                <div className="slider-labels">
                                    <span>Light</span>
                                    <span>Moderate</span>
                                    <span style={{ color: '#2d2a26', fontWeight: 500 }}>Intense</span>
                                </div>
                            </div>
                        </details>

                        <div style={{ height: '1px', backgroundColor: '#e5e0d1', margin: '0 0.75rem' }}></div>

                        <details className="filter-group" open>
                            <summary className="filter-summary">
                                <span className="filter-title">Occasion</span>
                                <span className="material-symbols-outlined">expand_more</span>
                            </summary>
                            <div className="filter-details">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <button className="tag-btn">Daytime</button>
                                    <button className="tag-btn active">Evening</button>
                                    <button className="tag-btn">Date Night</button>
                                    <button className="tag-btn">Office</button>
                                </div>
                            </div>
                        </details>
                    </div>
                    <div className="sidebar-footer">
                        <button className="reset-btn" onClick={() => setActiveFilter({ woody: true, floral: true, oriental: true, fresh: true })}>
                            Reset Filters
                        </button>
                    </div>
                </aside>

                <main className="map-area">
                    <div className="grid-background"></div>
                    <div className="map-container" id="map-container">
                        <svg className="map-svg">
                            {/* Only draw lines if we have central node and secondary nodes */}
                            {centralNode && node2 && <line className="map-line" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="1.5" x1="50%" x2="30%" y1="50%" y2="35%"></line>}
                            {centralNode && node3 && <line className="map-line" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="1.5" x1="50%" x2="70%" y1="50%" y2="65%"></line>}
                            {centralNode && node4 && <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="50%" x2="65%" y1="50%" y2="30%"></line>}
                            {node2 && node5 && <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="30%" x2="20%" y1="35%" y2="60%"></line>}
                            {node3 && node6 && <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="70%" x2="80%" y1="65%" y2="40%"></line>}
                        </svg>

                        {/* Central Node */}
                        {centralNode && (
                            <div className="node-wrapper central">
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div className="scent-node"></div>
                                    <div className="node-ping"></div>
                                </div>
                                <div className="node-label">
                                    <span>{centralNode.name}</span>
                                </div>
                                <div className="node-card">
                                    <div className="card-image-container">
                                        <img alt={centralNode.name} className="card-image" src={centralNode.image || "https://via.placeholder.com/150"} />
                                        <span className="card-tag">{centralNode.category || 'Fragrance'}</span>
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{centralNode.name}</h3>
                                        <p className="card-notes">{centralNode.notes}</p>
                                        <div className="card-actions">
                                            <span className="card-price">${centralNode.price}</span>
                                            <Link to={`/product/${centralNode.id || centralNode._id}`}><button className="details-btn">Details</button></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Node 2 - Top Left */}
                        {node2 && (
                            <div className="node-wrapper n2">
                                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: 'white', border: '2px solid #d4af37', borderRadius: '50%', cursor: 'pointer', zIndex: 10, position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}></div>
                                <div className="node-label faint">
                                    <span>{node2.name}</span>
                                </div>
                                <div className="node-card">
                                    <div className="card-image-container">
                                        <img alt={node2.name} className="card-image" src={node2.image || "https://via.placeholder.com/150"} />
                                        <span className="card-tag">{node2.category || 'Fragrance'}</span>
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{node2.name}</h3>
                                        <p className="card-notes">{node2.notes}</p>
                                        <div className="card-actions">
                                            <span className="card-price">${node2.price}</span>
                                            <Link to={`/product/${node2.id || node2._id}`}><button className="details-btn">Details</button></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Node 3 - Bottom Right */}
                        {node3 && (
                            <div className="node-wrapper n3">
                                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: 'white', border: '2px solid #d4af37', borderRadius: '50%', cursor: 'pointer', zIndex: 10, position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}></div>
                                <div className="node-label faint">
                                    <span>{node3.name}</span>
                                </div>
                                <div className="node-card">
                                    <div className="card-image-container">
                                        <img alt={node3.name} className="card-image" src={node3.image || "https://via.placeholder.com/150"} />
                                        <span className="card-tag">{node3.category || 'Fragrance'}</span>
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{node3.name}</h3>
                                        <p className="card-notes">{node3.notes}</p>
                                        <div className="card-actions">
                                            <span className="card-price">${node3.price}</span>
                                            <Link to={`/product/${node3.id || node3._id}`}><button className="details-btn">Details</button></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Node 4 - Top Right */}
                        {node4 && (
                            <div className="node-wrapper n4 faint">
                                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8a8579', opacity: 0.4, borderRadius: '50%', cursor: 'pointer' }}></div>
                                <div className="node-label">
                                    <span>{node4.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Node 5 - Bottom Left */}
                        {node5 && (
                            <div className="node-wrapper n5 faint">
                                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8a8579', opacity: 0.4, borderRadius: '50%', cursor: 'pointer' }}></div>
                                <div className="node-label">
                                    <span>{node5.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Node 6 - Middle Right */}
                        {node6 && (
                            <div className="node-wrapper n6 faint">
                                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#8a8579', opacity: 0.4, borderRadius: '50%', cursor: 'pointer' }}></div>
                                <div className="node-label">
                                    <span>{node6.name}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="map-controls">
                        <button className="map-btn">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button className="map-btn">
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <button className="map-btn" style={{ marginTop: '0.5rem' }}>
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                    </div>

                    <div className="legend">
                        <div className="legend-item">
                            <div className="dot dot-primary"></div>
                            <span>Selected Match</span>
                        </div>
                        <div className="legend-item">
                            <div className="dot dot-hollow"></div>
                            <span>Direct Relation</span>
                        </div>
                        <div className="legend-item">
                            <div className="dot dot-muted"></div>
                            <span>Others</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OlfactoryMap;
