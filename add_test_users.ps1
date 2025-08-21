# PowerShell script to add test users to the database
Write-Host "Adding test users to the database..."

# Function to add a user
function Add-User {
    param(
        [string]$firstName,
        [string]$lastName,
        [string]$dateOfBirth,
        [string]$email,
        [string]$username,
        [string]$password
    )
    
    $body = @{
        firstName = $firstName
        lastName = $lastName
        dateOfBirth = $dateOfBirth
        email = $email
        username = $username
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5001/auth/register" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Added user: $username" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ Failed to add user: $username - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test users to add
$users = @(
    @{ firstName = "Dennis"; lastName = "Johnson"; dateOfBirth = "1995-03-15"; email = "dennis@example.com"; username = "dennis_dev"; password = "password123" },
    @{ firstName = "Melchisedek"; lastName = "King"; dateOfBirth = "1990-07-22"; email = "melchisedek@example.com"; username = "melchisedek_king"; password = "password123" },
    @{ firstName = "Mike"; lastName = "Chen"; dateOfBirth = "1988-05-12"; email = "mike@example.com"; username = "mike_chen"; password = "password123" },
    @{ firstName = "Emma"; lastName = "Davis"; dateOfBirth = "1993-09-30"; email = "emma@example.com"; username = "emma_davis"; password = "password123" },
    @{ firstName = "James"; lastName = "Miller"; dateOfBirth = "1987-12-03"; email = "james@example.com"; username = "james_miller"; password = "password123" },
    @{ firstName = "Lisa"; lastName = "Brown"; dateOfBirth = "1991-04-18"; email = "lisa@example.com"; username = "lisa_brown"; password = "password123" },
    @{ firstName = "David"; lastName = "Lee"; dateOfBirth = "1989-08-25"; email = "david@example.com"; username = "david_lee"; password = "password123" }
)

# Add each user
foreach ($user in $users) {
    Add-User @user
    Start-Sleep -Milliseconds 500  # Small delay between requests
}

Write-Host "`nTest users added successfully!" -ForegroundColor Green
Write-Host "Now testing the users endpoint..." -ForegroundColor Yellow

# Test getting all users
try {
    $allUsers = Invoke-RestMethod -Uri "http://localhost:5001/auth/users" -Method GET
    Write-Host "✅ Users endpoint working. Total users: $($allUsers.Count)" -ForegroundColor Green
    
    Write-Host "`nUsers in database:" -ForegroundColor Cyan
    foreach ($user in $allUsers) {
        Write-Host "  - $($user.firstName) $($user.lastName) (@$($user.username))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
}
