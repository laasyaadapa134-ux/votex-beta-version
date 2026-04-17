# Quick Setup Script for pose-viewer Production System
# Run this after installing Python dependencies

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "==" -ForegroundColor Cyan -NoNewline
for ($i = 0; $i -lt 58; $i++) { Write-Host "=" -NoNewline -ForegroundColor Cyan }
Write-Host ""
Write-Host "  Sign Language Production System - pose-viewer Setup" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
for ($i = 0; $i -lt 59; $i++) { Write-Host "=" -NoNewline -ForegroundColor Cyan }
Write-Host "`n"

$ErrorActionPreference = "Continue"

# Step 1: Check Python
Write-Host "[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.8+." -ForegroundColor Red
    exit 1
}

# Step 2: Install Python dependencies
Write-Host "`n[2/5] Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "  Installing pose-format and numpy..." -ForegroundColor Gray
pip install -q pose-format numpy
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install Python dependencies" -ForegroundColor Red
    Write-Host "  Try manually: pip install pose-format numpy" -ForegroundColor Yellow
}

# Step 3: Check Node/NPM
Write-Host "`n[3/5] Checking Node.js/NPM..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Host "  ✓ Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host "  ✓ NPM found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Node.js/NPM not found" -ForegroundColor Yellow
    Write-Host "  pose-viewer is already installed in node_modules" -ForegroundColor Gray
}

# Step 4: Check if pose-viewer is installed
Write-Host "`n[4/5] Checking pose-viewer..." -ForegroundColor Yellow
if (Test-Path "node_modules/pose-viewer") {
    Write-Host "  ✓ pose-viewer already installed" -ForegroundColor Green
} else {
    Write-Host "  Installing pose-viewer..." -ForegroundColor Gray
    npm install pose-viewer --save 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ pose-viewer installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install pose-viewer" -ForegroundColor Red
    }
}

# Step 5: Convert existing JSON files
Write-Host "`n[5/5] Converting MediaPipe JSON files to .pose format..." -ForegroundColor Yellow
Write-Host "  Running converter script..." -ForegroundColor Gray

if (Test-Path "convert_mediapipe_to_pose.py") {
    try {
        python convert_mediapipe_to_pose.py 2>&1 | ForEach-Object {
            if ($_ -match "✅" -or $_ -match "Successfully") {
                Write-Host "  $_" -ForegroundColor Green
            } elseif ($_ -match "❌" -or $_ -match "Error") {
                Write-Host "  $_" -ForegroundColor Red
            } elseif ($_ -match "⚠️" -or $_ -match "Warning") {
                Write-Host "  $_" -ForegroundColor Yellow
            } else {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  ⚠ Converter script encountered issues" -ForegroundColor Yellow
        Write-Host "  You can run it manually: python convert_mediapipe_to_pose.py" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✗ Converter script not found" -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
for ($i = 0; $i -lt 59; $i++) { Write-Host "=" -NoNewline -ForegroundColor Cyan }
Write-Host ""
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
for ($i = 0; $i -lt 59; $i++) { Write-Host "=" -NoNewline -ForegroundColor Cyan }
Write-Host "`n"

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the server: " -NoNewline -ForegroundColor White
Write-Host "python server.py" -ForegroundColor Yellow
Write-Host "  2. Open browser: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5000/pose_viewer_production.html" -ForegroundColor Yellow
Write-Host "  3. Select a word and click 'Load Pose Data'" -ForegroundColor White
Write-Host "  4. Click 'Play' to see the animation!`n" -ForegroundColor White

Write-Host "Documentation: " -NoNewline -ForegroundColor White
Write-Host "POSE_VIEWER_README.md`n" -ForegroundColor Yellow

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
