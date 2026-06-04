# run_dev.ps1 — Development runner for Learning-Academy
# Usage: Open PowerShell and run: .\run_dev.ps1

$VENV = "$PSScriptRoot\\.venv"
if (-Not (Test-Path $VENV)) {
    python -m venv $VENV
}

$Python = "$VENV\\Scripts\\python.exe"
& $Python -m pip install --upgrade pip
& $Python -m pip install -r "$PSScriptRoot\\requirements.txt"

Write-Host "Starting backend (FastAPI) in new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command`, \"$Python -m uvicorn backend.backend:app --reload --port 8000\""

Write-Host "Starting static file server (http.server) in new window on port 5500..."
Start-Process powershell -ArgumentList "-NoExit", "-Command`, \"$Python -m http.server 5500 --directory '$PSScriptRoot'\""

Write-Host "Backend: http://127.0.0.1:8000"
Write-Host "Frontend: http://127.0.0.1:5500/index.html"
