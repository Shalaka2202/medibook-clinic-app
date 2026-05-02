import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1>Your Health,<br />Our Priority</h1>
          <p>Book appointments with top specialists in minutes.<br />
          Manage your health journey from one place.</p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-hero btn-hero-white">Find Doctors</Link>
            {!user && <Link to="/register" className="btn btn-hero btn-hero-outline">Get Started</Link>}
            {user?.role === 'patient' && <Link to="/appointments" className="btn btn-hero btn-hero-outline">My Appointments</Link>}
            {user?.role === 'doctor' && <Link to="/doctor-dashboard" className="btn btn-hero btn-hero-outline">My Dashboard</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="btn btn-hero btn-hero-outline">Admin Panel</Link>}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, marginBottom: 12 }}>Why MediBook?</h2>
          <p style={{ color: 'var(--text2)', fontSize: 16 }}>Seamless clinic management for patients, doctors & administrators</p>
        </div>
        <div className="grid-3">
          {[
            { icon: '🗓', title: 'Easy Booking', desc: 'Choose your doctor, pick a date and time slot — done in under 2 minutes.' },
            { icon: '👨‍⚕️', title: 'Expert Doctors', desc: 'Browse specialists across multiple disciplines with full profiles and fees.' },
            { icon: '📋', title: 'Track Everything', desc: 'View appointment history, prescriptions, and notes all in one dashboard.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo Credentials */}
        <div className="card" style={{ marginTop: 48, background: 'var(--accent-light)', border: '1px solid #b7dfc8' }}>
          <h3 style={{ marginBottom: 16, fontSize: 20 }}>🔑 Demo Credentials</h3>
          <div className="grid-3" style={{ gap: 12 }}>
            {[
              { role: 'Patient', email: 'ravi@example.com', pwd: 'patient123' },
              { role: 'Doctor', email: 'priya@clinic.com', pwd: 'doctor123' },
              { role: 'Admin', email: 'admin@clinic.com', pwd: 'admin123' },
            ].map(c => (
              <div key={c.role} style={{ background: 'white', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--accent)' }}>{c.role}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.email}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Password: <code>{c.pwd}</code></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
