const express = require('express');
const router = express.Router();
const { all } = require('../db');
const { authMiddleware, requireRole } = require('../middleware');

router.get('/', authMiddleware, requireRole('doctor', 'admin'), (req, res) => {
  res.json(all("SELECT id, name, email, phone, created_at FROM users WHERE role = 'patient' ORDER BY name", []));
});

module.exports = router;
