# Script para criar repositório no GitHub e fazer push
# Você precisa de um Personal Access Token do GitHub
# Crie em: https://github.com/settings/tokens

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "schoolpool-smart-transport",
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "SchoolPool - Smart Transport Management System with real-time tracking, route optimization, and role-based interfaces",
    
    [Parameter(Mandatory=$false)]
    [switch]$Private = $false
)

$username = "jessefreitasguimaraesnegocios-app"
$repoPath = "C:\Users\jesse\Downloads\schoolpool_-smart-transport (2)"

Write-Host "Criando repositório no GitHub..." -ForegroundColor Green

$body = @{
    name = $RepoName
    description = $Description
    private = $Private.IsPresent
} | ConvertTo-Json

$headers = @{
    Authorization = "token $GitHubToken"
    Accept = "application/vnd.github.v3+json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "Repositório criado com sucesso!" -ForegroundColor Green
    Write-Host "URL: $($response.html_url)" -ForegroundColor Cyan
    
    # Adicionar remote e fazer push
    Set-Location $repoPath
    git remote add origin $response.clone_url
    git branch -M main
    git push -u origin main
    
    Write-Host "`nCódigo enviado para o GitHub com sucesso!" -ForegroundColor Green
    Write-Host "Repositório: $($response.html_url)" -ForegroundColor Cyan
} catch {
    Write-Host "Erro ao criar repositório: $_" -ForegroundColor Red
    Write-Host "`nVocê pode criar manualmente em: https://github.com/new" -ForegroundColor Yellow
    Write-Host "Depois execute:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/$username/$RepoName.git" -ForegroundColor Yellow
    Write-Host "  git branch -M main" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Yellow
}

