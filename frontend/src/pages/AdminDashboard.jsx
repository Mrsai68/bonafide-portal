import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, FileText, History, ExternalLink } from 'lucide-react';

export default function AdminDashboard({ currentUser, token }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'students' | 'history'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [issuedHistory, setIssuedHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, pendingHod: 0, pendingAdmin: 0, totalIssued: 0, totalStudents: 0 });
  const [activeModalReq, setActiveModalReq] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  useEffect(() => {
    fetchPendingRequests();
    fetchStudents();
    fetchIssuedHistory();
    fetchStats();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssuedHistory = async () => {
    try {
      const res = await fetch('/api/admin/issued-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIssuedHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (isApproved) => {
    if (!activeModalReq) return;
    try {
      const res = await fetch(`/api/admin/action/${activeModalReq.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: isApproved, remarks: adminRemarks })
      });

      if (res.ok) {
        setActiveModalReq(null);
        setAdminRemarks('');
        fetchPendingRequests();
        fetchIssuedHistory();
        fetchStats();
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="container">
      {/* Header Banner */}
      <div className="glass-panel section-panel mb-2">
        <h2 className="text-white">Central Office Administration Portal</h2>
        <p className="text-muted">
          Document Issuance, Audit History Archive & Registered Student Directory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <span className="stat-value text-secondary">{stats.totalRequests}</span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-accent">{stats.pendingAdmin}</span>
          <span className="stat-label">Awaiting Central Issue</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-success">{stats.totalIssued}</span>
          <span className="stat-label">Certificates Issued</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-value text-primary">{stats.totalStudents}</span>
          <span className="stat-label">Registered Students</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-nav">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
        >
          <FileText size={16} /> Pending Issuance ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
        >
          <History size={16} /> Issued Documents History ({issuedHistory.length})
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Users size={16} /> Registered Students ({students.length})
        </button>
      </div>

      {/* Tab 1: Pending Requests Table */}
      {activeTab === 'pending' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">HOD-Approved Documents Pending Final Issuance</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Student Name & Roll No</th>
                  <th>Department</th>
                  <th>Certificate Type</th>
                  <th>HOD Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      No HOD-approved certificates currently awaiting central office issuance.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.certificateNumber}</strong></td>
                      <td>{r.student.name} (<code>{r.student.username}</code>)</td>
                      <td>{r.student.department}</td>
                      <td><span className="text-secondary">{r.certificateType.title}</span></td>
                      <td><em className="text-secondary">{r.hodRemarks || 'Approved without remarks'}</em></td>
                      <td>
                        <button 
                          onClick={() => { setActiveModalReq(r); setAdminRemarks(''); }}
                          className="btn btn-success btn-action-sm"
                        >
                          <ShieldCheck size={15} /> Seal & Issue PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Issued Documents History Table */}
      {activeTab === 'history' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">Archive of Issued Institutional Certificates</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Student Name & PRN</th>
                  <th>Certificate Type</th>
                  <th>Stated Purpose</th>
                  <th>Issued Date</th>
                  <th>Verification Key</th>
                </tr>
              </thead>
              <tbody>
                {issuedHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      No issued documents in historical archive yet.
                    </td>
                  </tr>
                ) : (
                  issuedHistory.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.certificateNumber}</strong></td>
                      <td>{h.student.name} (<code>{h.student.username}</code>)</td>
                      <td><span className="text-secondary">{h.certificateType.title}</span></td>
                      <td>{h.purpose}</td>
                      <td>{h.issuedAt ? new Date(h.issuedAt).toLocaleString() : 'N/A'}</td>
                      <td>
                        <a 
                          href={`/verify?certNo=${h.certificateNumber}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="verify-link"
                        >
                          Verify QR <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Registered Students Table */}
      {activeTab === 'students' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">Registered Students Directory</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PRN / Roll No</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Academic Year / Class</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-row">
                      No registered students found.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.username}</code></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.email}</td>
                      <td>{s.department}</td>
                      <td><span className="badge badge-pending">{s.academicYear}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issuance Action Modal */}
      {activeModalReq && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <h3 className="section-title">Final Issuance #{activeModalReq.certificateNumber}</h3>
            <p className="modal-meta">
              Student: <strong>{activeModalReq.student.name}</strong> ({activeModalReq.certificateType.title})
            </p>

            <div className="form-group">
              <label>Admin Remarks / Dispatch Notes</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Enter optional dispatch notes..."
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setActiveModalReq(null)} className="btn btn-outline">Cancel</button>
              <button type="button" onClick={() => handleAction(false)} className="btn btn-danger">
                <X size={16} /> Reject Request
              </button>
              <button type="button" onClick={() => handleAction(true)} className="btn btn-success">
                <Check size={16} /> Issue Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
