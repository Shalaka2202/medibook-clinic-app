const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'clinic.db');
let db = null;

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT NOT NULL, phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, specialization TEXT NOT NULL,
    qualification TEXT, experience_years INTEGER DEFAULT 0,
    available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    slot_duration INTEGER DEFAULT 30, fee REAL DEFAULT 500
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, doctor_id TEXT NOT NULL,
    appointment_date TEXT NOT NULL, time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'pending', symptoms TEXT, notes TEXT,
    prescription TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);

  saveDB();

  const existingAdmin = get("SELECT id FROM users WHERE email = 'admin@clinic.com'");
  if (!existingAdmin) {
    const adminPwd = bcrypt.hashSync('admin123', 10);
    run('INSERT INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)',
      [uuidv4(), 'Admin User', 'admin@clinic.com', adminPwd, 'admin']);

    const doctors = [
      { name: 'Dr. Priya Sharma', email: 'priya@clinic.com', spec: 'Cardiology', qual: 'MD, DM Cardiology', exp: 12, fee: 800 },
      { name: 'Dr. Rahul Mehta', email: 'rahul@clinic.com', spec: 'Orthopedics', qual: 'MS Orthopedics', exp: 8, fee: 700 },
      { name: 'Dr. Anita Patel', email: 'anita@clinic.com', spec: 'Pediatrics', qual: 'MD Pediatrics', exp: 10, fee: 600 },
      { name: 'Dr. Suresh Nair', email: 'suresh@clinic.com', spec: 'Dermatology', qual: 'MD Dermatology', exp: 6, fee: 650 },
    ];
    const docPwd = bcrypt.hashSync('doctor123', 10);
    for (const doc of doctors) {
      const userId = uuidv4();
      run('INSERT INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)',
        [userId, doc.name, doc.email, docPwd, 'doctor']);
      run('INSERT INTO doctors (id,user_id,specialization,qualification,experience_years,fee) VALUES (?,?,?,?,?,?)',
        [uuidv4(), userId, doc.spec, doc.qual, doc.exp, doc.fee]);
    }

    const patPwd = bcrypt.hashSync('patient123', 10);
    run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
      [uuidv4(), 'Ravi Kumar', 'ravi@example.com', patPwd, 'patient', '9876543210']);

    console.log('Database seeded! Admin: admin@clinic.com/admin123 | Doctor: priya@clinic.com/doctor123 | Patient: ravi@example.com/patient123');
  }

  console.log('Database ready');
}

module.exports = { initDB, run, get, all, saveDB };
