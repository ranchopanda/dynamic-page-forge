#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Kill any existing node processes on port 3001
echo "📋 Stopping existing server..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start the backend server
echo "🚀 Starting backend server..."
cd server
npm run dev

