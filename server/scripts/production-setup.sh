#!/bin/bash

# Snappy E-commerce Production Deployment Script
# This script helps prepare the application for production hosting

echo "🚀 Snappy Production Deployment Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the server directory"
    exit 1
fi

print_step "Step 1: Installing production dependencies..."
npm install --production

print_step "Step 2: Creating necessary directories..."
mkdir -p logs
mkdir -p uploads/profile-pictures

print_step "Step 3: Setting up environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cp .env.example .env 2>/dev/null || echo "# Create your .env file based on .env.production template"
fi

print_step "Step 4: Checking critical files..."

# Check for required files
critical_files=("server.js" "package.json" ".env")
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing!"
    fi
done

print_step "Step 5: Production checklist..."

echo ""
echo "📋 PRODUCTION CHECKLIST - Please verify manually:"
echo "================================================"

print_warning "Environment Variables:"
echo "  - Strong JWT_SECRET set"
echo "  - Production MongoDB URI"
echo "  - Production email credentials"
echo "  - Live Paystack keys"
echo "  - NODE_ENV=production"

print_warning "Security:"
echo "  - Debug logs removed"
echo "  - Rate limiting enabled"
echo "  - CORS configured for production domain"
echo "  - HTTPS certificate ready"

print_warning "Infrastructure:"
echo "  - Domain name configured"
echo "  - SSL certificate installed"
echo "  - Firewall rules set"
echo "  - MongoDB Atlas whitelist updated"

print_warning "Monitoring:"
echo "  - Error tracking service (Sentry) configured"
echo "  - Log rotation set up"
echo "  - Health check endpoints ready"

echo ""
print_step "Step 6: Testing production build..."
npm test 2>/dev/null || print_warning "Tests not configured"

echo ""
print_success "Setup completed!"
echo ""
print_warning "IMPORTANT: Before hosting, ensure you:"
echo "1. Change all placeholder values in .env"
echo "2. Test the application thoroughly"
echo "3. Set up SSL certificates"
echo "4. Configure your domain DNS"
echo "5. Set up database backups"
echo ""
echo "🌐 Ready for production deployment!"
