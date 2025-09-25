# ABUAD Farms - Windows Setup and Run Script (PowerShell)
Write-Host "🚀 ABUAD Farms - Complete Setup Script (Windows)" -ForegroundColor Cyan

# --- CONFIGURATION (change these values as needed) ---
$DB_NAME = "abuad_farms"
$DB_USER = "postgres"
$DB_PASSWORD = "YourPostgresPasswordHere"
$JWT_SECRET = "your_super_secret_jwt"
$PAYSTACK_SECRET_KEY = "sk_test_xxxxxxxxxxx"
$PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxx"
$BackendDir = "."
$FrontendDir = "frontend"
# -----------------------------------------------------

function Run-Command($cmd) {
    Write-Host "➡ $cmd" -ForegroundColor Yellow
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Command failed: $cmd" -ForegroundColor Red
        exit 1
    }
}

# Step 1: Check PostgreSQL
Write-Host "`n🔍 Checking PostgreSQL..." -ForegroundColor Yellow
try {
    psql --version
    Write-Host "✅ PostgreSQL found" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    exit 1
}

# Step 2: Create Database if not exists
Write-Host "`n🗄️ Setting up database..." -ForegroundColor Yellow
try {
    $createDbCmd = "psql -U $DB_USER -c `"CREATE DATABASE $DB_NAME;`""
    Invoke-Expression $createDbCmd
    Write-Host "✅ Database created" -ForegroundColor Green
} catch {
    Write-Host "Database may already exist, continuing..." -ForegroundColor DarkYellow
}

# Step 3: Run schema and seed
Write-Host "`n📊 Running database schema..." -ForegroundColor Yellow
if (Test-Path "$BackendDir\database.sql") {
    $schemaCmd = "psql -U $DB_USER -d $DB_NAME -f `"$BackendDir\database.sql`""
    Run-Command $schemaCmd
    Write-Host "✅ Database schema created" -ForegroundColor Green
} else {
    Write-Host "❌ database.sql not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
if (Test-Path "$BackendDir\seed.sql") {
    $seedCmd = "psql -U $DB_USER -d $DB_NAME -f `"$BackendDir\seed.sql`""
    Run-Command $seedCmd
    Write-Host "✅ Database seeded with products" -ForegroundColor Green
} else {
    Write-Host "❌ seed.sql not found" -ForegroundColor Red
    exit 1
}

# Step 4: Create .env file (Fixed variable interpolation)
Write-Host "`n⚙️ Creating backend .env..." -ForegroundColor Yellow
$DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
$envContent = @"
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY=$PAYSTACK_PUBLIC_KEY
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
"@
Set-Content -Path "$BackendDir\.env" -Value $envContent -Encoding UTF8
Write-Host "✅ .env file created" -ForegroundColor Green

# Step 5: Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location $BackendDir
if (Test-Path "package.json") {
    Run-Command "npm install"
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend package.json not found" -ForegroundColor Red
    exit 1
}

# Step 6: Install frontend dependencies
if (Test-Path $FrontendDir) {
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location $FrontendDir
    if (Test-Path "package.json") {
        Run-Command "npm install"
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "⚠️ Frontend directory not found: $FrontendDir" -ForegroundColor Yellow
    Write-Host "Continuing with backend only..." -ForegroundColor Yellow
}

# Step 7: Start servers
Write-Host "`n🚀 Starting servers..." -ForegroundColor Cyan
Write-Host "Backend will start on: http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend will start on: http://localhost:3000" -ForegroundColor Blue

# Start backend in new window
$backendScript = "cd '$BackendDir'; npm run dev; pause"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment then start frontend
Start-Sleep -Seconds 3
if (Test-Path $FrontendDir) {
    $frontendScript = "cd '$FrontendDir'; npm start; pause"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Test Paystack Card Details:" -ForegroundColor Yellow
Write-Host "Card Number: 4084 0840 8408 4081" -ForegroundColor White
Write-Host "Expiry: 12/30" -ForegroundColor White
Write-Host "CVV: 123" -ForegroundColor White
Write-Host "PIN: 1234" -ForegroundColor White
Write-Host "`n🛑 To stop servers: Close the PowerShell windows" -ForegroundColor Yellow