@echo off
:: Fix Execution Policy for Node/NPM/NPX
echo ================================
echo   Fixing PowerShell Execution Policy
echo ================================
echo.

REM This sets execution policy for the current user only
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

echo.
echo ✅ Execution policy has been set to RemoteSigned for the current user.
echo You can now use node, npm, and npx without restrictions.
pause