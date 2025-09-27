# 🚀 Snappy E-commerce Deployment Script (Windows)
# Run this script on your Windows server to deploy the application

Write-Host "🚀 Starting Snappy E-commerce Deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Docker is installed
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed!"
    Write-Warning "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker Compose is available
if (!(Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose is not available!"
    Write-Warning "Please ensure Docker Desktop is running"
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Error ".env file not found!"
    Write-Warning "Please create .env file with your production variables:"
    Write-Host "MONGO_PASSWORD=your_mongo_password"
    Write-Host "REDIS_PASSWORD=your_redis_password"
    Write-Host "JWT_SECRET=your_jwt_secret"
    Write-Host "EMAIL_USER=your_email"
    Write-Host "EMAIL_PASS=your_email_password"
    Write-Host "PAYSTACK_SECRET_KEY=your_paystack_secret"
    Write-Host "PAYSTACK_PUBLIC_KEY=your_paystack_public"
    Write-Host "PAYSTACK_WEBHOOK_SECRET=your_webhook_secret"
    exit 1
}

# Create SSL directory
Write-Success "Creating SSL directory..."
if (!(Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl"
}

# Check if SSL certificates exist
if (!(Test-Path "ssl\yourdomain.crt") -and !(Test-Path "ssl\yourdomain.key")) {
    Write-Warning "SSL certificates not found in ssl\ directory"
    Write-Warning "You can use Cloudflare or similar service for SSL termination"
}

# Build and start containers
Write-Success "Building and starting Docker containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
Write-Success "Waiting for services to start..."
Start-Sleep -Seconds 30

# Check if containers are running
$runningContainers = docker-compose ps --services --filter status=running
if ($runningContainers) {
    Write-Success "✅ Deployment successful!"
    Write-Host ""
    Write-Host "🌐 Your application should be accessible at:" -ForegroundColor Cyan
    Write-Host "   HTTP:  http://your-domain.com"
    Write-Host "   HTTPS: https://your-domain.com (if SSL configured)"
    Write-Host ""
    Write-Host "📊 Monitor your application:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f app"
    Write-Host "   docker-compose ps"
    Write-Host ""
    Write-Host "🔄 To update your application:" -ForegroundColor Cyan
    Write-Host "   git pull origin main"
    Write-Host "   docker-compose down"
    Write-Host "   docker-compose build --no-cache"
    Write-Host "   docker-compose up -d"
} else {
    Write-Error "Deployment failed! Check logs:"
    Write-Host "docker-compose logs"
    exit 1
}

# Final instructions
Write-Host ""
Write-Warning "📋 Post-deployment checklist:"
Write-Host "□ Configure DNS A records to point to this server"
Write-Host "□ Set up SSL certificate (use Cloudflare for free SSL)"
Write-Host "□ Test all application functionality"
Write-Host "□ Set up monitoring and backups"
Write-Host "□ Configure MongoDB Atlas (recommended for production)"

Write-Success "🎉 Deployment complete!"
