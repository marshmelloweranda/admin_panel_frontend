import React, { useState } from 'react';
import FormGroup from '../common/FormGroup';
import { formatID } from '../../utils/helpers';

// Helper function to format date for input[type="date"]
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    
    // If it's a full ISO string or other date format
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.warn('Failed to parse date:', dateString, error);
    }
    
    return '';
};

const EditApplicationModal = ({ application, onClose, onSave, loading }) => {
    const [formData, setFormData] = useState({
        full_name: application.full_name || '',
        email: application.email || '',
        phone: application.phone || '',
        date_of_birth: formatDateForInput(application.date_of_birth),
        gender: application.gender || '',
        blood_group: application.blood_group || '',
        doctor_name: application.doctor_name || '',
        hospital: application.hospital || '',
        issued_date: formatDateForInput(application.issued_date),
        expiry_date: formatDateForInput(application.expiry_date),
        is_fit_to_drive: application.is_fit_to_drive || false,
        vision: application.vision || '',
        hearing: application.hearing || '',
        remarks: application.remarks || '',
        status: application.status || 'pending',
        admin_status: application.admin_status || 'unverified', 
    });

    // Debug the dates on component mount
    React.useEffect(() => {
        console.log('Original application dates:', {
            date_of_birth: application.date_of_birth,
            issued_date: application.issued_date,
            expiry_date: application.expiry_date
        });
        console.log('Formatted dates in form:', {
            date_of_birth: formData.date_of_birth,
            issued_date: formData.issued_date,
            expiry_date: formData.expiry_date
        });
    }, [application, formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Log the data being sent for debugging
        console.log('Submitting form data:', formData);
        
        onSave(application.application_id, formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
                style={{ height: '95vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Application: {formatID(application.id)}</h2>
                        <button className="text-gray-500 hover:text-gray-900 transition-colors" onClick={onClose} disabled={loading}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-hidden">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                
                                {/* Applicant Photo Section */}
                                {application.photo_url && (
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Applicant Photo</h3>
                                        <div className="flex justify-center">
                                            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                                                <img 
                                                    src={application.photo_url} 
                                                    alt="Applicant" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NiA3MCMxMTEuNDY2IDcwIDEyNCA4Mi41MzQ0IDEyNCA5OEMxMjQgMTEzLjQ2NiAxMTEuNDY2IDEyNiA5NiAxMjZDODAuNTM0NCAxMjYgNjggMTEzLjQ2NiA2OCA5OEM2OCA4Mi41MzQ0IDgwLjUzNDQgNzAgOTYgNzBaTTk2IDE0MEMxMjMuMTk2IDE0MCAxNDYgMTU0LjY2NyAxNDYgMTcySDUwQzUwIDE1NC42NjcgNzIuODA0IDE0MCA5NiAxNDBaIiBmaWxsPSIjOEM5M0FCIi8+Cjwvc3ZnPgo=';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-gray-500 mt-2">Photo (View Only)</p>
                                    </div>
                                )}

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
                                            <input 
                                                type="text" 
                                                name="full_name" 
                                                value={formData.full_name} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Email">
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Phone">
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Date of Birth">
                                            <input 
                                                type="date" 
                                                name="date_of_birth" 
                                                value={formData.date_of_birth} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                            {formData.date_of_birth && (
                                                <small className="text-gray-500 text-xs mt-1 block">
                                                    Displaying: {formData.date_of_birth}
                                                </small>
                                            )}
                                        </FormGroup>
                                        <FormGroup label="Gender">
                                            <select 
                                                name="gender" 
                                                value={formData.gender} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Blood Group">
                                            <input 
                                                type="text" 
                                                name="blood_group" 
                                                value={formData.blood_group} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                                
                                {/* Medical Information Section */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Medical Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormGroup label="Doctor Name">
                                            <input 
                                                type="text" 
                                                name="doctor_name" 
                                                value={formData.doctor_name} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Hospital">
                                            <input 
                                                type="text" 
                                                name="hospital" 
                                                value={formData.hospital} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Issued Date">
                                            <input 
                                                type="date" 
                                                name="issued_date" 
                                                value={formData.issued_date} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                            {formData.issued_date && (
                                                <small className="text-gray-500 text-xs mt-1 block">
                                                    Displaying: {formData.issued_date}
                                                </small>
                                            )}
                                        </FormGroup>
                                        <FormGroup label="Expiry Date">
                                            <input 
                                                type="date" 
                                                name="expiry_date" 
                                                value={formData.expiry_date} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                            {formData.expiry_date && (
                                                <small className="text-gray-500 text-xs mt-1 block">
                                                    Displaying: {formData.expiry_date}
                                                </small>
                                            )}
                                        </FormGroup>
                                        <FormGroup label="Vision">
                                            <input 
                                                type="text" 
                                                name="vision" 
                                                value={formData.vision} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <FormGroup label="Hearing">
                                            <input 
                                                type="text" 
                                                name="hearing" 
                                                value={formData.hearing} 
                                                onChange={handleChange} 
                                                disabled={loading} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                            />
                                        </FormGroup>
                                        <div className="sm:col-span-2 lg:col-span-3">
                                            <FormGroup label="Remarks" className="w-full">
                                                <textarea 
                                                    name="remarks" 
                                                    value={formData.remarks} 
                                                    onChange={handleChange} 
                                                    rows="3" 
                                                    disabled={loading} 
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y"
                                                />
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

                                {/* Additional spacing to ensure all content is visible */}
                                <div className="h-4"></div>
                            </div>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    className="px-5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50" 
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
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditApplicationModal;