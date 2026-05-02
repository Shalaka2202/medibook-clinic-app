# Database Schema – MediBook

**Database:** SQLite (clinic.db)

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │    DOCTORS      │
├─────────────────┤         ├─────────────────┤
│ id (PK, UUID)   │────────►│ id (PK, UUID)   │
│ name            │  1    1 │ user_id (FK)    │
│ email (UNIQUE)  │         │ specialization  │
│ password (hash) │         │ qualification   │
│ role            │         │ experience_years│
│ phone           │         │ available_days  │
│ created_at      │         │ slot_duration   │
└─────────────────┘         │ fee             │
        │                   └─────────────────┘
        │ 1
        │
        │ N
┌─────────────────┐
│  APPOINTMENTS   │
├─────────────────┤
│ id (PK, UUID)   │
│ patient_id (FK) │──► users.id (patient)
│ doctor_id (FK)  │──► users.id (doctor)
│ appointment_date│
│ time_slot       │
│ status          │ → pending|confirmed|cancelled|completed
│ symptoms        │
│ notes           │
│ prescription    │
│ created_at      │
└─────────────────┘
UNIQUE(doctor_id, appointment_date, time_slot) -- prevents double booking
```

---

## Table Definitions

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password | TEXT | NOT NULL (bcrypt hash) |
| role | TEXT | CHECK IN ('patient','doctor','admin') |
| phone | TEXT | nullable |
| created_at | TEXT | DEFAULT datetime('now') |

### doctors
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | FK → users.id ON DELETE CASCADE |
| specialization | TEXT | NOT NULL |
| qualification | TEXT | |
| experience_years | INTEGER | DEFAULT 0 |
| available_days | TEXT | DEFAULT 'Mon,Tue,Wed,Thu,Fri' |
| slot_duration | INTEGER | DEFAULT 30 (minutes) |
| fee | REAL | DEFAULT 500 |

### appointments
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| patient_id | TEXT | FK → users.id |
| doctor_id | TEXT | FK → users.id |
| appointment_date | TEXT | NOT NULL (YYYY-MM-DD) |
| time_slot | TEXT | NOT NULL (HH:MM) |
| status | TEXT | DEFAULT 'pending', CHECK IN (...) |
| symptoms | TEXT | nullable |
| notes | TEXT | nullable (doctor fills) |
| prescription | TEXT | nullable (doctor fills) |
| created_at | TEXT | DEFAULT datetime('now') |

**Unique constraint:** `(doctor_id, appointment_date, time_slot)` — enforces no double bookings at DB level.

---

## Seeded Data

On first run, the DB is automatically seeded with:
- 1 Admin account
- 4 Doctor accounts (Cardiology, Orthopedics, Pediatrics, Dermatology)
- 1 Patient account
