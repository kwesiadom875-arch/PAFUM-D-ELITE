import React from 'react';
import PropTypes from 'prop-types';

const MembershipCard = ({ user, tierColorClass }) => {
    if (!user) return null;

    return (
        <div className="membership-card-container">
            <div className={`member-card ${tierColorClass}`}>
                <div className="card-top">
                    <span className="card-brand">PARFUM D'ELITE</span>
                    <span className="card-tier">{user.tier || 'Bronze'} MEMBER</span>
                </div>
                <div className="card-chip">
                    <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" alt="chip" />
                </div>
                <div className="card-details">
                    <div className="card-holder">
                        <span className="label">Member Name</span>
                        <span className="value">{user.username}</span>
                    </div>
                    <div className="card-since">
                        <span className="label">Member Since</span>
                        <span className="value">{new Date(user.createdAt).getFullYear()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

MembershipCard.propTypes = {
    user: PropTypes.shape({
        tier: PropTypes.string,
        username: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired
    }),
    tierColorClass: PropTypes.string
};

MembershipCard.defaultProps = {
    user: null,
    tierColorClass: 'bronze-card'
};

export default MembershipCard;
