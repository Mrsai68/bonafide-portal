import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    department: '',
    academicYear: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Error: Passwords do not match!', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          department: formData.department,
          academicYear: formData.academicYear,
          password: formData.password,
          role: 'STUDENT'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ text: 'Success! Account created. Redirecting to login page...', type: 'success' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Registration failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error connecting to backend.', type: 'error' });
    }
  };

  return (
    <div className="container center-container">
      <div className="glass-panel auth-card-lg">
        <h2 className="auth-title">Student Registration</h2>
        <p className="auth-subtitle">
          Create your student account to apply for institutional certificates
        </p>

        {message.text && (
          <div className={message.type === 'success' ? 'alert-box-success' : 'alert-box-danger'}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" id="name" className="form-control" placeholder="e.g. Neha Verma" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>PRN / Roll Number</label>
              <input type="text" id="username" className="form-control" placeholder="e.g. roll102" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" id="email" className="form-control" placeholder="neha@student.gpmiraj.ac.in" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select id="department" className="form-control" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Polymer Technology">Polymer Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Medical Electronics">Medical Electronics</option>
            </select>
          </div>

          <div className="form-group">
            <label>Academic Year</label>
            <select id="academicYear" className="form-control" value={formData.academicYear} onChange={handleChange} required>
              <option value="">Select Class / Year</option>
              <option value="Third Year Diploma">Third Year Diploma</option>
              <option value="Second Year Diploma">Second Year Diploma</option>
              <option value="First Year Diploma">First Year Diploma</option>
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Password</label>
              <input type="password" id="password" className="form-control" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" id="confirmPassword" className="form-control" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            <UserPlus size={18} /> Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-footer-link">Sign In Here</Link>
        </div>
      </div>
    </div>
  );
}
