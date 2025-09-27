#!/bin/bash

# 🚀 Snappy E-commerce Deployment Script
# Run this script on your server to deploy the application

set -e

echo "🚀 Starting Snappy E-commerce Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_warning "Docker installed. Please log out and log back in, then run this script again."
    exit 0
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_warning "Please create .env file with your production variables:"
    echo "MONGO_PASSWORD=your_mongo_password"
    echo "REDIS_PASSWORD=your_redis_password"
    echo "JWT_SECRET=your_jwt_secret"
    echo "EMAIL_USER=your_email"
    echo "EMAIL_PASS=your_email_password"
    echo "PAYSTACK_SECRET_KEY=your_paystack_secret"
    echo "PAYSTACK_PUBLIC_KEY=your_paystack_public"
    echo "PAYSTACK_WEBHOOK_SECRET=your_webhook_secret"
    exit 1
fi

# Create SSL directory
print_status "Creating SSL directory..."
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f "ssl/yourdomain.crt" ] && [ ! -f "ssl/yourdomain.key" ]; then
    print_warning "SSL certificates not found in ssl/ directory"
    print_warning "You need to either:"
    echo "1. Copy your SSL certificates to ssl/ directory, or"
    echo "2. Use Let's Encrypt after deployment"
    echo ""
    echo "For Let's Encrypt (after deployment):"
    echo "sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
fi

# Build and start containers
print_status "Building and starting Docker containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    echo ""
    echo "🌐 Your application should be accessible at:"
    echo "   HTTP:  http://your-domain.com"
    echo "   HTTPS: https://your-domain.com (if SSL configured)"
    echo ""
    echo "📊 Monitor your application:"
    echo "   docker-compose logs -f app"
    echo "   docker-compose ps"
    echo ""
    echo "🔄 To update your application:"
    echo "   git pull origin main"
    echo "   docker-compose down"
    echo "   docker-compose build --no-cache"
    echo "   docker-compose up -d"
else
    print_error "Deployment failed! Check logs:"
    echo "docker-compose logs"
    exit 1
fi

# Final instructions
echo ""
print_warning "📋 Post-deployment checklist:"
echo "□ Configure DNS A records to point to this server"
echo "□ Set up SSL certificate (if not done already)"
echo "□ Test all application functionality"
echo "□ Set up monitoring and backups"
echo "□ Configure MongoDB Atlas (if using external DB)"

print_status "🎉 Deployment complete!"
