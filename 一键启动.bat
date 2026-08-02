@echo off
chcp 65001 >nul
setlocal

set "SCRIPT_DIR=%~dp0"
set "START_SCRIPT=%SCRIPT_DIR%scripts\start-dev.ps1"

if not exist "%START_SCRIPT%" (
  echo [ERROR] Missing startup script: %START_SCRIPT%
  pause
  exit /b 1
)

where pwsh >nul 2>nul
if errorlevel 1 goto windows_powershell
pwsh -NoLogo -NoExit -ExecutionPolicy Bypass -File "%START_SCRIPT%"
exit /b %ERRORLEVEL%

:windows_powershell
where powershell >nul 2>nul
if errorlevel 1 goto no_powershell
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%START_SCRIPT%"
exit /b %ERRORLEVEL%

:no_powershell
echo [ERROR] PowerShell was not found. Please install PowerShell 7 or use Windows PowerShell.
pause
exit /b 1
