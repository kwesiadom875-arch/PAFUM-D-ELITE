import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useCompare } from '../../context/CompareContext';

const CompareButton = ({ product }) => {
    const { addToCompare, removeFromCompare, compareList } = useCompare();
    const isSelected = compareList.some(p => p._id === product._id);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected) {
            removeFromCompare(product._id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="compare-btn"
            title={isSelected ? "Remove from Compare" : "Add to Compare"}
            style={{
                background: isSelected ? '#C5A059' : 'rgba(255,255,255,0.1)',
                border: '1px solid #C5A059',
                color: isSelected ? '#fff' : '#C5A059',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 10
            }}
        >
            <FaExchangeAlt size={14} />
        </button>
    );
};

export default CompareButton;
