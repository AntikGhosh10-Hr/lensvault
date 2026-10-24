@echo off
title LensVault Studio - Development Server
cd /d "%~dp0"

echo ===================================================
echo   LensVault Studio - Production Photography Portal
echo   Built for Boss
echo ===================================================
echo.

echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js from https://nodejs.org or open demo.html directly.
    pause
    exit /b
)

echo [1/2] Installing dependencies...
call npm install

echo.
echo [2/2] Starting Next.js Dev Server...
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000
call npm run dev

pause
