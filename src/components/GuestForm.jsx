import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { compressImage } from '../utils/imageCompression';

const GuestForm = () => {
  const [application, setApplication] = useState(null);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image or PDF.');
      }

      // Compress image if it's not a PDF
      const processedFile = file.type !== 'application/pdf' 
        ? await compressImage(file)
        : file;

      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        setPreviews(prev => ({
          ...prev,
          [type]: URL.createObjectURL(processedFile)
        }));
      }

      // Update form data
      if (type === 'aadhaar') {
        setAadhaar(processedFile);
      } else {
        setPhoto(processedFile);
      }

    } catch (error) {
      setError(error.message);
    }
  };

  // Add preview component
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
            // Clean up the URL object
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
        const token = new URLSearchParams(location.search).get('token');
        if (!token) {
            throw new Error('No token found in URL');
        }

        
        if (!aadhaar || !photo) {
            throw new Error('Both Aadhaar and photo files are required');
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('address', address);
        formData.append('aadhaar', aadhaar);
        formData.append('photo', photo);

        console.log('Submitting form with data:', {
            token,
            email,
            address,
            aadhaarFile: aadhaar.name,
            photoFile: photo.name
        });

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/applications/guest/${token}`, 
            formData,
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
        if (error.response?.data?.error === 'Invalid or expired link') {
            setIsExpired(true);
        }
        setError(error.response?.data?.error || error.message || 'An error occurred');
    } finally {
        setIsSubmitting(false);
    }
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
              <h2 className="card-title text-center mb-4">Complete Your Application</h2>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Name:</label>
                <p className="mb-0">{application.guest_name}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Phone:</label>
                <p className="mb-0">{application.phone_number.replace(/(\+\d{1,3})(\d{10})/, '$1 $2')}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Room Number:</label>
                <p className="mb-0">{application.room_number}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Room Sharing:</label>
                <p className="mb-0">{application.room_sharing_details}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Address:</label>
                <textarea 
                  className="form-control" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  rows="3"
                  required 
                />
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
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuestForm;