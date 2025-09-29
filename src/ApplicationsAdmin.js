// src/components/ApplicationsAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ViewApplicationModal from './components/ViewApplicationModal';
import './components/ApplicationsAdmin.css';
import EditApplicationModal from './components/EditApplicationModal';

const ApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`${API_BASE_URL}/applications?${params}`);
      setApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/stats/summary`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset to page 1 when filters change
    }));
  };

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        status: newStatus
      });
      
      // Refresh data
      fetchApplications();
      fetchStats();
      
      alert('Status updated successfully!');
    } catch (err) {
      alert('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const handleUpdateApplication = async (updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/applications/${selectedApplication.id}`, updatedData);
      
      // Refresh data
      fetchApplications();
      setShowEditModal(false);
      
      alert('Application updated successfully!');
    } catch (err) {
      alert('Failed to update application');
      console.error('Error updating application:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      case 'submitted': return 'status-submitted';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  if (loading && applications.length === 0) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="applications-admin">
      <div className="admin-header">
        <h1>Applications Admin Panel</h1>
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total</h3>
            <span className="stat-number">{stats.total || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <span className="stat-number">{stats.byStatus?.pending || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <span className="stat-number">{stats.byStatus?.approved || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <span className="stat-number">{stats.byStatus?.rejected || 0}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Sort by Date</option>
            <option value="full_name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="application_id">Sort by App ID</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="filter-select"
          >
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table-container">
        {error && <div className="error-message">{error}</div>}
        
        <table className="applications-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <div className="app-id">{application.application_id}</div>
                  {application.medical_certificate_id && (
                    <div className="medical-id">Med: {application.medical_certificate_id}</div>
                  )}
                </td>
                <td>{application.full_name}</td>
                <td>{application.email}</td>
                <td>{application.phone}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                    {application.status}
                  </span>
                </td>
                <td>{new Date(application.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleView(application)}
                      className="btn-view"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEdit(application)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                      className="status-select"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && !loading && (
          <div className="no-data">No applications found</div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => handleFilterChange('page', filters.page - 1)}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            disabled={!pagination.hasNext}
            onClick={() => handleFilterChange('page', filters.page + 1)}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedApplication && (
        <ViewApplicationModal
          application={selectedApplication}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedApplication && (
        <EditApplicationModal
          application={selectedApplication}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateApplication}
        />
      )}
    </div>
  );
};

export default ApplicationsAdmin;