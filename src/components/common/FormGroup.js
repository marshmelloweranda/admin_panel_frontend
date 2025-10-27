import React from 'react';

const FormGroup = ({ label, children, className = '' }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {children}
    </div>
);

export default FormGroup;