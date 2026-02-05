#!/bin/bash

echo "🍷 Starting WineHub CMS..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running!"
    echo "Please start MongoDB first:"
    echo "  brew services start mongodb-community"
    echo "  OR"
    echo "  mongod"
    exit 1
fi

echo "✅ MongoDB is running"

# Check if port 5001 is in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5001 is already in use"
    echo "Attempting to kill process on port 5001..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Seed database if needed
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database..."
    node server/seed.js
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully"
    else
        echo "❌ Failed to seed database"
        exit 1
    fi
fi

# Start the application
echo "🚀 Starting backend server on port 5001..."
echo "🚀 Starting frontend on port 3000..."
echo ""
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo "Login: admin@winehub.com / admin123"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
