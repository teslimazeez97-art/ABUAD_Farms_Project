@echo off
echo Starting ABUAD Farms Servers...

echo.
echo Starting Backend Server (Port 5001)...
start "ABUAD Backend" cmd /k "cd /d C:\Users\Abdulazeez Teslim O\Documents\ABUAD_Farms_Project\backend && set PORT=5001 && npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server (Port 3000)...
start "ABUAD Frontend" cmd /k "cd /d C:\Users\Abdulazeez Teslim O\Documents\ABUAD_Farms_Project\frontend && set PORT=3000 && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
pause