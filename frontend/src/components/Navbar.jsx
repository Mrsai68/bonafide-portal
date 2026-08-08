import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, LogOut, Home } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  let dashboardPath = '/student';
  if (currentUser?.roles.includes('ROLE_ADMIN')) dashboardPath = '/admin';
  else if (currentUser?.roles.includes('ROLE_HOD')) dashboardPath = '/hod';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Award size={28} color="#06b6d4" />
        <span>GPM Certificate Portal</span>
      </Link>

      <div className="nav-links">
        <Link to="/" className="btn btn-outline btn-sm">
          <Home size={16} /> Home
        </Link>

        {currentUser ? (
          <>
            <Link to={dashboardPath} className="btn btn-outline">Dashboard</Link>
            <span className="user-greeting">
              Hi, <strong>{currentUser.name}</strong>
            </span>
            <button onClick={() => { onLogout(); navigate('/login'); }} className="btn btn-outline btn-sm">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="btn btn-outline">Student Register</Link>
            <Link to="/login" className="btn btn-primary">Login / Portal Access</Link>
          </>
        )}
      </div>
    </nav>
  );
}
