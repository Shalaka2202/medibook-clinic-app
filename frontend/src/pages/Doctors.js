import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Doctors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([doctorsAPI.list(), doctorsAPI.specializations()])
      .then(([docRes, specRes]) => {
        setDoctors(docRes.data);
        setSpecs(specRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpec || d.specialization === filterSpec;
    return matchSearch && matchSpec;
  });

  const handleBook = (doctorId) => {
    if (!user) navigate('/login');
    else if (user.role !== 'patient') alert('Only patients can book appointments');
    else navigate(`/book/${doctorId}`);
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading doctors...</div>;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Browse our specialists and book your appointment today</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name or specialization..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input form-select" style={{ width: 'auto', minWidth: 180 }}
          value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
          <option value="">All Specializations</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No doctors found</h3>
          <p>Try a different search term or filter</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(doc => (
            <div key={doc.id} className="doctor-card" onClick={() => handleBook(doc.id)}>
              <div className="doctor-avatar">👨‍⚕️</div>
              <div className="doctor-name">{doc.name}</div>
              <div className="doctor-spec">{doc.specialization}</div>
              <div className="doctor-info">
                <span>🎓 {doc.qualification}</span>
                <span>⏳ {doc.experience_years} yrs exp</span>
                <span>💰 ₹{doc.fee}</span>
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                onClick={(e) => { e.stopPropagation(); handleBook(doc.id); }}>
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
