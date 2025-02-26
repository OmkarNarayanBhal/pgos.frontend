import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+61', country: 'Australia' },
   
];

const ApplicationModal = ({ application, onClose }) => {
  if (!application) return null;

  const renderDocument = (url, title) => {
    const isPDF = url?.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      return (
        <div className="mb-3">
          <h6>{title}</h6>
          <div className="position-relative">
            <iframe 
              src={`${url}#page=1&view=FitH`}
              title={title}
              className="w-100"
              style={{ height: '400px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}
            />
            <a href={url} target="_blank" rel="noopener noreferrer" 
               className="btn btn-sm btn-primary position-absolute bottom-0 end-0 m-2">
              View Full Size
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3">
        <h6>{title}</h6>
        <div className="position-relative">
          <img src={url} alt={title} className="img-fluid rounded mb-2" />
          <a href={url} target="_blank" rel="noopener noreferrer" 
             className="btn btn-sm btn-primary position-absolute bottom-0 end-0 m-2">
            View Full Size
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Application Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <p><strong>Guest Name:</strong> {application.guest_name}</p>
                <p><strong>Phone Number:</strong> {application.phone_number}</p>
                <p><strong>Room Number:</strong> {application.room_number}</p>
                <p><strong>Room Sharing:</strong> {application.room_sharing_details}</p>
                <p><strong>Email:</strong> {application.email || 'Not provided'}</p>
                <p><strong>Address:</strong> {application.address || 'Not provided'}</p>
                <p><strong>Status:</strong> {application.status}</p>
                <p><strong>Created:</strong> {new Date(application.createdAt).toLocaleString()}</p>
              </div>
              <div className="col-12 col-md-6">
                {application.aadhaar_url && renderDocument(application.aadhaar_url, 'Aadhaar Card')}
                {application.photo_url && renderDocument(application.photo_url, 'Photo')}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [form, setForm] = useState({ 
    guest_name: '', 
    phone_number: '+91',  
    room_number: '', 
    room_sharing_details: '' 
  });
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/applications`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setForm({ guest_name: '', phone_number: '+91', room_number: '', room_sharing_details: '' });
      fetchApplications();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching applications...');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/applications`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Applications fetched:', response.data);
      setApplications(response.data);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.error || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchApplications();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedApplication(data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch application details');
    }
  };

  const filterApplications = (apps) => {
    return apps
      .filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
      })
      .filter(app => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          app.guest_name.toLowerCase().includes(search) ||
          app.phone_number.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        return sortBy === 'newest' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      });
  };

  const renderApplicationDetails = (application) => {
    return (
      <div className="modal-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="fw-bold">Resident Name:</label>
            <p>{application.guest_name}</p>
          </div>
          
          <div className="col-md-6">
            <label className="fw-bold">Phone Number:</label>
            <p>{application.phone_number}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">First Name:</label>
            <p>{application.first_name}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Last Name:</label>
            <p>{application.last_name}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Father's/Guardian's Name:</label>
            <p>{application.father_guardian_name || 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Father's/Guardian's Contact:</label>
            <p>{application.father_guardian_contact || 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Date of Birth:</label>
            <p>{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Blood Group:</label>
            <p>{application.blood_group || 'Not provided'}</p>
          </div>

          <div className="col-12">
            <label className="fw-bold">Email:</label>
            <p>{application.email || 'Not provided'}</p>
          </div>

          <div className="col-12">
            <label className="fw-bold">Permanent Address:</label>
            <p>{application.permanent_address || 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Employment:</label>
            <p>{application.employment || 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">EMP ID:</label>
            <p>{application.emp_id || 'Not provided'}</p>
          </div>

          <div className="col-12">
            <label className="fw-bold">Educational Qualification:</label>
            <p>{application.educational_qualification || 'Not provided'}</p>
          </div>

          <div className="col-12">
            <label className="fw-bold">Office Address:</label>
            <p>{application.office_address || 'Not provided'}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Room Number:</label>
            <p>{application.room_number}</p>
          </div>

          <div className="col-md-6">
            <label className="fw-bold">Room Sharing:</label>
            <p>{application.room_sharing_details}</p>
          </div>

          <div className="col-12">
            <label className="fw-bold">Status:</label>
            <p>
              <span className={`badge bg-${application.status === 'completed' ? 'success' : 'warning'}`}>
                {application.status}
              </span>
            </p>
          </div>

          {application.aadhaar_url && (
            <div className="col-md-6">
              <label className="fw-bold">Aadhaar Document:</label>
              <div>
                <a href={application.aadhaar_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                  <i className="bi bi-file-earmark-text me-1"></i>
                  View Aadhaar
                </a>
              </div>
            </div>
          )}

          {application.photo_url && (
            <div className="col-md-6">
              <label className="fw-bold">Photo:</label>
              <div>
                <a href={application.photo_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                  <i className="bi bi-image me-1"></i>
                  View Photo
                </a>
              </div>
            </div>
          )}

          <div className="col-12">
            <label className="fw-bold">Created At:</label>
            <p>{new Date(application.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 py-3 px-4 bg-white rounded shadow-sm border">
  {/* Left Section - Title & Icon */}
  <div className="d-flex align-items-center">
    <div className="bg-primary rounded-circle p-3 me-3 shadow-sm d-flex justify-content-center align-items-center">
      <i className="bi bi-speedometer2 text-white fs-3"></i>
    </div>
    <div>
      <h2 className="h4 mb-1 fw-bold text-primary">
        <span className="border-bottom border-2 border-primary pb-1">Admin Dashboard</span>
      </h2>
      <p className="text-muted mb-0 small">Welcome back, <strong>Administrator</strong></p>
    </div>
  </div>

  {/* Right Section - Action Buttons */}
  <div className="d-flex gap-3 mt-3 mt-md-0">
     

    {/* Logout */}
    <button
      onClick={handleLogout}
      className="btn btn-sm btn-outline-danger d-flex align-items-center px-3 py-2"
      title="Logout"
      aria-label="Logout"
    >
      <i className="bi bi-box-arrow-right me-2 fs-5"></i>
      Logout
    </button>
  </div>
</div>

      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Add Resident</h5>
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Resident Name</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter name" 
                      value={form.guest_name} 
                      onChange={(e) => setForm({ ...form, guest_name: e.target.value })} 
                      required 
                    />
                  </div>
                  
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Phone Number</label>
                    <div className="input-group">
                      <select 
                        className="form-select flex-shrink-1"
                        style={{ maxWidth: '130px' }}
                        value={selectedCountryCode}
                        onChange={(e) => {
                          setSelectedCountryCode(e.target.value);
                          setForm(prev => ({ 
                            ...prev, 
                            phone_number: e.target.value + prev.phone_number.substring(prev.phone_number.indexOf(' ') + 1 || prev.phone_number.length)
                          }));
                        }}
                      >
                        {countryCodes.map(({ code, country }) => (
                          <option key={code} value={code}>
                            {code} {country}
                          </option>
                        ))}
                      </select>
                      <input 
                        className="form-control" 
                        placeholder="Phone number" 
                        value={form.phone_number.substring(selectedCountryCode.length)} 
                        onChange={(e) => setForm({ 
                          ...form, 
                          phone_number: selectedCountryCode + e.target.value.replace(/[^0-9]/g, '')
                        })} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Room Number</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter room number" 
                      value={form.room_number} 
                      onChange={(e) => setForm({ ...form, room_number: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Room Sharing Details</label>
                    <input 
                      className="form-control" 
                      placeholder="Enter sharing details" 
                      value={form.room_sharing_details} 
                      onChange={(e) => setForm({ ...form, room_sharing_details: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="col-12">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Send OnBoarding form'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Residents</h5>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-8">
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <select 
                      className="form-select w-auto" 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Residents</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <select 
                      className="form-select w-auto" 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Resident</th>
                        <th>Phone</th>
                        <th>Room</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterApplications(applications).map(application => (
                        <tr key={application.id}>
                          <td>{application.id}</td>
                          <td>{application.guest_name}</td>
                          <td>{application.phone_number}</td>
                          <td>{application.room_number}</td>
                          <td>
                            <span className={`badge bg-${application.status === 'completed' ? 'success' : 'warning'}`}>
                              {application.status}
                            </span>
                          </td>
                          <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(application.id)}
                                disabled={isDeleting}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filterApplications(applications).length === 0 && (
                    <div className="text-center py-4 text-muted">
                      No applications found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedApplication && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Resident Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedApplication(null)}></button>
              </div>
              {renderApplicationDetails(selectedApplication)}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApplication(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
