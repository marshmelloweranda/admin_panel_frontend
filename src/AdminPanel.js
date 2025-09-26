import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5001/api';

// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="Close modal">
            <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Simplified Editable Field Component (without pencil icon)
const DisplayField = ({ label, value, className = "" }) => (
  <div className={`flex items-center justify-between py-2 ${className}`}>
    <strong className="w-1/3">{label}:</strong>
    <div className="flex items-center space-x-2 w-2/3">
      <span className="text-gray-700 flex-1">{value || 'N/A'}</span>
    </div>
  </div>
);

// Categories Display Component
const CategoriesDisplay = ({ categories }) => {
  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-2">
        <strong>Driving Licence Categories:</strong>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories && categories.length > 0 ? (
          categories.map((cat, index) => (
            <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {cat.label || cat.name || 'Unnamed Category'} 
              {cat.code && ` (${cat.code})`}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No categories selected</span>
        )}
      </div>
    </div>
  );
};

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminPanel() {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/applications`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            setError('Could not load application data. Please ensure the backend server is running on port 5001.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Update status only (removed field update functions since editing is disabled)
    const handleUpdateStatus = useCallback(async (appId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
            
            const updatedApp = await response.json();
            
            setApplications(prev => prev.map(app => 
                app.id === updatedApp.id ? updatedApp : app
            ));
            
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp(updatedApp);
            }
        } catch (error) {
            console.error(`Failed to update status:`, error);
            setError(`Could not update status: ${error.message}`);
        }
    }, [selectedApp]);

    const openViewModal = (app) => {
        setSelectedApp(app);
        setViewModalOpen(true);
    };

    const openEditModal = (app) => {
        setSelectedApp(app);
        setEditModalOpen(true);
    };

    const closeModal = () => {
        setSelectedApp(null);
        setViewModalOpen(false);
        setEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const newStatus = e.target.elements.status.value;
        if (selectedApp) {
            handleUpdateStatus(selectedApp.id, newStatus);
        }
        closeModal();
    };

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            if (filterStatus !== 'all' && app.status !== filterStatus) return false;
            const searchTermLower = searchTerm.toLowerCase();
            if (searchTermLower === '') return true;
            return app.application_id.toLowerCase().includes(searchTermLower) ||
                   String(app.user_id).toLowerCase().includes(searchTermLower) ||
                   (app.user_name && app.user_name.toLowerCase().includes(searchTermLower));
        });
    }, [applications, searchTerm, filterStatus]);

    // Helper function to get categories from application data
    const getCategories = (application) => {
        // Try different possible field names for categories
        return application.selected_categories || 
               application.categories || 
               application.driving_categories || 
               application.licence_categories || 
               [];
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Application Admin Panel</h1>
                    <p className="text-gray-600 mt-2">Manage and review all user licence applications.</p>
                </header>

                {/* Filter and Search Controls */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-2/3">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                             <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Application ID, User ID, or User Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative w-full sm:w-1/3">
                       <select
                           value={filterStatus}
                           onChange={e => setFilterStatus(e.target.value)}
                           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                       >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <Icon path="M19.5 8.25l-7.5 7.5-7.5-7.5" className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    {error && (
                        <div className="p-4 text-center text-red-600 bg-red-100 rounded-md m-4">
                            {error}
                            <button 
                                onClick={fetchApplications} 
                                className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {isLoading ? (
                         <div className="p-8 text-center text-gray-500">Loading applications...</div>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Application ID</th>
                                    <th scope="col" className="px-6 py-3">User ID</th>
                                    <th scope="col" className="px-6 py-3">User Name</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Total Amount</th>
                                    <th scope="col" className="px-6 py-3">Categories</th>
                                    <th scope="col" className="px-6 py-3">Date Submitted</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map(app => (
                                    <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{app.application_id}</td>
                                        <td className="px-6 py-4">{app.user_id}</td>
                                        <td className="px-6 py-4">{app.user_name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[app.status]}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">${app.total_amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {getCategories(app).slice(0, 2).map((cat, index) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                                        {cat.code || cat.label || 'Category'}
                                                    </span>
                                                ))}
                                                {getCategories(app).length > 2 && (
                                                    <span className="text-gray-500 text-xs">+{getCategories(app).length - 2} more</span>
                                                )}
                                                {getCategories(app).length === 0 && (
                                                    <span className="text-gray-400 text-xs">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 flex items-center justify-center space-x-2">
                                            <button onClick={() => openViewModal(app)} title="View Details" className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                                                <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </button>
                                            <button onClick={() => openEditModal(app)} title="Edit Status" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                                                <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                            </button>
                                            <button onClick={() => handleUpdateStatus(app.id, 'approved')} title="Approve" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors">
                                                <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </button>
                                            <button onClick={() => handleUpdateStatus(app.id, 'rejected')} title="Reject" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                                <Icon path="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                     {!isLoading && filteredApplications.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                           No applications found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced View Modal with Display Fields Only */}
            <Modal isOpen={isViewModalOpen} onClose={closeModal} title="Application Details">
                {selectedApp && (
                    <div className="space-y-4">
                        {/* Application Info */}
                        <div className="space-y-2">
                            <DisplayField 
                                label="Application ID" 
                                value={selectedApp.application_id} 
                            />
                            <DisplayField 
                                label="User ID" 
                                value={selectedApp.user_id} 
                            />
                            <DisplayField 
                                label="User Name" 
                                value={selectedApp.user_name} 
                            />
                            <div className="flex items-center justify-between py-2">
                                <strong>Status:</strong>
                                <span className={`px-2 py-1 text-sm font-semibold rounded-full capitalize ${statusStyles[selectedApp.status]}`}>
                                    {selectedApp.status}
                                </span>
                            </div>
                            <DisplayField 
                                label="Total Amount" 
                                value={selectedApp.total_amount} 
                            />
                        </div>
                        <hr />

                        {/* Payment & Medical Info */}
                        <div className="space-y-2">
                            <DisplayField 
                                label="Medical Certificate ID" 
                                value={selectedApp.medical_certificate_id} 
                            />
                            <DisplayField 
                                label="Payment Reference" 
                                value={selectedApp.payment_reference_id} 
                            />
                            <DisplayField 
                                label="Payment Transaction" 
                                value={selectedApp.payment_transaction_id} 
                            />
                        </div>
                        <hr />

                        {/* Driving Licence Categories */}
                        <CategoriesDisplay 
                            categories={getCategories(selectedApp)}
                        />
                        <hr/>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                             <div><strong>Created At:</strong> <p>{new Date(selectedApp.created_at).toLocaleString()}</p></div>
                             <div><strong>Last Updated:</strong> <p>{selectedApp.updated_at ? new Date(selectedApp.updated_at).toLocaleString() : 'N/A'}</p></div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal (for status only) */}
            <Modal isOpen={isEditModalOpen} onClose={closeModal} title="Edit Application Status">
                 {selectedApp && (
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4">
                            <p><strong>Application ID:</strong> {selectedApp.application_id}</p>
                            <p><strong>User Name:</strong> {selectedApp.user_name || 'N/A'}</p>
                            <div>
                               <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                               <select
                                 id="status"
                                 name="status"
                                 defaultValue={selectedApp.status}
                                 className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-6 space-x-2">
                             <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                        </div>
                    </form>
                 )}
            </Modal>
        </div>
    );
}