$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $projectRoot

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-PortAvailable {
  param([int]$Port)

  $listener = $null
  try {
    $address = [System.Net.IPAddress]::Parse('127.0.0.1')
    $listener = [System.Net.Sockets.TcpListener]::new($address, $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($null -ne $listener) {
      $listener.Stop()
    }
  }
}

function Get-AvailablePort {
  foreach ($port in 5173..5199) {
    if (Test-PortAvailable -Port $port) {
      return $port
    }
  }

  throw 'No available port found in range 5173-5199.'
}

Write-Host "DLUT GPA Calculator - local startup" -ForegroundColor Green
Write-Host "Project: $projectRoot"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host '[ERROR] npm was not found. Install Node.js 18+ first, then run this launcher again.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Test-Path (Join-Path $projectRoot 'node_modules'))) {
  Write-Step 'Installing dependencies'
  & npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host '[ERROR] npm install failed.' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit $LASTEXITCODE
  }
}

$port = Get-AvailablePort
$url = "http://localhost:$port/"

Write-Step "Starting development server on $url"
Write-Host 'The browser will open automatically. Keep this window open while using the app.'

Start-Job -ScriptBlock {
  param([string]$TargetUrl)
  Start-Sleep -Seconds 2
  Start-Process $TargetUrl
} -ArgumentList $url | Out-Null

& npm run dev -- --host 127.0.0.1 --port $port
$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
  Write-Host 'Development server stopped.' -ForegroundColor Yellow
} else {
  Write-Host "[ERROR] Development server exited with code $exitCode." -ForegroundColor Red
}

Read-Host 'Press Enter to close'
exit $exitCode
