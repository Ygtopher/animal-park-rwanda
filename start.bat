@echo off
echo.
echo ========================================
echo   Animal Park Rwanda - System Startup
echo ========================================
echo.

echo Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

echo Starting services with Docker Compose...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Seeding database...
docker-compose exec -T backend npx prisma db seed

echo.
echo ========================================
echo   System is ready!
echo ========================================
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Health:   http://localhost:5000/health
echo.
echo Demo Accounts:
echo   Tourist: tourist@example.com / password123
echo   Ranger:  ranger@example.com / password123
echo   Admin:   admin@example.com / password123
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f
echo.
pause
