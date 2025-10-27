import React from 'react';
import FormGroup from '../common/FormGroup';

const ApplicationsFilters = ({ filters, onFilterChange, onSearchChange }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Filter & Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormGroup label="Search (Name/ID)">
                    <input
                        type="text"
                        placeholder="Search applications..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </FormGroup>
                
                <FormGroup label="Status">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </FormGroup>
                
                <FormGroup label="Items per Page">
                    <select
                        value={filters.limit}
                        onChange={(e) => onFilterChange('limit', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </FormGroup>
            </div>
        </div>
    );
};

export default ApplicationsFilters;