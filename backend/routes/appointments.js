const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../db');
const { authMiddleware, requireRole } = require('../middleware');

// GET /api/appointments
router.get('/', authMiddleware, (req, res) => {
  const { user } = req;
  let rows;
  if (user.role === 'patient') {
    rows = all(`
      SELECT a.*, u.name as doctor_name, d.specialization
      FROM appointments a JOIN users u ON a.doctor_id = u.id JOIN doctors d ON d.user_id = u.id
      WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.time_slot DESC
    `, [user.id]);
  } else if (user.role === 'doctor') {
    rows = all(`
      SELECT a.*, u.name as patient_name, u.phone as patient_phone
      FROM appointments a JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC, a.time_slot DESC
    `, [user.id]);
  } else {
    rows = all(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone,
             du.name as doctor_name, d.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users du ON a.doctor_id = du.id
      JOIN doctors d ON d.user_id = du.id
      ORDER BY a.appointment_date DESC, a.time_slot DESC
    `, []);
  }
  res.json(rows);
});

// POST /api/appointments
router.post('/', authMiddleware, requireRole('patient'), (req, res) => {
  const { doctor_id, appointment_date, time_slot, symptoms } = req.body;
  if (!doctor_id || !appointment_date || !time_slot)
    return res.status(400).json({ error: 'doctor_id, appointment_date, and time_slot are required' });

  const today = new Date().toISOString().split('T')[0];
  if (appointment_date < today)
    return res.status(400).json({ error: 'Cannot book appointments in the past' });

  const conflict = get(
    "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status != 'cancelled'",
    [doctor_id, appointment_date, time_slot]
  );
  if (conflict) return res.status(409).json({ error: 'This slot is already booked' });

  const id = uuidv4();
  run('INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, time_slot, symptoms) VALUES (?,?,?,?,?,?)',
    [id, req.user.id, doctor_id, appointment_date, time_slot, symptoms || null]);

  res.status(201).json(get('SELECT * FROM appointments WHERE id = ?', [id]));
});

// GET /api/appointments/:id
router.get('/:id', authMiddleware, (req, res) => {
  const appt = get(`
    SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
           du.name as doctor_name, d.specialization, d.qualification
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users du ON a.doctor_id = du.id
    JOIN doctors d ON d.user_id = du.id
    WHERE a.id = ?
  `, [req.params.id]);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  if (req.user.role === 'patient' && appt.patient_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  if (req.user.role === 'doctor' && appt.doctor_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  res.json(appt);
});

// PATCH /api/appointments/:id
router.patch('/:id', authMiddleware, (req, res) => {
  const appt = get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const { status, notes, prescription } = req.body;
  const { user } = req;

  if (user.role === 'patient') {
    if (appt.patient_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    if (status && status !== 'cancelled') return res.status(403).json({ error: 'Patients can only cancel appointments' });
  }
  if (user.role === 'doctor' && appt.doctor_id !== user.id) return res.status(403).json({ error: 'Access denied' });

  const fields = [];
  const vals = [];
  if (status) { fields.push('status = ?'); vals.push(status); }
  if (notes !== undefined) { fields.push('notes = ?'); vals.push(notes); }
  if (prescription !== undefined) { fields.push('prescription = ?'); vals.push(prescription); }
  if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });

  vals.push(req.params.id);
  run(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, vals);
  res.json(get('SELECT * FROM appointments WHERE id = ?', [req.params.id]));
});

// DELETE /api/appointments/:id (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  if (!get('SELECT id FROM appointments WHERE id = ?', [req.params.id]))
    return res.status(404).json({ error: 'Not found' });
  run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
  res.json({ message: 'Appointment deleted' });
});

module.exports = router;
