const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db');
const { JWT_SECRET, authMiddleware } = require('../middleware');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  const existing = get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashedPwd = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  run('INSERT INTO users (id, name, email, password, role, phone) VALUES (?,?,?,?,?,?)',
    [id, name, email, hashedPwd, 'patient', phone || null]);

  const token = jwt.sign({ id, name, email, role: 'patient' }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, role: 'patient', phone } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = get('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
