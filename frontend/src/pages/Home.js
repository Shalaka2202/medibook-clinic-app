import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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

        {/* Contact Us */}
        <div style={{ marginTop: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, marginBottom: 12 }}>Contact Us</h2>
            <p style={{ color: 'var(--text2)', fontSize: 16 }}>Have a question or need help? We're here for you.</p>
          </div>

          <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  icon: '📍',
                  title: 'Our Location',
                  lines: ['MediBook Health Centre', '12, Wellness Avenue, Koregaon Park', 'Pune, Maharashtra – 411001'],
                },
                {
                  icon: '📞',
                  title: 'Phone',
                  lines: ['+91 20 4567 8900', 'Mon – Sat, 9:00 AM – 6:00 PM'],
                },
                {
                  icon: '✉️',
                  title: 'Email',
                  lines: ['support@medibook.in', 'appointments@medibook.in'],
                },
                {
                  icon: '🕐',
                  title: 'Working Hours',
                  lines: ['Monday – Friday: 9:00 AM – 7:00 PM', 'Saturday: 9:00 AM – 4:00 PM', 'Sunday: Closed'],
                },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'var(--accent-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>{item.title}</div>
                    {item.lines.map(line => (
                      <div key={line} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="card">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 22, marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text2)' }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: 20, marginBottom: 20 }}>Send us a message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Your Name</label>
                        <input className="form-input" required placeholder="Ravi Kumar"
                          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" required placeholder="you@example.com"
                          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select className="form-input form-select"
                        value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                        <option value="">Select a subject</option>
                        <option>Appointment Query</option>
                        <option>Billing & Payments</option>
                        <option>Doctor Availability</option>
                        <option>Technical Support</option>
                        <option>General Enquiry</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea className="form-input" rows={4} required
                        placeholder="Write your message here..."
                        style={{ resize: 'vertical' }}
                        value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '24px 0', marginTop: 64 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>© 2026 MediBook. All rights reserved.</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Made with ❤️ for better healthcare</div>
        </div>
      </div>
    </div>
  );
}
