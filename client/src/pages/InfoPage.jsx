import React from 'react';
import './InfoPage.css';

const InfoPage = ({ title, children }) => {
    return (
        <div className="info-page-container container">
            <h1 className="info-page-title">{title}</h1>
            <div className="info-page-content">
                {children}
            </div>
        </div>
    );
};

export default InfoPage;
