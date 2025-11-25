import React from 'react';

// --- COLOR MAPPING LOGIC ---
const getAccordColor = (note) => {
    const n = note.toLowerCase().trim();

    // CITRUS (Mustard Yellow)
    if (n.includes('citrus') || n.includes('lemon') || n.includes('bergamot')) return '#EBD342';

    // WHITE FLORAL (White/Off-White)
    if (n.includes('white floral') || n.includes('tuberose') || n.includes('jasmine')) return '#FFFEF0';

    // FLORAL (Soft Pink)
    if (n.includes('floral') || n.includes('rose')) return '#F2CCDB';

    // WOODY (Medium Brown)
    if (n.includes('woody') || n.includes('cedar')) return '#966338';

    // OUD / DARK WOODS (Dark Brown)
    if (n.includes('oud') || n.includes('agarwood')) return '#4A3121';

    // AROMATIC (Teal/Sage)
    if (n.includes('aromatic') || n.includes('lavender') || n.includes('sage')) return '#679186';

    // FRESH SPICY (Light Green)
    if (n.includes('fresh spicy') || n.includes('ginger')) return '#A7CF61';

    // WARM SPICY (Brick Red)
    if (n.includes('warm spicy') || n.includes('cinnamon') || n.includes('cardamom')) return '#913228';

    // VANILLA (Cream)
    if (n.includes('vanilla')) return '#F3DFAC';

    // AMBER (Orange)
    if (n.includes('amber')) return '#D68A29';

    // POWDERY (Pale Beige)
    if (n.includes('powdery') || n.includes('iris')) return '#E8DCD1';

    // MUSKY (Light Grey)
    if (n.includes('musky') || n.includes('musk')) return '#D6D6D6';

    // SWEET (Candy Pink)
    if (n.includes('sweet') || n.includes('fruity')) return '#E86B87';

    // LEATHER / ANIMALIC (Very Dark Brown)
    if (n.includes('leather') || n.includes('animalic')) return '#2E1D16';

    // EARTHY (Dirt Brown)
    if (n.includes('earthy') || n.includes('patchouli')) return '#6E553E';

    // GREEN (Grass Green)
    if (n.includes('green') || n.includes('herbal')) return '#59964F';

    // MARINE (Sky Blue)
    if (n.includes('marine') || n.includes('aquatic')) return '#7CB9D1';

    // BALSAMIC (Dark Purple/Red)
    if (n.includes('balsamic') || n.includes('resinous')) return '#632A38';

    return '#C5A059'; // Default Gold
};

const getTextColor = (hex) => {
    const darkBackgrounds = ['#2E1D16', '#4A3121', '#913228', '#632A38', '#556B2F', '#050505'];
    return darkBackgrounds.includes(hex) ? '#FFFFFF' : '#222222';
};

const ProductAccords = ({ product, notesArray }) => {
    return (
        <div className="accords-section container">
            {/* LEFT: FRAGRANTICA CHART */}
            <div className="bento-card wide-card accords-chart-box">
                <h3>Main Accords</h3>

                <div className="accords-stack">
                    {notesArray.map((note, index) => {
                        const bg = getAccordColor(note);
                        const txt = getTextColor(bg);
                        // Fragrantica width logic: Decrements slowly
                        const widthPercent = Math.max(100 - (index * 10), 45);

                        return (
                            <div
                                key={index}
                                className="accord-bar"
                                style={{
                                    backgroundColor: bg,
                                    width: `${widthPercent}%`,
                                    color: txt
                                }}
                            >
                                {note}
                            </div>
                        );
                    })}
                </div>

                <div className="chart-source">
                    Data sourced from <a href="https://www.fragrantica.com" target="_blank" rel="noreferrer">Fragrantica.com</a>
                </div>
            </div>

            {/* RIGHT: PERFUMER INFO */}
            <div className="bento-card wide-card">
                <h3>Perfumer(s)</h3>
                <p className="perfumer-name">{product.perfumer || "Master Perfumer"}</p>
                <div className="perfumer-signature">The Nose Behind The Scent</div>
            </div>
        </div>
    );
};

export default ProductAccords;
