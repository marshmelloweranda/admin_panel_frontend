// src/components/ViewApplicationModal.js
import React from 'react';

const ViewApplicationModal = ({ application, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Application Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-row">
                <label>Application ID:</label>
                <span>{application.application_id}</span>
              </div>
              <div className="detail-row">
                <label>Medical Certificate ID:</label>
                <span>{application.medical_certificate_id}</span>
              </div>
              <div className="detail-row">
                <label>Full Name:</label>
                <span>{application.full_name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{application.email}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{application.phone}</span>
              </div>
              <div className="detail-row">
                <label>Date of Birth:</label>
                <span>{application.date_of_birth}</span>
              </div>
              <div className="detail-row">
                <label>Gender:</label>
                <span>{application.gender}</span>
              </div>
              <div className="detail-row">
                <label>Blood Group:</label>
                <span>{application.blood_group}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Medical Information</h3>
              <div className="detail-row">
                <label>Doctor Name:</label>
                <span>{application.doctor_name}</span>
              </div>
              <div className="detail-row">
                <label>Hospital:</label>
                <span>{application.hospital}</span>
              </div>
              <div className="detail-row">
                <label>Issued Date:</label>
                <span>{application.issued_date}</span>
              </div>
              <div className="detail-row">
                <label>Expiry Date:</label>
                <span>{application.expiry_date}</span>
              </div>
              <div className="detail-row">
                <label>Fit to Drive:</label>
                <span>{application.is_fit_to_drive ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-row">
                <label>Vision:</label>
                <span>{application.vision}</span>
              </div>
              <div className="detail-row">
                <label>Hearing:</label>
                <span>{application.hearing}</span>
              </div>
              <div className="detail-row">
                <label>Remarks:</label>
                <span>{application.remarks}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Test Results</h3>
              {application.written_test && (
                <div className="test-results">
                  <h4>Written Test</h4>
                  <div className="detail-row">
                    <label>Score:</label>
                    <span>{application.written_test.score}</span>
                  </div>
                  <div className="detail-row">
                    <label>Passed:</label>
                    <span>{application.written_test.passed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}
              
              {application.practical_test && (
                <div className="test-results">
                  <h4>Practical Test</h4>
                  <div className="detail-row">
                    <label>Score:</label>
                    <span>{application.practical_test.score}</span>
                  </div>
                  <div className="detail-row">
                    <label>Passed:</label>
                    <span>{application.practical_test.passed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Categories & Payment</h3>
              {application.selected_categories && (
                <div className="categories">
                  <h4>Selected Categories:</h4>
                  {application.selected_categories.map((cat, index) => (
                    <div key={index} className="category-tag">
                      {cat.code} - {cat.label}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="detail-row">
                <label>Total Amount:</label>
                <span>${application.total_amount}</span>
              </div>
              <div className="detail-row">
                <label>Payment Reference:</label>
                <span>{application.payment_reference_id}</span>
              </div>
              <div className="detail-row">
                <label>Transaction ID:</label>
                <span>{application.payment_transaction_id}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>System Information</h3>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge status-${application.status}`}>
                  {application.status}
                </span>
              </div>
              <div className="detail-row">
                <label>Created:</label>
                <span>{new Date(application.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>Updated:</label>
                <span>{new Date(application.updated_at).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>User Sub:</label>
                <span className="sub-id">{application.sub}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;