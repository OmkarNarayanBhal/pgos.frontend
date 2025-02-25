import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="container">
          <div className="row min-vh-100 align-items-center">
            <div className="col-12 col-md-6 text-center text-md-start">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to PG Management
              </h1>
              <p className="lead mb-4">
                Streamline your PG accommodation management with our comprehensive digital solution. 
                Efficiently handle guest applications, room assignments, and documentation.
              </p>
              <Link 
                to="/admin/login" 
                className="btn btn-primary btn-lg"
              >
                <i className="bi bi-shield-lock me-2"></i>
                Admin Login
              </Link>
            </div>
            <div className="col-12 col-md-6 d-none d-md-block">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                alt="Team collaboration" 
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="features-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Key Features</h2>
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-people-fill display-4 text-primary mb-3"></i>
                  <h3 className="h5">Guest Management</h3>
                  <p className="text-muted">
                    Efficiently handle guest applications and documentation with our digital system.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-house-door-fill display-4 text-primary mb-3"></i>
                  <h3 className="h5">Room Management</h3>
                  <p className="text-muted">
                    Keep track of room assignments and sharing arrangements easily.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-file-earmark-text-fill display-4 text-primary mb-3"></i>
                  <h3 className="h5">Digital Documentation</h3>
                  <p className="text-muted">
                    Securely store and manage all guest documents in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 