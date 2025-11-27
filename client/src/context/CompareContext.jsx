import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            setCompareList(JSON.parse(saved));
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product) => {
        if (compareList.find(p => p._id === product._id)) {
            return toast.info("Already in comparison");
        }
        if (compareList.length >= 3) {
            return toast.warning("You can compare up to 3 perfumes");
        }
        setCompareList([...compareList, product]);
        setIsOpen(true); // Open tray when adding
        toast.success("Added to comparison");
    };

    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter(p => p._id !== productId));
    };

    const clearCompare = () => {
        setCompareList([]);
        setIsOpen(false);
    };

    const toggleTray = () => setIsOpen(!isOpen);

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isOpen,
            toggleTray
        }}>
            {children}
        </CompareContext.Provider>
    );
};
