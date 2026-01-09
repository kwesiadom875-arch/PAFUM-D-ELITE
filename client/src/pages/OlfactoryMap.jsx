import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import gsap from 'gsap';
import './OlfactoryMap.css';
import { FaLeaf, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OlfactoryMap = () => {
    const [mapData, setMapData] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products/olfactory-map`);
                setMapData(res.data);
            } catch (err) {
                console.error("Failed to fetch map data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMap();
    }, []);

    // Generate positions once when mapData loads
    const bubbles = React.useMemo(() => {
        if (!mapData.length) return [];

        // Better distribution: Divide space into a grid
        // Drastic Scale Up: 3 cols for massive bubbles
        const cols = 3;
        const rows = Math.ceil(mapData.length / cols);

        return mapData.map((note, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            // Base positioning on grid with significant jitter
            const left = (col * (100 / cols)) + (Math.random() * 8 + 4);
            const top = (row * (80 / rows)) + (Math.random() * 5 + 10);

            // MASSIVE scaling: Base 220px + count factor
            const size = Math.max(220, 220 + note.count * 30);

            // Dynamic font sizing based on length
            const nameLength = note.name.length;
            const fontSize = nameLength > 20 ? '1.1rem' : (nameLength > 12 ? '1.3rem' : '1.6rem');

            return {
                ...note,
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    top: `${top}%`,
                    fontSize: fontSize
                }
            };
        });
    }, [mapData]);

    useEffect(() => {
        if (!loading && bubbles.length > 0) {
            const bubbleElements = document.querySelectorAll('.note-bubble');
            bubbleElements.forEach(bubble => {
                // Random drift animation
                gsap.to(bubble, {
                    x: "random(-15, 15)",
                    y: "random(-15, 15)",
                    duration: "random(3, 6)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        }
    }, [loading, bubbles]);

    if (loading) return <div className="map-loading">Sensing the atmosphere...</div>;

    return (
        <div className="olfactory-map-page" ref={containerRef}>
            <div className="map-header">
                <h1 className="section-title">Olfactory Exploration</h1>
                <p className="gold-text">Explore our collection through the lens of scent notes</p>
            </div>

            <div className="bubbles-container">
                {bubbles.map((note) => (
                    <div
                        key={note.name}
                        className="note-bubble"
                        style={note.style}
                        onClick={() => setSelectedNote(note)}
                    >
                        <span className="note-name">{note.name}</span>
                        <span className="note-count">{note.count} products</span>
                    </div>
                ))}
            </div>

            {selectedNote && (
                <div className="details-panel-overlay" onClick={() => setSelectedNote(null)}>
                    <div className="details-panel" onClick={e => e.stopPropagation()}>
                        <div className="panel-header">
                            <h3>Note: {selectedNote.name}</h3>
                            <button className="close-panel" onClick={() => setSelectedNote(null)}><FaTimes /></button>
                        </div>
                        <p className="panel-desc">Perfumes enriched with {selectedNote.name} essence:</p>
                        <div className="panel-products">
                            {selectedNote.products.map(product => (
                                <div
                                    key={product.id}
                                    className="panel-product-card"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <img src={product.image} alt={product.name} />
                                    <div className="panel-prod-info">
                                        <h4>{product.name}</h4>
                                        <p>{product.brand}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OlfactoryMap;
