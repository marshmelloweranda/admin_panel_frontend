export const formatID = (id) => id ? `#${String(id).padStart(5, '0')}` : 'N/A';

export const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'submitted':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

// Custom hook for debounced callbacks
export const useDebouncedCallback = (callback, delay) => {
    const React = require('react');
    const timeoutRef = React.useRef(null);
    
    return React.useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
};