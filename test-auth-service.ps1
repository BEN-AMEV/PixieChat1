# PixieChat Authentication Service Test Script
Write-Host "🚀 PixieChat Auth Service - Test Suite" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Base URL
$baseUrl = "http://localhost:5001/auth"

# Test health endpoint
Write-Host "`n📡 Testing Service Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/hello" -Method GET
    Write-Host "✅ Service is healthy: $healthResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Service is not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Function to register a user
function Register-User {
    param(
        [string]$firstName,
        [string]$lastName,
        [string]$email,
        [string]$username,
        [string]$password,
        [string]$dateOfBirth,
        [string]$avatarId = "1"
    )
    
    $userData = @{
        firstName = $firstName
        lastName = $lastName
        email = $email
        username = $username
        password = $password
        dateOfBirth = $dateOfBirth
        avatarId = $avatarId
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $userData -ContentType "application/json"
        Write-Host "Success: Registered $firstName $lastName (@$username)" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "Error: Failed to register ${username}: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to login
function Login-User {
    param(
        [string]$username,
        [string]$password
    )
    
    $loginData = @{
        username = $username
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "Success: Login successful for ${username}" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "Error: Login failed for ${username}: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Register test users
Write-Host "`n👥 Registering Test Users..." -ForegroundColor Yellow

$testUsers = @(
    @{ firstName = "Alice"; lastName = "Johnson"; email = "alice@example.com"; username = "alice_j"; password = "password123"; dateOfBirth = "1992-05-15"; avatarId = "2" },
    @{ firstName = "Bob"; lastName = "Smith"; email = "bob@example.com"; username = "bob_smith"; password = "password123"; dateOfBirth = "1988-11-22"; avatarId = "3" },
    @{ firstName = "Carol"; lastName = "Williams"; email = "carol@example.com"; username = "carol_w"; password = "password123"; dateOfBirth = "1995-03-08"; avatarId = "4" },
    @{ firstName = "David"; lastName = "Brown"; email = "david@example.com"; username = "david_b"; password = "password123"; dateOfBirth = "1990-09-12"; avatarId = "6" },
    @{ firstName = "Emma"; lastName = "Davis"; email = "emma@example.com"; username = "emma_d"; password = "password123"; dateOfBirth = "1993-07-30"; avatarId = "7" }
)

$registeredUsers = @()
foreach ($user in $testUsers) {
    $result = Register-User @user
    if ($result) {
        $registeredUsers += $result
    }
    Start-Sleep -Milliseconds 300
}

# Test login with first user
if ($registeredUsers.Count -gt 0) {
    Write-Host "`n🔐 Testing Login..." -ForegroundColor Yellow
    $loginResult = Login-User -username $testUsers[0].username -password $testUsers[0].password
    
    if ($loginResult) {
        Write-Host "🎉 Login test successful!" -ForegroundColor Green
        Write-Host "   Token: $($loginResult.token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   User: $($loginResult.user.firstName) $($loginResult.user.lastName)" -ForegroundColor Gray
    }
}

# Get all users
Write-Host "`n📋 Getting All Users..." -ForegroundColor Yellow
try {
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    Write-Host "✅ Found $($allUsers.Count) users in database:" -ForegroundColor Green
    
    foreach ($user in $allUsers) {
        Write-Host "   • $($user.firstName) $($user.lastName) (@$($user.username)) - Avatar: $($user.avatarId)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
}

# Test search functionality
Write-Host "`n🔍 Testing User Search..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/users/search?query=alice" -Method GET
    Write-Host "Success: Search for alice returned $($searchResults.Count) results" -ForegroundColor Green
    
    foreach ($user in $searchResults) {
        Write-Host "   • $($user.firstName) $($user.lastName) (@$($user.username))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Search test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test Suite Complete!" -ForegroundColor Cyan
Write-Host "   API Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "   H2 Console: http://localhost:5001/h2-console" -ForegroundColor Gray
Write-Host "   Database URL: jdbc:h2:mem:testdb" -ForegroundColor Gray
