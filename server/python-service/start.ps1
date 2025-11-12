# Quick Start Script untuk Qualcomm AI Hub Flask Service

Write-Host "🐍 Qualcomm AI Hub Flask Service - Quick Start" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "✓ Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Navigate to python-service directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "📁 Working directory: $scriptPath" -ForegroundColor Cyan

# Check if venv exists
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "⚠ Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
}

# Activate venv
Write-Host ""
Write-Host "✓ Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check qai-hub configuration
Write-Host ""
Write-Host "🔍 Checking Qualcomm AI Hub configuration..." -ForegroundColor Yellow
$qaiConfig = qai-hub configure --check 2>&1
if ($qaiConfig -match "configured") {
    Write-Host "  ✓ Qualcomm AI Hub already configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Configuring Qualcomm AI Hub..." -ForegroundColor Yellow
    Write-Host "  📝 Please enter your API token when prompted" -ForegroundColor Cyan
    qai-hub configure
}

# Start Flask server
Write-Host ""
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "🚀 Starting Flask Server..." -ForegroundColor Green
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Endpoints:" -ForegroundColor Cyan
Write-Host "   GET  http://127.0.0.1:5001/health       - Health check" -ForegroundColor White
Write-Host "   POST http://127.0.0.1:5001/predict      - Single prediction" -ForegroundColor White
Write-Host "   POST http://127.0.0.1:5001/batch-predict - Batch predictions" -ForegroundColor White
Write-Host ""
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

python app.py
