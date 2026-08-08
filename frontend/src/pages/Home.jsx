import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
  const [certNo, setCertNo] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certNo.trim()) return;
    navigate(`/verify?certNo=${encodeURIComponent(certNo.trim())}`);
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Institutional Bonafide & <br />
          <span className="gradient-text">
            Certificate Management Portal
          </span>
        </h1>
        <p>Automated workflow for Student Applications, Single Faculty/HOD Admin Approvals, and Instant QR Code Document Verification.</p>

        <div className="glass-panel home-verify-box">
          <h3 className="section-title">Instant Certificate Verification</h3>
          <p className="home-verify-subtitle">
            Enter a Certificate Number (e.g. CERT-2026-X8F91A) to check authenticity online.
          </p>
          <form onSubmit={handleVerify} className="form-flex">
            <input 
              type="text" 
              className="form-control form-flex-1" 
              placeholder="Enter Certificate Number..." 
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Search size={18} /> Verify Now
            </button>
          </form>
        </div>
      </section>

      <section className="stats-grid">
        <div className="glass-panel stat-card">
          <span className="stat-value text-secondary">100%</span>
          <span className="stat-label">Paperless System</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-primary">Single</span>
          <span className="stat-label">Faculty/HOD Admin Panel</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-success">Instant</span>
          <span className="stat-label">QR Verification</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-accent">PDF</span>
          <span className="stat-label">Signed Downloads</span>
        </div>
      </section>
    </div>
  );
}
