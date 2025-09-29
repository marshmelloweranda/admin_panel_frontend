// src/components/EditApplicationModal.js
import React, { useState } from 'react';

const EditApplicationModal = ({ application, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: application.full_name || '',
    email: application.email || '',
    phone: application.phone || '',
    date_of_birth: application.date_of_birth || '',
    gender: application.gender || '',
    blood_group: application.blood_group || '',
    doctor_name: application.doctor_name || '',
    hospital: application.hospital || '',
    issued_date: application.issued_date || '',
    expiry_date: application.expiry_date || '',
    is_fit_to_drive: application.is_fit_to_drive || false,
    vision: application.vision || '',
    hearing: application.hearing || '',
    remarks: application.remarks || '',
    status: application.status || 'pending'
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
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Application</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="modal-body">
            <div className="form-sections">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Doctor Name</label>
                    <input
                      type="text"
                      name="doctor_name"
                      value={formData.doctor_name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hospital</label>
                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Issued Date</label>
                    <input
                      type="date"
                      name="issued_date"
                      value={formData.issued_date}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_fit_to_drive"
                        checked={formData.is_fit_to_drive}
                        onChange={handleChange}
                      />
                      Fit to Drive
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label>Vision</label>
                    <input
                      type="text"
                      name="vision"
                      value={formData.vision}
                      onChange={handleChange}
                      placeholder="e.g., 20/20"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hearing</label>
                    <input
                      type="text"
                      name="hearing"
                      value={formData.hearing}
                      onChange={handleChange}
                      placeholder="e.g., Normal"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Status</h3>
                <div className="form-group">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplicationModal;