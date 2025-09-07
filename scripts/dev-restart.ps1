# PowerShell script to restart development server cleanly
Write-Host "Stopping any running Next.js processes..." -ForegroundColor Yellow

# Kill any node processes running Next.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
