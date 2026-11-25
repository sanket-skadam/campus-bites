@echo off
title Campus Bites - Stop Servers
color 0E

echo ===================================================
echo       STOPPING CAMPUS BITES SERVERS...
echo ===================================================
echo.

powershell -Command "$ports = @(5000, 5173); foreach ($p in $ports) { $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if ($conn) { $pids = $conn.OwningProcess | Select-Object -Unique; foreach ($pidToKill in $pids) { Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue; Write-Output \"Port $p stopped (PID: $pidToKill)\" } } else { Write-Output \"Port $p is already free.\" } }"

echo.
echo [DONE] Both Backend (5000) and Frontend (5173) have been safely stopped!
echo You can now safely eject your pendrive.
echo.
pause

