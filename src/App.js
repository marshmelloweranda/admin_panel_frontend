import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Set up for Tailwind CSS and Inter font (assumed to be loaded in the environment)

// --- API Utility Functions ---
const API_BASE_URL = 'http://dmt.digieconcenter.gov.lk/aapi'; 
const DEBOUNCE_DELAY = 300; 

/**
 * Generic API fetcher that handles JSON parsing and error checking.
 * Implements exponential backoff for robustness.
 */
const apiFetcher = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = { error: 'Non-JSON response received' };
            }

            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }
            return data;
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API Request Failed after ${retries} attempts: ${error.message}`);
            }
        }
    }
};

/**
 * API service object for application management.
 */
const api = {
    get: (path, params = {}) => {
        const url = new URL(API_BASE_URL + path);
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== '' && params[key] !== undefined) url.searchParams.append(key, params[key]);
        });
        return apiFetcher(url.toString());
    },
    put: (path, body) => apiFetcher(API_BASE_URL + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }),
};

// --- Helper Functions ---

const formatID = (id) => id ? `#${String(id).padStart(5, '0')}` : 'N/A';

const getStatusBadgeClass = (status) => {
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

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

// --- Sub-Components: Modals ---

const ViewApplicationModal = ({ application, onClose }) => {
    if (!application) return null;

    // Use a mock admin_status if not provided by the API
    const admin_status = application.admin_status || 'unverified';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">Application Details: {formatID(application.id)}</h2>
                    <button className="text-gray-500 hover:text-gray-900 transition-colors" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Modal Body with Scroll */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* Status Section */}
                    <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center border border-indigo-200">
                        <div className="text-gray-600 font-medium">Application Status</div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
                            {application.status}
                        </span>
                    </div>

                    {/* Personal Info */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <DetailRow label="Full Name" value={application.full_name} />
                            <DetailRow label="Email" value={application.email} />
                            <DetailRow label="Phone" value={application.phone} />
                            <DetailRow label="Date of Birth" value={formatDate(application.date_of_birth)} />
                            <DetailRow label="Gender" value={application.gender} />
                            <DetailRow label="Blood Group" value={application.blood_group} />
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Medical Certificate Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <DetailRow label="Doctor" value={application.doctor_name} />
                            <DetailRow label="Hospital" value={application.hospital} />
                            <DetailRow label="Issued Date" value={formatDate(application.issued_date)} />
                            <DetailRow label="Expiry Date" value={formatDate(application.expiry_date)} />
                            <DetailRow label="Vision" value={application.vision} />
                            <DetailRow label="Hearing" value={application.hearing} />
                            <DetailRow label="Fit to Drive" value={application.is_fit_to_drive ? 'Yes' : 'No'} />
                            <DetailRow label="Admin Status" value={admin_status} />
                            <DetailRow label="Remarks" value={application.remarks} fullWidth={true} />
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">System/Payment Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <DetailRow label="Application ID" value={application.application_id} />
                            <DetailRow label="Medical ID" value={application.medical_certificate_id} />
                            <DetailRow label="Payment Ref" value={application.payment_reference_id} />
                            <DetailRow label="Created At" value={new Date(application.created_at).toLocaleString()} />
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
                    <button className="px-5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, fullWidth = false }) => (
    <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-gray-500 font-medium">{label}:</label>
        <span className="text-gray-900 font-normal break-words">{value || 'N/A'}</span>
    </div>
);


const EditApplicationModal = ({ application, onClose, onSave, loading }) => {
    // Determine initial form data based on the application object
    const [formData, setFormData] = useState({
        full_name: application.full_name || '',
        email: application.email || '',
        phone: application.phone || '',
        date_of_birth: application.date_of_birth || '',
        gender: application.gender || '',
        blood_group: application.blood_group || '',
        doctor_name: application.doctor_name || '',
        hospital: application.hospital || '',
        // Dates often need specific formatting for input fields
        issued_date: application.issued_date ? application.issued_date.split('T')[0] : '',
        expiry_date: application.expiry_date ? application.expiry_date.split('T')[0] : '',
        is_fit_to_drive: application.is_fit_to_drive || false,
        vision: application.vision || '',
        hearing: application.hearing || '',
        remarks: application.remarks || '',
        status: application.status || 'pending',
        // Mock admin status field
        admin_status: application.admin_status || 'unverified', 
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(application.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Application: {formatID(application.id)}</h2>
                    <button className="text-gray-500 hover:text-gray-900 transition-colors" onClick={onClose} disabled={loading}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    {/* FIX: This div handles the scrolling */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                        
                        {/* Status and Admin Control Section */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4 border-b pb-2">Status & Admin Control</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormGroup label="Status">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        disabled={loading}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </FormGroup>
                                
                                <FormGroup label="Admin Verification Status">
                                    <select
                                        name="admin_status"
                                        value={formData.admin_status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        disabled={loading}
                                    >
                                        <option value="unverified">Unverified</option>
                                        <option value="verified">Verified</option>
                                        <option value="on_hold">On Hold</option>
                                    </select>
                                </FormGroup>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormGroup label="Full Name">
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Email">
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Phone">
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Date of Birth">
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Gender">
                                    <select name="gender" value={formData.gender} onChange={handleChange} disabled={loading} className="form-input">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormGroup>
                                <FormGroup label="Blood Group">
                                    <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                            </div>
                        </div>
                        
                        {/* Medical Information Section */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Medical Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormGroup label="Doctor Name">
                                    <input type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Hospital">
                                    <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Issued Date">
                                    <input type="date" name="issued_date" value={formData.issued_date} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Expiry Date">
                                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Vision">
                                    <input type="text" name="vision" value={formData.vision} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <FormGroup label="Hearing">
                                    <input type="text" name="hearing" value={formData.hearing} onChange={handleChange} disabled={loading} className="form-input" />
                                </FormGroup>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <FormGroup label="Remarks" className="w-full">
                                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" disabled={loading} className="form-input resize-y"></textarea>
                                    </FormGroup>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3 flex items-center pt-2">
                                    <input
                                        type="checkbox"
                                        name="is_fit_to_drive"
                                        checked={formData.is_fit_to_drive}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className="ml-2 block text-sm font-medium text-gray-700">Is Fit to Drive?</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Modal Footer (Fixed Position) */}
                    <div className="p-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                        <button 
                            type="button" 
                            className="px-5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors" 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormGroup = ({ label, children, className = '' }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {children}
    </div>
);


// --- Main Application Component (ApplicationsAdmin) ---

const ApplicationsAdmin = ({ api }) => {
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

    // Debounced Search Handler
    const useDebouncedCallback = (callback, delay) => {
        const timeoutRef = React.useRef(null);
        return useCallback((...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }, [callback, delay]);
    };

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
                hasNext: filters.page < data.totalPages,
            });
        } catch (error) {
            console.error("Fetch Applications Error:", error);
            setApiError('Connection Error: Could not fetch application data. Check your API server.');
            setApplications([]);
            setPagination({});
        } finally {
            setLoading(false);
        }
    }, [api, filters]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await api.get('/applications/stats');
            setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
        } catch (error) {
            console.error("Fetch Stats Error:", error);
            // Stats fetching errors are less critical, so we don't block the UI
        }
    }, [api]);

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [fetchApplications, fetchStats]);

    // Handle filter changes (excluding search, which uses debounce)
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1, // Reset to first page on most filter changes
        }));
    }, []);

    // Debounced search input handler
    const handleSearchChange = useDebouncedCallback((value) => {
        setFilters(prev => ({
            ...prev,
            search: value,
            page: 1,
        }));
    }, DEBOUNCE_DELAY);

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

    const handleUpdateApplication = useCallback(async (id, data) => {
        setIsSaving(true);
        setApiError('');
        try {
            await api.put(`/applications/${id}`, data);
            showNotification('Application updated successfully.');
            setShowEditModal(false);
            // Refresh data after successful update
            fetchApplications();
            fetchStats();
        } catch (error) {
            console.error("Update Application Error:", error);
            setApiError(`Update Failed: ${error.message}`);
            showNotification('Failed to update application.', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [api, fetchApplications, fetchStats, showNotification]);

    const statsData = useMemo(() => [
        { name: 'Total Applications', value: stats.total || 0, color: 'bg-indigo-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.656-.126-1.283-.356-1.857M6 18c-2.347 0-4-1.867-4-3.5S3.653 11 6 11c3.122 0 5 1.766 5 3.5S9.122 18 6 18zm0 0v-2.5a2.5 2.5 0 005 0V18' },
        { name: 'Pending Review', value: stats.pending || 0, color: 'bg-yellow-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { name: 'Approved', value: stats.approved || 0, color: 'bg-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Rejected', value: stats.rejected || 0, color: 'bg-red-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ], [stats]);
    
    // Sort Icon Helper
    const SortIcon = ({ column }) => {
        if (filters.sortBy !== column) return <span className="text-gray-400 ml-1">&#x2195;</span>; // Up/Down
        return filters.sortOrder === 'ASC' ? <span className="ml-1">&#x25B2;</span> : <span className="ml-1">&#x25BC;</span>; // Up or Down Triangle
    };

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
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat) => (
                        <div key={stat.name} className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${stat.color.replace('bg-', 'border-')}`}>
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                    <svg className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Filter & Search</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <FormGroup label="Search (Name/ID)">
                        <input
                            type="text"
                            placeholder="Search applications..."
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="form-input"
                        />
                    </FormGroup>
                    
                    <FormGroup label="Status">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="form-input"
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
                            onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                            className="form-input"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </FormGroup>
                </div>
            </div>

            {/* Application Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                {apiError && (
                    <div className="p-4 text-center text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-t-xl">
                        {apiError}
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Table Headers */}
                            {[
                                { key: 'id', label: 'ID' },
                                { key: 'full_name', label: 'Applicant' },
                                { key: 'created_at', label: 'Date' },
                                { key: 'status', label: 'Status' },
                                { key: 'phone', label: 'Phone' },
                                { key: 'email', label: 'Email' },
                            ].map(({ key, label }) => (
                                <th 
                                    key={key}
                                    onClick={() => handleSort(key)}
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
                                            onClick={() => handleOpenModal(app, 'view')}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                                        >
                                            View
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal(app, 'edit')}
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
                            onClick={() => handleFilterChange('page', filters.page - 1)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <div className="mx-4 flex items-center">
                            <span className="text-sm text-gray-700">Page **{pagination.currentPage}** of **{pagination.totalPages}**</span>
                        </div>
                        <button
                            disabled={!pagination.hasNext || loading}
                            onClick={() => handleFilterChange('page', filters.page + 1)}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </nav>
            </div>

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

// --- Mock Login Component (AdminPanel Dependent) ---
const LoginComponent = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Authentication Logic
        setTimeout(() => {
            if (username === 'admin' && password === 'password') {
                onLogin();
            } else {
                setError('Invalid credentials. Use admin/password.');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
            {/* Login card uses max-w-lg for a wider look, as requested */}
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Department of Motor Traffic</h1>
                    <h2 className="text-3xl font-extrabold text-indigo-600 text-center mb-6">
                        Admin Dashboard Sign In
                    </h2>
                    
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <FormGroup label="Username">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Username (admin)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label="Password">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Password (password)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormGroup>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'} transition duration-150 ease-in-out`}
                        >
                            {loading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Logging in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4 pb-4">
                    Mock Credentials: **admin / password**
                </p>
            </div>
        </div>
    );
};

// --- Main App Component (Renamed to AdminPanel for clarity) ---
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Simulate checking session/token on load
    useEffect(() => {
        const storedAuth = sessionStorage.getItem('dmt-auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem('dmt-auth', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('dmt-auth');
    };

    return (
        <div className="font-sans antialiased min-h-screen">
            {isAuthenticated ? (
                <>
                    {/* Header is full width */}
                    <header className="bg-white shadow-lg fixed w-full z-20">
                        <div className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
                            <h1 className="text-xl font-bold text-gray-900">
                                Department of Motor Traffic - Admin Panel
                            </h1>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                            >
                                Sign Out
                            </button>
                        </div>
                    </header>
                    <main className="pt-20"> {/* Padding to account for fixed header */}
                        <ApplicationsAdmin api={api} />
                    </main>
                </>
            ) : (
                <LoginComponent onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;

// Custom utility classes to ensure black text and consistent styling
// These are not separate files, just utility classes defined conceptually here for clarity.
/*
.form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition;
}
*/
