# scripts/deploy.ps1  (Windows PowerShell 5.1). Deploys the current GitHub main to srv1033016 and runs the production smoke test.
param(
  [string]$VpsHost = "82.197.95.191",
  [string]$User = "root",
  [string]$Key = "$env:USERPROFILE\.aignite-secrets\ndflk-deploy\ndflk_deploy_ed25519"
)
$ErrorActionPreference = "Stop"
ssh -i $Key -o StrictHostKeyChecking=accept-new "$User@$VpsHost" "bash -s" < "$PSScriptRoot\..\deploy\deploy.sh"
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed" -ForegroundColor Red; exit 1 }
Write-Host "Running public smoke test against https://ndflk.org" -ForegroundColor Cyan
& "$PSScriptRoot\smoke.ps1" -Base "https://ndflk.org" -Production
