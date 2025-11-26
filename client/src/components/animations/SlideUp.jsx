import React from 'react';
import { motion } from 'framer-motion';

const SlideUp = ({ children, delay = 0, duration = 0.5, yOffset = 50 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

export default SlideUp;
