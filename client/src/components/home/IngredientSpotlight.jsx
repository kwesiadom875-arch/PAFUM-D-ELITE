import React, { useState } from 'react';
import './IngredientSpotlight.css';

const ingredients = [
    {
        id: 1,
        name: 'Oud',
        origin: 'Southeast Asia',
        description: 'Known as "liquid gold," Oud is a resinous heartwood that brings a deep, woody, and smoky complexity to our most intense fragrances.',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop' // Placeholder: Needs actual Oud image
    },
    {
        id: 2,
        name: 'Rose de Mai',
        origin: 'Grasse, France',
        description: 'Harvested only in May, this rare rose offers a honeyed, floral sweetness that forms the heart of our romantic collections.',
        image: 'https://images.unsplash.com/photo-1496857239036-1fb137683000?q=80&w=2670&auto=format&fit=crop' // Placeholder: Rose image
    },
    {
        id: 3,
        name: 'Ambergris',
        origin: 'Oceanic',
        description: 'A marine treasure that adds a warm, salty, and animalic skin-scent quality, ensuring longevity and allure.',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop' // Placeholder: Amber image
    }
];

const IngredientSpotlight = () => {
    const [activeId, setActiveId] = useState(null);

    return (
        <section className="ingredient-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Rare Ingredients</h2>
                    <p className="section-subtitle">Sourced from the most exclusive corners of the world.</p>
                </div>

                <div className="ingredients-grid">
                    {ingredients.map((ing) => (
                        <div
                            key={ing.id}
                            className={`ingredient-card ${activeId === ing.id ? 'active' : ''}`}
                            onMouseEnter={() => setActiveId(ing.id)}
                            onMouseLeave={() => setActiveId(null)}
                        >
                            <div className="ingredient-image" style={{ backgroundImage: `url(${ing.image})` }}>
                                <div className="ingredient-overlay"></div>
                            </div>
                            <div className="ingredient-content">
                                <h3 className="ingredient-name">{ing.name}</h3>
                                <p className="ingredient-origin">{ing.origin}</p>
                                <div className="ingredient-details">
                                    <p>{ing.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default IngredientSpotlight;
