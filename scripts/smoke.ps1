# scripts/smoke.ps1  (Windows PowerShell 5.1)
# Runs the smoke test against a base URL. Local Docker by default; pass -Base https://ndflk.org for production.
param(
  [string]$Base = $(if ($env:NDF_BASE_URL) { $env:NDF_BASE_URL } else { "http://localhost:3000" }),
  [string]$AdminToken = $env:NDF_ADMIN_TOKEN,
  [int]$ExpectedTables = 14,
  [switch]$Production
)
$ErrorActionPreference = "Stop"
$env:NDF_BASE_URL = $Base
$env:NDF_ADMIN_TOKEN = $AdminToken
$env:EXPECTED_TABLES = $ExpectedTables
$tables = $null
if (-not $Production) {
  $tables = (docker compose exec -T db psql -U ndf -d ndf -tAc "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'").Trim()
  $docRows = (docker compose exec -T db psql -U ndf -d ndf -tAc "select count(*) from documents").Trim()
  Write-Host "db tables=$tables documents=$docRows"
}
if ($tables) { node "$PSScriptRoot\smoke.mjs" --tables $tables } else { node "$PSScriptRoot\smoke.mjs" }
exit $LASTEXITCODE
