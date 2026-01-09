import React from 'react';
import { FaClock, FaWind, FaCloudSun } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ClimateStats = ({ climateStats }) => {
    if (!climateStats) return null;

    const stats = [
        {
            icon: <FaClock />,
            label: "Longevity",
            value: climateStats.longevity || "Moderate",
            color: "#C5A059"
        },
        {
            icon: <FaWind />,
            label: "Projection",
            value: climateStats.projection || "Moderate",
            color: "#4CAF50"
        },
        {
            icon: <FaCloudSun />,
            label: "Best Weather",
            value: climateStats.bestWeather || "All Year",
            color: "#FF9800"
        }
    ];

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{
                fontSize: '1.2rem',
                color: '#333',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
                paddingBottom: '0.5rem',
                display: 'inline-block',
                width: '100%'
            }}>
                Climate - Optimized Performance
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '1.5rem'
            }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            color: stat.color,
                            marginBottom: '0.5rem',
                            background: 'rgba(0,0,0,0.05)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem'
                        }}>
                            {stat.icon}
                        </div>
                        <h4 style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            marginBottom: '0.2rem'
                        }}>
                            {stat.label}
                        </h4>
                        <p style={{
                            fontSize: '1rem',
                            color: '#333',
                            fontWeight: '500'
                        }}>
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ClimateStats;
