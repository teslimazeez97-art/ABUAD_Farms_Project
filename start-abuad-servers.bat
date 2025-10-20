@echo off
echo Starting ABUAD Farms Servers...
echo.

echo Starting Backend Server (Port 5001)...
start "ABUAD Backend" cmd /k "cd /d C:\Users\Abdulazeez Teslim O\Documents\ABUAD_Farms_Project\backend && echo Starting backend server... && node server.js"

echo.
echo Starting Frontend Server (Port 3000)...
start "ABUAD Frontend" cmd /k "cd /d C:\Users\Abdulazeez Teslim O\Documents\ABUAD_Farms_Project\frontend && echo Starting frontend server... && npm start"

echo.
echo Both servers are starting in separate windows...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will continue running)
pause > nul