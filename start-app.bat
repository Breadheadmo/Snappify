@echo off
echo Starting Snappy E-commerce Platform...

REM Start the backend server
start cmd /k "cd server && npm run dev"

REM Wait a moment for the backend to initialize
timeout /t 5

REM Start the frontend client
start cmd /k "cd client && npm start"

echo Snappy server and client are now running!
