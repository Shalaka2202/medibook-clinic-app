import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../api';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  useEffect(() => {
    doctorsAPI.get(doctorId)
      .then(res => setDoctor(res.data))
      .catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
  }, [doctorId, navigate]);

  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    doctorsAPI.slots(doctorId, date)
      .then(res => setSlots(res.data.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [date, doctorId]);

  const handleBook = async () => {
    if (!date || !selectedSlot) return setError('Please select a date and time slot');
    setError('');
    setBooking(true);
    try {
      await appointmentsAPI.create({ doctor_id: doctorId, appointment_date: date, time_slot: selectedSlot, symptoms });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  if (success) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>Appointment Booked!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
          Your appointment with <strong>{doctor?.name}</strong> on <strong>{date}</strong> at <strong>{selectedSlot}</strong> is confirmed.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate('/appointments')}>View Appointments</button>
          <button className="btn btn-primary" onClick={() => navigate('/doctors')}>Book Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <button className="btn btn-ghost" onClick={() => navigate('/doctors')} style={{ marginBottom: 20 }}>← Back</button>

      <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
        {/* Doctor Info */}
        <div>
          <div className="card">
            <div className="doctor-avatar" style={{ width: 64, height: 64, fontSize: 28 }}>👨‍⚕️</div>
            <h2 style={{ fontSize: 24, marginTop: 12, marginBottom: 4 }}>{doctor?.name}</h2>
            <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 16 }}>{doctor?.specialization}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['🎓 Qualification', doctor?.qualification],
                ['⏳ Experience', `${doctor?.experience_years} years`],
                ['💰 Consultation Fee', `₹${doctor?.fee}`],
                ['📅 Available Days', doctor?.available_days?.replace(/,/g, ', ')],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)', minWidth: 140 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="card">
          <h2 style={{ marginBottom: 24, fontSize: 24 }}>Book Appointment</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input className="form-input" type="date" min={today} max={maxDate}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {date && (
            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              {slotsLoading ? (
                <div className="loading" style={{ padding: 20 }}><div className="spinner" /> Loading slots...</div>
              ) : slots.length === 0 ? (
                <p style={{ color: 'var(--text2)', fontSize: 14 }}>No slots available for this date</p>
              ) : (
                <div className="slots-grid">
                  {slots.map(slot => (
                    <button key={slot.time} className={`slot-btn ${selectedSlot === slot.time ? 'selected' : ''}`}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Symptoms / Reason (optional)</label>
            <textarea className="form-input" rows={3} placeholder="Describe your symptoms..."
              value={symptoms} onChange={e => setSymptoms(e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            onClick={handleBook} disabled={!date || !selectedSlot || booking}>
            {booking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
