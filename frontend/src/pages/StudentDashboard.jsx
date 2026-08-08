import React, { useState, useEffect } from 'react';
import { Download, FilePlus } from 'lucide-react';

export default function StudentDashboard({ currentUser, token }) {
  const [requests, setRequests] = useState([]);
  const [certTypes, setCertTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    fetchMyRequests();
    fetchCertTypes();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/student/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCertTypes = async () => {
    try {
      const res = await fetch('/api/student/certificate-types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertTypes(data);
        if (data.length > 0) setSelectedTypeId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateTypeId: selectedTypeId, purpose })
      });

      if (res.ok) {
        setShowModal(false);
        setPurpose('');
        fetchMyRequests();
      } else {
        alert('Failed to submit application.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  const handleDownload = async (id, certNum) => {
    try {
      const res = await fetch(`/api/student/download/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${certNum}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Could not download PDF.');
      }
    } catch (err) {
      alert('Download error.');
    }
  };

  return (
    <div className="container">
      {/* Header Profile Banner */}
      <div className="glass-panel header-banner">
        <div>
          <h2 className="text-white">Student Portal</h2>
          <p className="text-muted">
            {currentUser?.academicYear} | Roll No: <strong>{currentUser?.username}</strong> | Dept: {currentUser?.department}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <FilePlus size={18} /> Request New Certificate
        </button>
      </div>de

      {/* Applications List */}
      <div className="glass-panel section-panel">
        <h3 className="section-title">My Certificate Requests</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ref Number</th>
                <th>Certificate Type</th>
                <th>Purpose</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-row">
                    No certificate applications submitted yet. Click "+ Request New Certificate" to apply.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  let badgeClass = 'badge-pending';
                  let statusText = 'Pending HOD Approval';
                  if (r.status === 'APPROVED_BY_HOD') { badgeClass = 'badge-pending'; statusText = 'HOD Approved (Pending Central Office)'; }
                  if (r.status === 'ISSUED_BY_ADMIN') { badgeClass = 'badge-issued'; statusText = 'Issued & Ready'; }
                  if (r.status.startsWith('REJECTED')) { badgeClass = 'badge-rejected'; statusText = 'Rejected'; }

                  return (
                    <tr key={r.id}>
                      <td><strong>{r.certificateNumber}</strong></td>
                      <td>{r.certificateType.title}</td>
                      <td>{r.purpose}</td>
                      <td>{new Date(r.requestedAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${badgeClass}`}>{statusText}</span></td>
                      <td>
                        {r.status === 'ISSUED_BY_ADMIN' ? (
                          <button onClick={() => handleDownload(r.id, r.certificateNumber)} className="btn btn-primary btn-action-sm">
                            <Download size={14} /> Download PDF
                          </button>
                        ) : r.status.startsWith('REJECTED') ? (
                          <span className="text-danger">{r.hodRemarks || r.adminRemarks || 'Rejected'}</span>
                        ) : (
                          <span className="text-muted">In Process</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <h3 className="section-title">Apply for Certificate</h3>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label>Certificate Type</label>
                <select className="form-control" value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} required>
                  {certTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Purpose / Reason</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="e.g. Bus Concession Pass / Internship NOC / Bank Loan Application" 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
