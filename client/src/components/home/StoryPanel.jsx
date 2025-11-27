import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StoryPanel.css';

gsap.registerPlugin(ScrollTrigger);

const StoryPanel = ({ title, description, image, index }) => {
    const panelRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (!panelRef.current) return;

        const ctx = gsap.context(() => {
            // Image parallax
            gsap.to(imageRef.current, {
                y: -100,
                ease: 'none',
                scrollTrigger: {
                    trigger: panelRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            // Text fade in
            gsap.from(textRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: panelRef.current,
                    start: 'top 70%',
                    end: 'top 30%',
                    scrub: 1
                }
            });
        }, panelRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={`story-panel panel-${index}`} ref={panelRef}>
            <div className="panel-background" ref={imageRef}>
                <img src={image} alt={title} />
                <div className="panel-overlay"></div>
            </div>

            <div className="panel-content" ref={textRef}>
                <span className="panel-number">0{index}</span>
                <h2 className="panel-title">{title}</h2>
                <p className="panel-description">{description}</p>
            </div>
        </div>
    );
};

StoryPanel.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    index: PropTypes.number
};

StoryPanel.defaultProps = {
    index: 1
};

export default StoryPanel;
