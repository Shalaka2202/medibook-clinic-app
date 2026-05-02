const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../db');
const { authMiddleware, requireRole } = require('../middleware');

// GET /api/admin/stats
router.get('/stats', authMiddleware, requireRole('admin'), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({
    totalPatients: get("SELECT COUNT(*) as c FROM users WHERE role='patient'").c,
    totalDoctors: get("SELECT COUNT(*) as c FROM users WHERE role='doctor'").c,
    totalAppointments: get("SELECT COUNT(*) as c FROM appointments").c,
    pendingAppointments: get("SELECT COUNT(*) as c FROM appointments WHERE status='pending'").c,
    confirmedAppointments: get("SELECT COUNT(*) as c FROM appointments WHERE status='confirmed'").c,
    completedAppointments: get("SELECT COUNT(*) as c FROM appointments WHERE status='completed'").c,
    todayAppointments: get("SELECT COUNT(*) as c FROM appointments WHERE appointment_date = ? AND status != 'cancelled'", [today]).c,
  });
});

// POST /api/admin/doctors
router.post('/doctors', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, email, password, phone, specialization, qualification, experience_years, fee, available_days } = req.body;
  if (!name || !email || !password || !specialization)
    return res.status(400).json({ error: 'name, email, password, specialization are required' });

  if (get('SELECT id FROM users WHERE email = ?', [email]))
    return res.status(409).json({ error: 'Email already in use' });

  const userId = uuidv4();
  run('INSERT INTO users (id, name, email, password, role, phone) VALUES (?,?,?,?,?,?)',
    [userId, name, email, bcrypt.hashSync(password, 10), 'doctor', phone || null]);
  run('INSERT INTO doctors (id, user_id, specialization, qualification, experience_years, fee, available_days) VALUES (?,?,?,?,?,?,?)',
    [uuidv4(), userId, specialization, qualification || '', experience_years || 0, fee || 500, available_days || 'Mon,Tue,Wed,Thu,Fri']);

  res.status(201).json({ message: 'Doctor added', userId });
});

// DELETE /api/admin/doctors/:userId
router.delete('/doctors/:userId', authMiddleware, requireRole('admin'), (req, res) => {
  if (!get("SELECT id FROM users WHERE id = ? AND role = 'doctor'", [req.params.userId]))
    return res.status(404).json({ error: 'Doctor not found' });
  run('DELETE FROM appointments WHERE doctor_id = ?', [req.params.userId]);
  run('DELETE FROM doctors WHERE user_id = ?', [req.params.userId]);
  run('DELETE FROM users WHERE id = ?', [req.params.userId]);
  res.json({ message: 'Doctor removed' });
});

module.exports = router;
