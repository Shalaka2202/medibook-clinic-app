import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          ✦ <span>Medi</span>Book
        </Link>
        <div className="navbar-links">
          <NavLink to="/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Find Doctors
          </NavLink>

          {!user && <>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Login
            </NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>}

          {user?.role === 'patient' && <>
            <NavLink to="/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Appointments
            </NavLink>
          </>}

          {user?.role === 'doctor' && <>
            <NavLink to="/doctor-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </>}

          {user?.role === 'admin' && <>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          </>}

          {user && <>
            <span style={{ fontSize: 13, color: 'var(--text2)', padding: '0 8px' }}>
              Hi, {user.name.split(' ')[0]}
              <span className="nav-badge">{user.role}</span>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </>}
        </div>
      </div>
    </nav>
  );
}
