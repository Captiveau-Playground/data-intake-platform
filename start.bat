@echo off
echo Starting Football Intel Platform...

echo.
echo [1/3] Starting PostgreSQL...
docker-compose up -d

echo.
echo [2/3] Starting API (port 3001)...
start "Football Intel API" python -m uvicorn main:app --host 0.0.0.0 --port 3001

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Web (port 3000)...
start "Football Intel Web" npm run dev

echo.
echo ========================================
echo Football Intel is running!
echo   Web:   http://localhost:3000
echo   API:   http://localhost:3001
echo   Docs:  http://localhost:3001/docs
echo.
echo Login: admin / admin123
echo ========================================

pause