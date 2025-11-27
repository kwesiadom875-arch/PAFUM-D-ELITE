/**
 * Input validation utilities
 */

// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 6 characters)
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// URL validation
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Fragrantica URL validation
export const isValidFragranticaUrl = (url) => {
    return url && url.includes('fragrantica.com');
};

// Price validation (positive number)
export const isValidPrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
};

// Stock quantity validation (non-negative integer)
export const isValidStock = (stock) => {
    const num = parseInt(stock);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

// Required field validation
export const isRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

// Min length validation
export const minLength = (value, min) => {
    return value && value.length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
    return value && value.length <= max;
};

// Validate form data
export const validateForm = (data, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const value = data[field];
        const fieldRules = rules[field];
        
        fieldRules.forEach(rule => {
            if (rule.validator && !rule.validator(value)) {
                errors[field] = rule.message;
            }
        });
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Common validation rules
export const ValidationRules = {
    email: [
        {
            validator: isRequired,
            message: 'Email is required'
        },
        {
            validator: isValidEmail,
            message: 'Invalid email format'
        }
    ],
    password: [
        {
            validator: isRequired,
            message: 'Password is required'
        },
        {
            validator: isValidPassword,
            message: 'Password must be at least 6 characters'
        }
    ],
    productName: [
        {
            validator: isRequired,
            message: 'Product name is required'
        },
        {
            validator: (val) => minLength(val, 3),
            message: 'Product name must be at least 3 characters'
        }
    ],
    price: [
        {
            validator: isRequired,
            message: 'Price is required'
        },
        {
            validator: isValidPrice,
            message: 'Price must be a positive number'
        }
    ],
    stock: [
        {
            validator: isRequired,
            message: 'Stock quantity is required'
        },
        {
            validator: isValidStock,
            message: 'Stock must be a non-negative integer'
        }
    ],
    url: [
        {
            validator: isRequired,
            message: 'URL is required'
        },
        {
            validator: isValidUrl,
            message: 'Invalid URL format'
        }
    ],
    fragranticaUrl: [
        {
            validator: isRequired,
            message: 'Fragrantica URL is required'
        },
        {
            validator: isValidFragranticaUrl,
            message: 'Must be a valid Fragrantica URL'
        }
    ]
};

export default {
    isValidEmail,
    isValidPassword,
    isValidUrl,
    isValidFragranticaUrl,
    isValidPrice,
    isValidStock,
    isRequired,
    minLength,
    maxLength,
    validateForm,
    ValidationRules
};
