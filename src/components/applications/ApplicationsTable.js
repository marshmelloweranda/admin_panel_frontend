import React from 'react';
import { formatID, formatDate, getStatusBadgeClass } from '../../utils/helpers';

const ApplicationsTable = ({ 
    applications, 
    loading, 
    filters, 
    pagination, 
    onSort, 
    onOpenModal, 
    onFilterChange 
}) => {
    
    const SortIcon = ({ column }) => {
        if (filters.sortBy !== column) return <span className="text-gray-400 ml-1">↕</span>;
        return filters.sortOrder === 'ASC' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    const tableHeaders = [
        { key: 'id', label: 'ID' },
        { key: 'full_name', label: 'Applicant' },
        { key: 'created_at', label: 'Date' },
        { key: 'status', label: 'Status' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {tableHeaders.map(({ key, label }) => (
                            <th 
                                key={key}
                                onClick={() => onSort(key)}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-150"
                            >
                                <div className="flex items-center">
                                    {label}
                                    <SortIcon column={key} />
                                </div>
                            </th>
                        ))}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading applications...</td></tr>
                    ) : applications.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No applications found based on current filters.</td></tr>
                    ) : (
                        applications.map((app) => (
                            <tr key={app.id} className="hover:bg-indigo-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatID(app.id)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(app.status)}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => onOpenModal(app, 'view')}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                                    >
                                        View
                                    </button>
                                    <button 
                                        onClick={() => onOpenModal(app, 'edit')}
                                        className="text-green-600 hover:text-green-900 font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:justify-end">
                    <button
                        disabled={!pagination.hasPrev || loading}
                        onClick={() => onFilterChange('page', filters.page - 1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <div className="mx-4 flex items-center">
                        <span className="text-sm text-gray-700">Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong></span>
                    </div>
                    <button
                        disabled={!pagination.hasNext || loading}
                        onClick={() => onFilterChange('page', filters.page + 1)}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default ApplicationsTable;