$services = @(
    @{ name = "auth-service"; cmd = "node"; args = "index.js" },
    @{ name = "station-service"; cmd = "node"; args = "index.js" },
    @{ name = "alert-service"; cmd = "node"; args = "index.js" },
    @{ name = "favorite-service"; cmd = "node"; args = "index.js" },
    @{ name = "api-gateway"; cmd = "node"; args = "index.js" },
    @{ name = "frontend"; cmd = "npm.cmd"; args = "run dev" }
)

foreach ($service in $services) {
    if (Test-Path ".\$($service.name)") {
        Write-Host "Uruchamianie $($service.name)..." -ForegroundColor Green
        Start-Process -FilePath $service.cmd -ArgumentList $service.args -WorkingDirectory ".\$($service.name)"
    }
}
Write-Host "Gotowe! Serwisy działają w nowych oknach." -ForegroundColor Cyan
