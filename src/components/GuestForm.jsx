import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { compressImage } from '../utils/imageCompression';
import TermsAndConditions from './TermsAndConditions';
import taraHeader from '../assets/tara_header.jpg';

const GuestForm = () => {
  const [application, setApplication] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    father_guardian_name: '',
    father_guardian_contact: '',
    date_of_birth: '',
    blood_group: '',
    permanent_address: '',
    employment: '',
    emp_id: '',
    educational_qualification: '',
    office_address: ''
  });
  const [aadhaar, setAadhaar] = useState(null);
  const [photo, setPhoto] = useState(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const [previews, setPreviews] = useState({
    aadhaar: null,
    photo: null
  });
  
  const cameraRefs = {
    aadhaar: useRef(null),
    photo: useRef(null)
  };

  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setError('Invalid URL: No token provided');
      setIsLoading(false);
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_URL}/applications/guest/${token}`;
    console.log('Fetching application from:', apiUrl);

    axios.get(apiUrl)
      .then(({ data }) => {
        console.log('Application data received:', data);
        if (data.token_used) {
          setIsExpired(true);
          setError('This link has already been used');
        } else {
          setApplication(data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error details:', error.response || error);
        if (error.response?.data?.error === 'Invalid or expired link') {
          setIsExpired(true);
        }
        setError(error.response?.data?.error || 'Failed to load application');
        setIsLoading(false);
      });
  }, [location]);

  const handleFileChange = async (e, type) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

       
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image or PDF.');
      }

     
      const processedFile = file.type !== 'application/pdf' 
        ? await compressImage(file)
        : file;

    
      if (file.type.startsWith('image/')) {
        setPreviews(prev => ({
          ...prev,
          [type]: URL.createObjectURL(processedFile)
        }));
      }

      
      if (type === 'aadhaar') {
        setAadhaar(processedFile);
      } else {
        setPhoto(processedFile);
      }

    } catch (error) {
      setError(error.message);
    }
  };

   
  const FilePreview = ({ type }) => {
    const preview = previews[type];
    const file = type === 'aadhaar' ? aadhaar : photo;
    
    if (!preview && !file) return null;

    // For PDFs
    if (file?.type === 'application/pdf') {
      return (
        <div className="mt-2 position-relative">
          <div className="alert alert-success py-2 px-3 mb-0">
            <i className="bi bi-file-pdf me-2"></i>
            PDF file selected
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
            onClick={() => {
              setPreviews(prev => ({ ...prev, [type]: null }));
              if (type === 'aadhaar') {
                setAadhaar(null);
              } else {
                setPhoto(null);
              }
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      );
    }

    // For images
    return (
      <div className="mt-2 position-relative">
        <img 
          src={preview} 
          alt={`${type} preview`} 
          className="img-fluid rounded" 
          style={{ 
            maxHeight: '200px',
            width: '100%',
            objectFit: 'contain',
            backgroundColor: '#f8f9fa'
          }}
        />
        <button
          type="button"
          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
          onClick={() => {
            setPreviews(prev => ({ ...prev, [type]: null }));
            if (type === 'aadhaar') {
              setAadhaar(null);
            } else {
              setPhoto(null);
            }
             
            if (preview) {
              URL.revokeObjectURL(preview);
            }
          }}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = new URLSearchParams(location.search).get('token');
      if (!token) {
        throw new Error('No token found in URL');
      }

      if (!formData.first_name || !formData.last_name || !formData.permanent_address || !formData.date_of_birth) {
        throw new Error('Please fill in all required fields');
      }

      if (!aadhaar || !photo) {
        throw new Error('Both Aadhaar and photo files are required');
      }

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      submitData.append('aadhaar', aadhaar);
      submitData.append('photo', photo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/applications/guest/${token}`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Form submission response:', response.data);
      setIsExpired(true);
      alert('Application submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.error || error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowTerms = () => {
    setShowTerms(true);
  };

  if (isExpired) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          This link has expired or already been used. Please contact the administrator for a new link.
        </div>
      </div>
    );
  }

  if (!application) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body">
            <div className="text-center mb-4">
                <img 
                  src={taraHeader} 
                  alt="TARA CO-LIVING PG" 
                  className="img-fluid"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '5px'
                  }}
                />
               
              </div>

              {/* <div className="row g-3 mb-3">
                <div className="col-12 col-md-4 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">Name:</label>
                  <p className="mb-0">{application?.guest_name}</p>
                </div>
                
                <div className="col-12 col-md-4 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">Room Number:</label>
                  <p className="mb-0">{application?.room_number}</p>
                </div>
                
                <div className="col-12 col-md-4 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">Room Sharing:</label>
                  <p className="mb-0">{application?.room_sharing_details}</p>
                </div>
              </div> */}

              <h5 className="mb-3">Registration form</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input 
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Father's/Guardian's Name</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="father_guardian_name"
                    value={formData.father_guardian_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Father's/Guardian's Contact</label>
                  <input 
                    type="tel"
                    className="form-control"
                    name="father_guardian_contact"
                    value={formData.father_guardian_contact}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date of Birth *</label>
                  <input 
                    type="date"
                    className="form-control"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Blood Group</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Permanent Address *</label>
                  <textarea 
                    className="form-control"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Employment</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="employment"
                    value={formData.employment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">EMP ID NO</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Educational Qualification</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="educational_qualification"
                    value={formData.educational_qualification}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Office Address</label>
                  <textarea 
                    className="form-control"
                    name="office_address"
                    value={formData.office_address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Aadhaar Upload:</label>
                <div className="d-flex flex-column gap-2">
                  <div className="btn-group w-100">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'aadhaar')}
                      id="aadhaarFileInput"
                      style={{ display: 'none' }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture
                      onChange={(e) => handleFileChange(e, 'aadhaar')}
                      id="aadhaarCameraInput"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => document.getElementById('aadhaarFileInput').click()}
                    >
                      <i className="bi bi-file-earmark-arrow-up"></i>
                      <span className="d-none d-md-inline ms-1">Choose File</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => document.getElementById('aadhaarCameraInput').click()}
                    >
                      <i className="bi bi-camera"></i>
                      <span className="d-none d-md-inline ms-1">Use Camera</span>
                    </button>
                  </div>
                  <FilePreview type="aadhaar" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Photo Upload:</label>
                <div className="d-flex flex-column gap-2">
                  <div className="btn-group w-100">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photo')}
                      id="photoFileInput"
                      style={{ display: 'none' }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture
                      onChange={(e) => handleFileChange(e, 'photo')}
                      id="photoCameraInput"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => document.getElementById('photoFileInput').click()}
                    >
                      <i className="bi bi-file-earmark-arrow-up"></i>
                      <span className="d-none d-md-inline ms-1">Choose File</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => document.getElementById('photoCameraInput').click()}
                    >
                      <i className="bi bi-camera"></i>
                      <span className="d-none d-md-inline ms-1">Use Camera</span>
                    </button>
                  </div>
                  <FilePreview type="photo" />
                </div>
              </div>

              {isLoading && (
                <div className="alert alert-info py-2 mb-3">Processing file...</div>
              )}
              
              {error && (
                <div className="alert alert-danger py-2 mb-3">{error}</div>
              )}
              <button 
                    type="button" 
                    className="btn btn-link p-0 d-inline text-decoration-underline"
                    onClick={handleShowTerms}
                  >
                    Terms and Conditions
                  </button>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="acceptTerms">
                  I have read and agree to the{' '}
                  
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting || !acceptedTerms}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showTerms && (
        <TermsAndConditions onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};

export default GuestForm;
