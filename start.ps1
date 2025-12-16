# Animal Park System - Quick Start Script

Write-Host "🦁 Animal Park Rwanda - System Startup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Yellow
docker-compose exec -T backend npx prisma db seed

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "🎉 System is ready!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Health:   http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Tourist: tourist@example.com / password123" -ForegroundColor White
Write-Host "  Ranger:  ranger@example.com / password123" -ForegroundColor White
Write-Host "  Admin:   admin@example.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host ""
