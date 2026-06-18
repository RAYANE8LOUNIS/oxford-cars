# Oxford Cars — Setup Script (PowerShell)
# Run this from the project root: .\setup.ps1

Write-Host "`n🚗 Oxford Cars — Setup" -ForegroundColor Yellow
Write-Host "========================`n" -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Backend setup
Write-Host "`n[1/4] Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Backend install failed" -ForegroundColor Red; exit 1 }

# Copy env if not exists
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created backend/.env — please edit with your database credentials" -ForegroundColor Yellow
}

# Frontend setup
Write-Host "`n[2/4] Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend install failed" -ForegroundColor Red; exit 1 }

Set-Location ..

Write-Host "`n[3/4] Setup complete!" -ForegroundColor Green
Write-Host "`n Next steps:" -ForegroundColor White
Write-Host "  1. Edit backend/.env with your PostgreSQL credentials" -ForegroundColor White
Write-Host "  2. Run: cd backend && npm run db:setup" -ForegroundColor White
Write-Host "  3. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  4. Start frontend (new terminal): cd frontend && npm run dev" -ForegroundColor White
Write-Host "`n  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Admin:    http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "`n  Admin login: admin@oxfordcars.dz / Admin@Oxford2024`n" -ForegroundColor Yellow
