import React, { useEffect, useState } from 'react';
import { adminAPI, doctorsAPI, appointmentsAPI } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', email: '', password: '', specialization: '', qualification: '', experience_years: '', fee: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes, apptsRes] = await Promise.all([
        adminAPI.stats(), doctorsAPI.list(), appointmentsAPI.list()
      ]);
      setStats(statsRes.data);
      setDoctors(docsRes.data);
      setAppointments(apptsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminAPI.addDoctor({ ...newDoc, experience_years: Number(newDoc.experience_years), fee: Number(newDoc.fee) });
      setShowAddDoctor(false);
      setNewDoc({ name: '', email: '', password: '', specialization: '', qualification: '', experience_years: '', fee: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add doctor');
    }
  };

  const handleRemoveDoctor = async (userId, name) => {
    if (!window.confirm(`Remove Dr. ${name}? This will also delete their appointments.`)) return;
    try {
      await adminAPI.removeDoctor(userId);
      load();
    } catch (err) {
      alert('Failed to remove doctor');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="container page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1>Admin Panel</h1>
          <p>Clinic overview and management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddDoctor(true)}>+ Add Doctor</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Patients', value: stats.totalPatients, icon: '👥' },
            { label: 'Total Doctors', value: stats.totalDoctors, icon: '👨‍⚕️' },
            { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅' },
            { label: 'Pending', value: stats.pendingAppointments, icon: '⏳' },
            { label: 'Confirmed', value: stats.confirmedAppointments, icon: '✅' },
            { label: 'Completed', value: stats.completedAppointments, icon: '🏁' },
            { label: 'Total Appointments', value: stats.totalAppointments, icon: '📋' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        {['overview', 'doctors', 'appointments'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'doctors' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Specialization</th><th>Email</th><th>Exp</th><th>Fee</th><th>Action</th></tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500 }}>{doc.name}</td>
                  <td><span className="badge badge-confirmed">{doc.specialization}</span></td>
                  <td style={{ fontSize: 13 }}>{doc.email}</td>
                  <td>{doc.experience_years} yrs</td>
                  <td>₹{doc.fee}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveDoctor(doc.id, doc.name)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.patient_name}</td>
                  <td>{appt.doctor_name}</td>
                  <td style={{ fontSize: 13, color: 'var(--text2)' }}>{appt.specialization}</td>
                  <td>{appt.appointment_date}</td>
                  <td>{appt.time_slot}</td>
                  <td><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>Recent Appointments</h3>
            {appointments.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{a.patient_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>→ {a.doctor_name}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13 }}>
                  <div>{a.appointment_date}</div>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>Doctor Performance</h3>
            {doctors.map(doc => {
              const docAppts = appointments.filter(a => a.doctor_name === doc.name);
              const completed = docAppts.filter(a => a.status === 'completed').length;
              return (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{doc.specialization}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13 }}>
                    <div>{docAppts.length} total</div>
                    <div style={{ color: 'var(--accent)', fontSize: 12 }}>{completed} completed</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="modal-overlay" onClick={() => setShowAddDoctor(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Doctor</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddDoctor(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAddDoctor}>
              {[
                ['name', 'Full Name', 'text', 'Dr. Priya Sharma'],
                ['email', 'Email', 'email', 'doctor@clinic.com'],
                ['password', 'Password', 'password', 'Min 6 characters'],
                ['specialization', 'Specialization', 'text', 'Cardiology'],
                ['qualification', 'Qualification', 'text', 'MD, DM Cardiology'],
                ['experience_years', 'Experience (years)', 'number', '5'],
                ['fee', 'Consultation Fee (₹)', 'number', '500'],
              ].map(([field, label, type, ph]) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={ph}
                    value={newDoc[field]} onChange={e => setNewDoc({...newDoc, [field]: e.target.value})}
                    required={['name','email','password','specialization'].includes(field)} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddDoctor(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
