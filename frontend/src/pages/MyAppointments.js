import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../api';

const STATUS_COLORS = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    appointmentsAPI.list().then(res => setAppointments(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="container page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1>My Appointments</h1>
          <p>Track and manage your bookings</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">+ Book New</Link>
      </div>

      <div className="tabs">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 12 }}>
              ({appointments.filter(a => a.status === s).length})
            </span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No appointments</h3>
          <p>Book your first appointment with a specialist</p>
          <Link to="/doctors" className="btn btn-primary" style={{ marginTop: 16 }}>Find Doctors</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map(appt => (
            <div key={appt.id} className="appt-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{appt.doctor_name}</div>
                <div style={{ fontSize: 13, color: 'var(--accent)' }}>{appt.specialization}</div>
                {appt.symptoms && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Symptoms: {appt.symptoms}</div>}
                {appt.prescription && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Rx: {appt.prescription}</div>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>📅 {appt.appointment_date}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>⏰ {appt.time_slot}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                {(appt.status === 'pending' || appt.status === 'confirmed') && (
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
