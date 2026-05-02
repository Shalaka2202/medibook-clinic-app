import React, { useEffect, useState } from 'react';
import { appointmentsAPI } from '../api';

const STATUS_COLORS = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalAppt, setModalAppt] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const load = () => {
    appointmentsAPI.list().then(res => setAppointments(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await appointmentsAPI.update(id, { status, ...extra });
      setModalAppt(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const openModal = (appt) => {
    setModalAppt(appt);
    setPrescription(appt.prescription || '');
    setNotes(appt.notes || '');
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today && a.status !== 'cancelled');
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage your appointments and patient records</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Today's Appointments", value: todayAppts.length, icon: '📅' },
          { label: 'Pending Review', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳' },
          { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅' },
          { label: 'Total Patients', value: new Set(appointments.map(a => a.patient_id)).size, icon: '👥' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="tabs">
        {['all', 'pending', 'confirmed', 'completed'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓</div>
          <h3>No appointments</h3>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr key={appt.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{appt.patient_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{appt.patient_phone}</div>
                  </td>
                  <td>
                    <div>{appt.appointment_date}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{appt.time_slot}</div>
                  </td>
                  <td style={{ maxWidth: 180, fontSize: 13, color: 'var(--text2)' }}>
                    {appt.symptoms || '—'}
                  </td>
                  <td><span className={`badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {appt.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(appt.id, 'confirmed')}>Confirm</button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button className="btn btn-outline btn-sm" onClick={() => openModal(appt)}>Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complete modal */}
      {modalAppt && (
        <div className="modal-overlay" onClick={() => setModalAppt(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Complete Appointment</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalAppt(null)}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
              Patient: <strong>{modalAppt.patient_name}</strong> | {modalAppt.appointment_date} {modalAppt.time_slot}
            </p>
            <div className="form-group">
              <label className="form-label">Doctor's Notes</label>
              <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Examination notes..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription</label>
              <textarea className="form-input" rows={3} value={prescription} onChange={e => setPrescription(e.target.value)}
                placeholder="Medications, dosage, instructions..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setModalAppt(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => updateStatus(modalAppt.id, 'completed', { notes, prescription })}>
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
