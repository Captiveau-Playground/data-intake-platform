@echo off
echo ========================================
echo Football Intel - Docker Build & Run
echo ========================================

echo.
echo [1/3] Building API...
docker build -t football-intel-api:latest -f apps/api/Dockerfile .

echo.
echo [2/3] Building Web...
docker build -t football-intel-web:latest -f apps/web/Dockerfile .

echo.
echo [3/3] Starting all services...
docker-compose up -d --build

echo.
echo ========================================
echo Done! Services running:
echo   Web:   http://localhost:3000
echo   API:   http://localhost:3001
echo   Docs:  http://localhost:3001/docs
echo ========================================

pause