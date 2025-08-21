# PixieChat Authentication Service Test Script
Write-Host "PixieChat Auth Service - Test Suite" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5001/auth"

# Test health endpoint
Write-Host "`nTesting Service Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/hello" -Method GET
    Write-Host "SUCCESS: Service is healthy - $healthResponse" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Service is not responding - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Register a test user
Write-Host "`nRegistering Test User..." -ForegroundColor Yellow
$userData = @{
    firstName = "Alice"
    lastName = "Johnson"
    email = "alice@example.com"
    username = "alice_j"
    password = "password123"
    dateOfBirth = "1992-05-15"
    avatarId = "2"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "SUCCESS: User registered - Alice Johnson (alice_j)" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "INFO: User might already exist or registration failed" -ForegroundColor Yellow
}

# Test login
Write-Host "`nTesting Login..." -ForegroundColor Yellow
$loginData = @{
    username = "alice_j"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "SUCCESS: Login successful for alice_j" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "User: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Login failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Get all users
Write-Host "`nGetting All Users..." -ForegroundColor Yellow
try {
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    Write-Host "SUCCESS: Found $($allUsers.Count) users in database:" -ForegroundColor Green
    
    foreach ($user in $allUsers) {
        Write-Host "  - $($user.firstName) $($user.lastName) (@$($user.username)) - Avatar: $($user.avatarId)" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: Failed to get users - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest Suite Complete!" -ForegroundColor Cyan
Write-Host "API Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "H2 Console: http://localhost:5001/h2-console" -ForegroundColor Gray
Write-Host "Database URL: jdbc:h2:mem:testdb" -ForegroundColor Gray
