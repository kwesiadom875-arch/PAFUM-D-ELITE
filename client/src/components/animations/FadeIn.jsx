import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0, duration = 0.5 }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

export default FadeIn;
