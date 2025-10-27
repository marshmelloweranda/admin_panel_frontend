import React from 'react';

const DetailRow = ({ label, value, fullWidth = false }) => (
    <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-gray-500 font-medium">{label}:</label>
        <span className="text-gray-900 font-normal break-words">{value || 'N/A'}</span>
    </div>
);

export default DetailRow;