import { toast } from 'react-toastify';

/**
 * Centralized error handling utility
 */

// Error types
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    SERVER: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNKNOWN: 'UNKNOWN_ERROR'
};

// Determine error type from error object
export const getErrorType = (error) => {
    if (!error.response) {
        return ErrorTypes.NETWORK;
    }

    const status = error.response.status;
    
    if (status === 401 || status === 403) {
        return ErrorTypes.AUTH;
    } else if (status === 404) {
        return ErrorTypes.NOT_FOUND;
    } else if (status === 400 || status === 422) {
        return ErrorTypes.VALIDATION;
    } else if (status >= 500) {
        return ErrorTypes.SERVER;
    }
    
    return ErrorTypes.UNKNOWN;
};

// Get user-friendly error message
export const getErrorMessage = (error) => {
    const errorType = getErrorType(error);
    
    // Check for custom error message from backend
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Default messages based on error type
    const defaultMessages = {
        [ErrorTypes.NETWORK]: 'Network error. Please check your connection.',
        [ErrorTypes.AUTH]: 'Authentication failed. Please log in again.',
        [ErrorTypes.VALIDATION]: 'Invalid input. Please check your data.',
        [ErrorTypes.SERVER]: 'Server error. Please try again later.',
        [ErrorTypes.NOT_FOUND]: 'Resource not found.',
        [ErrorTypes.UNKNOWN]: 'An unexpected error occurred.'
    };

    return defaultMessages[errorType] || defaultMessages[ErrorTypes.UNKNOWN];
};

// Handle error with toast notification
export const handleError = (error, customMessage = null) => {
    console.error('Error:', error);
    
    const message = customMessage || getErrorMessage(error);
    toast.error(message);

    // If auth error, redirect to login
    if (getErrorType(error) === ErrorTypes.AUTH) {
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }

    return message;
};

// Async wrapper with error handling
export const withErrorHandling = async (asyncFn, errorMessage = null) => {
    try {
        return await asyncFn();
    } catch (error) {
        handleError(error, errorMessage);
        throw error; // Re-throw for component-level handling if needed
    }
};

// Retry logic for failed requests
export const retryRequest = async (asyncFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;
            
            // Don't retry on auth or validation errors
            const errorType = getErrorType(error);
            if (errorType === ErrorTypes.AUTH || errorType === ErrorTypes.VALIDATION) {
                throw error;
            }
            
            // Wait before retrying
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
    
    throw lastError;
};

export default {
    ErrorTypes,
    getErrorType,
    getErrorMessage,
    handleError,
    withErrorHandling,
    retryRequest
};
