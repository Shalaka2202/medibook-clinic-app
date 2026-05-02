const express = require('express');
const router = express.Router();
const { get, all } = require('../db');
const { authMiddleware } = require('../middleware');

// GET /api/doctors
router.get('/', (req, res) => {
  const { specialization } = req.query;
  let query = `
    SELECT u.id, u.name, u.email, u.phone,
           d.specialization, d.qualification, d.experience_years, d.available_days, d.slot_duration, d.fee
    FROM users u JOIN doctors d ON d.user_id = u.id WHERE u.role = 'doctor'
  `;
  const params = [];
  if (specialization) { query += ' AND d.specialization = ?'; params.push(specialization); }
  res.json(all(query, params));
});

// GET /api/doctors/specializations
router.get('/specializations', (req, res) => {
  const specs = all('SELECT DISTINCT specialization FROM doctors');
  res.json(specs.map(s => s.specialization));
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  const doctor = get(`
    SELECT u.id, u.name, u.email, u.phone,
           d.specialization, d.qualification, d.experience_years, d.available_days, d.slot_duration, d.fee
    FROM users u JOIN doctors d ON d.user_id = u.id
    WHERE u.id = ? AND u.role = 'doctor'
  `, [req.params.id]);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
router.get('/:id/slots', authMiddleware, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  const doctor = get(`SELECT d.slot_duration, d.available_days FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.id = ?`, [req.params.id]);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = dayNames[new Date(date).getDay()];
  if (!doctor.available_days.includes(dayOfWeek))
    return res.json({ slots: [], message: 'Doctor not available on this day' });

  const slots = [];
  const dur = doctor.slot_duration || 30;
  for (let h = 9; h < 17; h++)
    for (let m = 0; m < 60; m += dur)
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

  const booked = all(
    "SELECT time_slot FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'",
    [req.params.id, date]
  ).map(a => a.time_slot);

  res.json({ slots: slots.map(t => ({ time: t, available: !booked.includes(t) })), date });
});

module.exports = router;
