import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const certNo = searchParams.get('certNo');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (certNo) {
      verifyDocument(certNo);
    } else {
      setLoading(false);
    }
  }, [certNo]);

  const verifyDocument = async (number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(number)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, message: 'Could not connect to verification server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container center-vh-container">
      <div className="glass-panel verify-card">
        {loading ? (
          <div className="text-muted">
            <p>🔍 Querying Institutional Document Registry...</p>
          </div>
        ) : !certNo ? (
          <div>
            <AlertTriangle size={56} color="#f59e0b" className="mb-1" />
            <h2 className="mb-1">No Certificate ID Provided</h2>
            <p className="text-muted mb-2">
              Please enter a valid certificate number or scan a valid QR code to verify.
            </p>
            <Link to="/" className="btn btn-outline">Back to Home Search</Link>
          </div>
        ) : result?.valid ? (
          <div>
            <CheckCircle2 size={64} color="#10b981" className="mb-1" />
            <h2 className="text-success mb-1">AUTHENTIC & VALID CERTIFICATE</h2>
            <p className="text-muted mb-2">
              Officially issued and verified by Government Polytechnic Miraj (Mazi Sainik Vasahat Miraj MIDC, Miraj 416-410).
            </p>

            <div className="verify-details-box">
              <div className="details-grid-2">
                <div>
                  <span className="detail-label">CERTIFICATE NO</span>
                  <strong className="text-secondary">{result.certificateNumber}</strong>
                </div>
                <div>
                  <span className="detail-label">ISSUE DATE</span>
                  <strong>{new Date(result.issuedAt).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">STUDENT NAME & ROLL NO</span>
                <strong className="text-white">{result.studentName} ({result.studentRollNo})</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">CLASS & DEPARTMENT</span>
                <span>{result.academicYear} — {result.department}</span>
              </div>
              <div>
                <span className="detail-label">STATED PURPOSE</span>
                <span className="text-accent">{result.purpose}</span>
              </div>
            </div>

            <div className="mb-2">
              <Link to="/" className="btn btn-outline">Verify Another Document</Link>
            </div>
          </div>
        ) : (
          <div>
            <XCircle size={64} color="#ef4444" className="mb-1" />
            <h2 className="text-danger mb-1">INVALID CERTIFICATE</h2>
            <p className="text-muted mb-2">
              {result?.message || 'Document ID was not found in the official college database.'}
            </p>
            <Link to="/" className="btn btn-outline">Try Searching Again</Link>
          </div>
        )}
      </div>
    </div>
  );
}
