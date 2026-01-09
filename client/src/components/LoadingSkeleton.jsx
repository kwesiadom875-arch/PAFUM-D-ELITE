import React from 'react';
import './LoadingSkeleton.css';

// Generic loading skeleton for cards
export const CardSkeleton = ({ count = 1 }) => {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text skeleton-title"></div>
                    <div className="skeleton-text skeleton-subtitle"></div>
                    <div className="skeleton-text skeleton-price"></div>
                </div>
            ))}
        </>
    );
};

// Table row skeleton
export const TableRowSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                    {[...Array(columns)].map((_, j) => (
                        <td key={j}>
                            <div className="skeleton-text"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

// Form skeleton
export const FormSkeleton = () => {
    return (
        <div className="skeleton-form">
            <div className="skeleton-text skeleton-input"></div>
            <div className="skeleton-text skeleton-input"></div>
            <div className="skeleton-text skeleton-textarea"></div>
            <div className="skeleton-button"></div>
        </div>
    );
};

// Profile card skeleton
export const ProfileCardSkeleton = () => {
    return (
        <div className="skeleton-profile-card">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text skeleton-name"></div>
            <div className="skeleton-text skeleton-email"></div>
        </div>
    );
};

export default CardSkeleton;
