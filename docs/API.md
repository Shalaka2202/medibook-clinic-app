# MediBook API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer JWT token in `Authorization` header

---

## Authentication

### POST `/auth/register`
Register a new patient account.

**Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "mypassword",
  "phone": "9876543210"
}
```
**Response 201:**
```json
{
  "token": "<jwt>",
  "user": { "id": "uuid", "name": "Ravi Kumar", "email": "...", "role": "patient" }
}
```
**Errors:** 400 (missing fields), 409 (email exists)

---

### POST `/auth/login`
Login and receive JWT token.

**Body:**
```json
{ "email": "ravi@example.com", "password": "mypassword" }
```
**Response 200:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "patient" }
}
```
**Errors:** 400 (missing), 401 (invalid credentials)

---

### GET `/auth/me` 🔒
Get current logged-in user profile.

**Response 200:**
```json
{ "id": "...", "name": "...", "email": "...", "role": "patient", "phone": "...", "created_at": "..." }
```

---

## Doctors

### GET `/doctors`
List all doctors. Optional query: `?specialization=Cardiology`

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Dr. Priya Sharma",
    "email": "priya@clinic.com",
    "specialization": "Cardiology",
    "qualification": "MD, DM Cardiology",
    "experience_years": 12,
    "available_days": "Mon,Tue,Wed,Thu,Fri",
    "slot_duration": 30,
    "fee": 800
  }
]
```

---

### GET `/doctors/specializations`
Get unique list of specializations.

**Response 200:** `["Cardiology", "Orthopedics", "Pediatrics", "Dermatology"]`

---

### GET `/doctors/:id`
Get single doctor details.

---

### GET `/doctors/:id/slots?date=YYYY-MM-DD` 🔒
Get available time slots for a doctor on a date.

**Response 200:**
```json
{
  "date": "2026-05-10",
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": false },
    ...
  ]
}
```

---

## Appointments

### GET `/appointments` 🔒
Get appointments. Filtered by role:
- **Patient:** only their own appointments (with doctor info)
- **Doctor:** their patient list (with patient info)
- **Admin:** all appointments

---

### POST `/appointments` 🔒 (Patient only)
Book an appointment.

**Body:**
```json
{
  "doctor_id": "uuid",
  "appointment_date": "2026-05-10",
  "time_slot": "10:00",
  "symptoms": "Chest pain and fatigue"
}
```
**Response 201:** Created appointment object  
**Errors:** 400 (missing/past date), 409 (slot conflict)

---

### GET `/appointments/:id` 🔒
Get a single appointment. Access restricted to involved patient/doctor or admin.

---

### PATCH `/appointments/:id` 🔒
Update appointment status, notes, or prescription.

**Body (examples):**
```json
{ "status": "confirmed" }            // Doctor confirms
{ "status": "completed", "notes": "...", "prescription": "Tab XYZ 500mg..." }
{ "status": "cancelled" }            // Patient cancels
```
**Allowed transitions:**
- Patient: pending/confirmed → cancelled
- Doctor: pending → confirmed, confirmed → completed (+ notes/prescription)
- Admin: any

---

### DELETE `/appointments/:id` 🔒 (Admin only)
Permanently delete an appointment.

---

## Admin

### GET `/admin/stats` 🔒 (Admin only)
Dashboard statistics.

**Response 200:**
```json
{
  "totalPatients": 5,
  "totalDoctors": 4,
  "totalAppointments": 12,
  "pendingAppointments": 3,
  "confirmedAppointments": 5,
  "completedAppointments": 4,
  "todayAppointments": 2
}
```

---

### POST `/admin/doctors` 🔒 (Admin only)
Add a new doctor.

**Body:**
```json
{
  "name": "Dr. Kavya Reddy",
  "email": "kavya@clinic.com",
  "password": "doctor123",
  "specialization": "Neurology",
  "qualification": "MD, DM Neurology",
  "experience_years": 8,
  "fee": 900,
  "available_days": "Mon,Tue,Wed,Thu,Fri"
}
```

---

### DELETE `/admin/doctors/:userId` 🔒 (Admin only)
Remove a doctor (cascades to delete their appointments).

---

## Patients

### GET `/patients` 🔒 (Doctor or Admin)
List all registered patients.

---

## Error Format

All errors return:
```json
{ "error": "Human-readable error message" }
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (no/bad token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |
