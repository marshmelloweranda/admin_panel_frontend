import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useDebouncedCallback } from '../../utils/helpers';
import ApplicationsStats from './ApplicationsStats';
import ApplicationsFilters from './ApplicationsFilters';
import ApplicationsTable from './ApplicationsTable';
import ViewApplicationModal from '../modals/ViewApplicationModal';
import EditApplicationModal from '../modals/EditApplicationModal';

const ApplicationsAdmin = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [apiError, setApiError] = useState('');
    const [notification, setNotification] = useState(null);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasPrev: false,
        hasNext: false,
    });
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setApiError('');
        try {
            const data = await api.get('/applications', filters);
            setApplications(data.applications || []);
            setPagination({
                currentPage: filters.page,
                totalPages: data.totalPages || 1,
                totalItems: data.totalItems || 0,
                hasPrev: filters.page > 1,
                hasNext: filters.page < (data.totalPages || 1),
            });
        } catch (error) {
            console.error("Fetch Applications Error:", error);
            setApiError('Connection Error: Could not fetch application data. Check your API server.');
            setApplications([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                hasPrev: false,
                hasNext: false,
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await api.get('/applications/stats');
            setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
        } catch (error) {
            console.error("Fetch Stats Error:", error);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [fetchApplications, fetchStats]);

    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: name === 'page' ? value : 1,
        }));
    }, []);

    const debouncedSearchHandler = useDebouncedCallback((value) => {
        setFilters(prev => ({
            ...prev,
            search: value,
            page: 1,
        }));
    }, 300);

    const handleSearchChange = (value) => {
        debouncedSearchHandler(value);
    };

    const handleSort = useCallback((sortBy) => {
        setFilters(prev => {
            const sortOrder = prev.sortBy === sortBy && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC';
            return {
                ...prev,
                sortBy,
                sortOrder,
                page: 1
            };
        });
    }, []);

    const handleOpenModal = (application, type) => {
        setSelectedApplication(application);
        if (type === 'view') {
            setShowViewModal(true);
        } else if (type === 'edit') {
            setShowEditModal(true);
        }
    };

const handleUpdateApplication = useCallback(async (sub, data) => {
    setIsSaving(true);
    setApiError('');
    
    console.log('=== FRONTEND DEBUG ===');
    console.log('Application ID:', sub);
    console.log('Update data:', data);
    console.log('Data type:', typeof data);
    
    // Create a clean copy of the data
    const cleanData = { ...data };
    
    // Remove any undefined or null values that might cause issues
    Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
            delete cleanData[key];
        }
    });
    
    console.log('Cleaned data:', cleanData);
    console.log('Stringified data:', JSON.stringify(cleanData));
    
    try {
        const response = await api.put(`/applications/${sub}`, cleanData);
        console.log('Update successful, response:', response);
        showNotification('Application updated successfully.');
        setShowEditModal(false);
        fetchApplications();
        fetchStats();
    } catch (error) {
        console.error("Update Application Error:", error);
        console.error("Error details:", error);
        setApiError(`Update Failed: ${error.message}`);
        showNotification('Failed to update application.', 'error');
    } finally {
        setIsSaving(false);
    }
}, [fetchApplications, fetchStats, showNotification]);
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
            {notification && (
                <div 
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
                    role="alert"
                >
                    {notification.message}
                </div>
            )}
            
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Applications Overview</h1>
                <ApplicationsStats stats={stats} loading={loading} />
            </header>

            <ApplicationsFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
            />

            {apiError && (
                <div className="p-4 mb-4 text-center text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-xl">
                    {apiError}
                </div>
            )}

            <ApplicationsTable
                applications={applications}
                loading={loading}
                filters={filters}
                pagination={pagination}
                onSort={handleSort}
                onOpenModal={handleOpenModal}
                onFilterChange={handleFilterChange}
            />

            {/* Modals */}
            {showViewModal && selectedApplication && (
                <ViewApplicationModal
                    application={selectedApplication}
                    onClose={() => setShowViewModal(false)}
                />
            )}

            {showEditModal && selectedApplication && (
                <EditApplicationModal
                    application={selectedApplication}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleUpdateApplication}
                    loading={isSaving}
                />
            )}
        </div>
    );
};

export default ApplicationsAdmin;