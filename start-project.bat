@echo off
title Campus Bites Launcher
color 0A

echo ===================================================
echo        CAMPUS BITES - ONE-CLICK LAUNCHER
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed on this computer!
    echo Please install Node.js from https://nodejs.org or run the installer on this pendrive.
    echo.
    pause
    exit /b
)

echo [OK] Node.js detected:
node -v
echo.

:: 2. Check dependencies (install if missing)
if not exist "server\node_modules\" (
    echo [INFO] Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules\" (
    echo [INFO] Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

:: 3. Start Backend in separate window
echo [INFO] Starting Backend Server (Port 5000)...
start "Campus Bites - Backend API" cmd /k "cd server && node server.js"

:: 4. Wait 3 seconds
timeout /t 3 /nobreak >nul

:: 5. Start Frontend in separate window
echo [INFO] Starting Frontend Dev Server (Port 5173)...
start "Campus Bites - Client Web" cmd /k "cd client && npm run dev"

:: 6. Wait 3 seconds then open default browser
timeout /t 3 /nobreak >nul
echo [INFO] Opening Campus Bites in your browser...
start http://localhost:5173/

echo.
echo ===================================================
echo   Campus Bites is now running!
echo   Frontend : http://localhost:5173/
echo   Backend  : http://localhost:5000/
echo ===================================================
echo Keep the backend and frontend terminal windows open while presenting.
echo To stop everything when done, double-click 'stop-project.bat'.
echo.
pause

