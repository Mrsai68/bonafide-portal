import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import HodDashboard from './pages/HodDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Verify from './pages/Verify';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  };

  return (
    <Router>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/student" 
          element={
            currentUser && currentUser.roles.includes('ROLE_STUDENT') ? (
              <StudentDashboard currentUser={currentUser} token={token} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/hod" 
          element={
            currentUser && currentUser.roles.includes('ROLE_HOD') ? (
              <HodDashboard currentUser={currentUser} token={token} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/admin" 
          element={
            currentUser && currentUser.roles.includes('ROLE_ADMIN') ? (
              <AdminDashboard currentUser={currentUser} token={token} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <footer>
        <p>&copy; 2026 Government Polytechnic Miraj (Mazi Sainik Vasahat Miraj MIDC, Miraj 416-410) — Diploma Computer Engineering Internship Project</p>
      </footer>
    </Router>
  );
}
