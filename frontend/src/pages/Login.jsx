import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, KeyRound, Mail, ShieldCheck } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Forgot Password 2-Step OTP Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ text: '', type: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid username or password');
        return;
      }

      onLoginSuccess(data.token, data);

      if (data.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (data.roles.includes('ROLE_HOD')) {
        navigate('/hod');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError('Network error connecting to backend.');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotMsg({ text: data.message || 'OTP sent to registered email address.', type: 'success' });
        setOtpStep(2);
      } else {
        setForgotMsg({ text: data.message || 'Failed to send OTP.', type: 'error' });
      }
    } catch (err) {
      setForgotMsg({ text: 'Network error connecting to backend.', type: 'error' });
    }
  };

  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setForgotMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: enteredOtp, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotMsg({ text: data.message || 'Password reset successfully!', type: 'success' });
        setTimeout(() => {
          setShowForgotModal(false);
          setOtpStep(1);
          setForgotEmail('');
          setEnteredOtp('');
          setNewPassword('');
          setForgotMsg({ text: '', type: '' });
        }, 2000);
      } else {
        setForgotMsg({ text: data.message || 'Password reset failed.', type: 'error' });
      }
    } catch (err) {
      setForgotMsg({ text: 'Network error connecting to backend.', type: 'error' });
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setOtpStep(1);
    setForgotMsg({ text: '', type: '' });
  };

  return (
    <div className="container center-container">
      <div className="glass-panel auth-card">
        <h2 className="auth-title">Portal Sign In</h2>
        <p className="auth-subtitle">
          Access Student, HOD, or Central Office Admin Portal
        </p>

        {error && (
          <div className="alert-box-danger">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>PRN / Roll No / Staff Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. roll101, hod_comp, or admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label>Password</label>
              <button 
                type="button" 
                onClick={openForgotModal} 
                className="forgot-btn"
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have a student account? <Link to="/register" className="auth-footer-link">Register Here</Link>
        </div>
      </div>

      {/* 2-Step OTP Password Reset Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card-sm">
            <h3 className="modal-title">
              <KeyRound size={20} color="var(--secondary)" /> OTP Password Reset
            </h3>
            <p className="modal-subtitle">
              {otpStep === 1 ? 'Step 1: Enter registered email to receive OTP.' : 'Step 2: Enter OTP & set new password.'}
            </p>

            {forgotMsg.text && (
              <div className={forgotMsg.type === 'success' ? 'alert-box-success' : 'alert-box-danger'}>
                {forgotMsg.text}
              </div>
            )}

            {otpStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label>Registered Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="e.g. aarav.sharma@student.gpmiraj.ac.in" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-outline">Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <Mail size={16} /> Send OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetWithOtp}>
                <div className="form-group">
                  <label>6-Digit Verification OTP</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter 6-digit OTP..." 
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    maxLength="6"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter new password..." 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setOtpStep(1)} className="btn btn-outline">Back</button>
                  <button type="submit" className="btn btn-success">
                    <ShieldCheck size={16} /> Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
