#!/bin/bash
# MediBook Quick Start Script

echo "🏥 Starting MediBook – Clinic Appointment System"
echo ""

# Start backend
echo "📡 Starting backend on port 5000..."
cd backend && npm install --silent && node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd ../frontend && npm install --silent && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers starting!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Demo accounts:"
echo "   Admin:   admin@clinic.com   / admin123"
echo "   Doctor:  priya@clinic.com   / doctor123"
echo "   Patient: ravi@example.com   / patient123"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
