import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, FileText, History, ExternalLink } from 'lucide-react';

export default function HodDashboard({ currentUser, token }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history' | 'students'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedHistory, setApprovedHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeModalReq, setActiveModalReq] = useState(null);
  const [hodRemarks, setHodRemarks] = useState('');

  useEffect(() => {
    fetchPendingRequests();
    fetchApprovedHistory();
    fetchStudents();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/hod/pending', {
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

  const fetchApprovedHistory = async () => {
    try {
      const res = await fetch('/api/hod/approved-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApprovedHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/hod/students', {
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

  const handleAction = async (isApproved) => {
    if (!activeModalReq) return;
    try {
      const res = await fetch(`/api/hod/action/${activeModalReq.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: isApproved, remarks: hodRemarks })
      });

      if (res.ok) {
        setActiveModalReq(null);
        setHodRemarks('');
        fetchPendingRequests();
        fetchApprovedHistory();
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
        <h2 className="text-white">Department HOD Portal</h2>
        <p className="text-muted">
          Head of Department — <strong>{currentUser?.department}</strong>
        </p>
        <div className="header-note">
          ⚡ <em>Note: <strong>Bonafide Certificates</strong> are issued directly upon HOD approval (1-Step). Other documents (NOC, Character, Fee) require Central Office signature (2-Step).</em>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-nav">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
        >
          <FileText size={16} /> Pending Requests ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
        >
          <History size={16} /> Approved Documents ({approvedHistory.length})
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Users size={16} /> Department Students ({students.length})
        </button>
      </div>

      {/* Tab 1: Pending Department Applications Queue */}
      {activeTab === 'pending' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">Pending Student Applications</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Student Name & Roll No</th>
                  <th>Certificate Type</th>
                  <th>Approval Process</th>
                  <th>Purpose</th>
                  <th>Requested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-row">
                      No pending certificate applications in your department queue.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((r) => {
                    const isBonafide = r.certificateType.title.toLowerCase().includes('bonafide');
                    return (
                      <tr key={r.id}>
                        <td><strong>{r.certificateNumber}</strong></td>
                        <td>{r.student.name} (<code>{r.student.username}</code>)</td>
                        <td><span className="text-secondary">{r.certificateType.title}</span></td>
                        <td>
                          {isBonafide ? (
                            <span className="badge-bonafide-step">⚡ 1-Step Direct Issue</span>
                          ) : (
                            <span className="badge-admin-step">🔄 2-Step (Requires Admin)</span>
                          )}
                        </td>
                        <td>{r.purpose}</td>
                        <td>{new Date(r.requestedAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => { setActiveModalReq(r); setHodRemarks(''); }}
                            className="btn btn-primary btn-action-sm"
                          >
                            <ShieldCheck size={15} /> Review & Action
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Approved Documents Archive */}
      {activeTab === 'history' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">Department Approved & Issued Documents</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Student Name & Roll No</th>
                  <th>Certificate Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      No approved or issued documents recorded for your department yet.
                    </td>
                  </tr>
                ) : (
                  approvedHistory.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.certificateNumber}</strong></td>
                      <td>{h.student.name} (<code>{h.student.username}</code>)</td>
                      <td><span className="text-secondary">{h.certificateType.title}</span></td>
                      <td>{h.purpose}</td>
                      <td>
                        {h.status === 'ISSUED_BY_ADMIN' ? (
                          <span className="badge badge-issued">Issued & Active</span>
                        ) : (
                          <span className="badge badge-pending">Forwarded to Central Admin</span>
                        )}
                      </td>
                      <td>
                        {h.status === 'ISSUED_BY_ADMIN' && (
                          <a 
                            href={`/verify?certNo=${h.certificateNumber}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="verify-link"
                          >
                            Verify <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Department Registered Students Directory */}
      {activeTab === 'students' && (
        <div className="glass-panel section-panel">
          <h3 className="section-title">{currentUser?.department} — Registered Students</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PRN / Roll No</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Academic Year / Class</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty-row">
                      No registered students found in {currentUser?.department}.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.username}</code></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.email}</td>
                      <td><span className="badge badge-pending">{s.academicYear}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {activeModalReq && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <h3 className="section-title">Process Application #{activeModalReq.certificateNumber}</h3>
            <p className="modal-meta">
              Student: <strong>{activeModalReq.student.name}</strong> ({activeModalReq.certificateType.title})
            </p>

            <div className="form-group">
              <label>HOD Remarks / Comments</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Enter optional approval comments or rejection reason..."
                value={hodRemarks}
                onChange={(e) => setHodRemarks(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setActiveModalReq(null)} className="btn btn-outline">Cancel</button>
              <button type="button" onClick={() => handleAction(false)} className="btn btn-danger">
                <X size={16} /> Reject Request
              </button>
              <button type="button" onClick={() => handleAction(true)} className="btn btn-success">
                <Check size={16} /> {activeModalReq.certificateType.title.toLowerCase().includes('bonafide') ? 'Direct Approve & Issue PDF' : 'Approve & Forward to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
