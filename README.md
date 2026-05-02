# MediBook – Smart Health Clinic Appointment System

> **SE ZG503 Full Stack Application Development — Assignment 2026**

A full-stack web application for managing clinic appointments, built with React + Node.js + SQLite.

---

## Problem Statement

Traditional clinics manage appointments manually via phone or paper registers, causing scheduling conflicts, missed appointments, and poor patient experience. **MediBook** solves this with a role-based digital portal for patients, doctors, and administrators.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI Tool | Claude (Anthropic) |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend (Port 3000)      │
│  Pages: Home, Doctors, BookAppt, Dashboard   │
│  State: AuthContext, React hooks             │
└───────────────────┬─────────────────────────┘
                    │ REST API (Axios + JWT)
┌───────────────────▼─────────────────────────┐
│           Express.js Backend (Port 5000)     │
│  Routes: /auth /doctors /appointments        │
│          /patients /admin                    │
│  Middleware: JWT Auth, Role Guard            │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│              SQLite Database                 │
│  Tables: users, doctors, appointments        │
└─────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |
| Doctor | priya@clinic.com | doctor123 |
| Doctor | rahul@clinic.com | doctor123 |
| Patient | ravi@example.com | patient123 |

---

## Features

### Patient
- Register & login
- Browse doctors with search/filter by specialization
- View doctor profiles (qualification, experience, fee)
- Book appointments on available slots (prevents double-booking)
- View, filter, and cancel appointments

### Doctor
- Dashboard with stats (today's, pending, confirmed)
- Confirm/reject appointments
- Complete appointments with notes & prescription
- View all patient history

### Admin
- Full statistics overview
- Manage doctors (add, remove)
- View all appointments across the system
- Doctor performance overview

---

## Project Structure

```
clinic-app/
├── backend/
│   ├── server.js          # Express entry point
│   ├── db.js              # SQLite init + seed
│   ├── middleware.js       # JWT auth middleware
│   └── routes/
│       ├── auth.js         # Login, register, /me
│       ├── appointments.js # CRUD appointments
│       ├── doctors.js      # Doctor listing + slots
│       ├── patients.js     # Patient list
│       └── admin.js        # Admin stats + doctor mgmt
│
├── frontend/
│   └── src/
│       ├── App.js           # Router + protected routes
│       ├── AuthContext.js   # Global auth state
│       ├── api.js           # Axios API service
│       ├── index.css        # Design system
│       ├── components/
│       │   └── Navbar.js
│       └── pages/
│           ├── Home.js
│           ├── Login.js
│           ├── Register.js
│           ├── Doctors.js
│           ├── BookAppointment.js
│           ├── MyAppointments.js
│           ├── DoctorDashboard.js
│           └── AdminDashboard.js
│
└── docs/
    ├── API.md             # Full API documentation
    ├── DB_SCHEMA.md       # Database schema
    └── AI_USAGE_LOG.md    # AI tool usage + reflection
```
