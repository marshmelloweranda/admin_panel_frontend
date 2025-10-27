import React from 'react';
import DetailRow from '../common/DetailRow';
import { formatID, getStatusBadgeClass, formatDate } from '../../utils/helpers';

const ViewApplicationModal = ({ application, onClose }) => {
    if (!application) return null;

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

export default ViewApplicationModal;