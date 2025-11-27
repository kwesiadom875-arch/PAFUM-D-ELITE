import React from 'react';
import './StatusButton.css';

const StatusButton = ({ status, onClick, size = 'medium', showIcon = true }) => {
    const statusConfig = {
        pending: {
            label: 'Pending',
            icon: '⚠️',
            className: 'status-pending'
        },
        'in-progress': {
            label: 'In progress',
            icon: '🔄',
            className: 'status-in-progress'
        },
        submitted: {
            label: 'Submitted',
            icon: '✈️',
            className: 'status-submitted'
        },
        'in-review': {
            label: 'In review',
            icon: '🔍',
            className: 'status-in-review'
        },
        success: {
            label: 'Success',
            icon: '✅',
            className: 'status-success'
        },
        failed: {
            label: 'Failed',
            icon: '❌',
            className: 'status-failed'
        },
        expired: {
            label: 'Expired',
            icon: '🕐',
            className: 'status-expired'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const isClickable = onClick && typeof onClick === 'function';

    return (
        <button
            className={`status-button ${config.className} ${size} ${isClickable ? 'clickable' : ''}`}
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            type="button"
        >
            {showIcon && <span className="status-icon">{config.icon}</span>}
            <span className="status-label">{config.label}</span>
        </button>
    );
};

export default StatusButton;
