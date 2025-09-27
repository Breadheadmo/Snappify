#!/bin/bash

# MongoDB Production Security Setup Script
# This script helps secure your MongoDB Atlas database for production

echo "🔒 MongoDB Production Security Setup"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo ""
print_step "MongoDB Atlas Production Security Checklist:"
echo ""

print_warning "1. CREATE NEW DATABASE USER"
echo "   • Go to Database Access in MongoDB Atlas"
echo "   • Click 'Add New Database User'"
echo "   • Username: snappy-prod-user"
echo "   • Password: Generate a strong password (20+ characters)"
echo "   • Database User Privileges: Read and write to any database"
echo "   • IP Access List: Restrict to your server's IP addresses"

print_warning "2. UPDATE CONNECTION STRING"
echo "   Old: mongodb+srv://breadheadmo:Sabbathworld3500@cluster..."
echo "   New: mongodb+srv://snappy-prod-user:NEW_STRONG_PASSWORD@cluster..."
echo "   Database: Snappy-Production (create new production database)"

print_warning "3. CONFIGURE NETWORK ACCESS"
echo "   • Go to Network Access in MongoDB Atlas"
echo "   • Remove 0.0.0.0/0 (Allow access from anywhere)"
echo "   • Add specific IP addresses:"
echo "     - Your server's production IP"
echo "     - Your deployment platform's IP ranges"

print_warning "4. ENABLE DATABASE MONITORING"
echo "   • Go to Monitoring tab"
echo "   • Set up alerts for:"
echo "     - High CPU usage"
echo "     - High memory usage"
echo "     - Connection spikes"
echo "     - Slow operations"

print_warning "5. CONFIGURE BACKUP"
echo "   • Go to Backup tab"
echo "   • Enable Continuous Cloud Backup"
echo "   • Set retention policy (recommended: 7 days)"
echo "   • Test restore procedure"

print_warning "6. UPDATE ENVIRONMENT VARIABLES"
echo "   Update your .env file with:"
echo "   MONGO_URI=mongodb+srv://snappy-prod-user:NEW_PASSWORD@cluster.../Snappy-Production"

echo ""
print_step "Security Best Practices:"
echo ""

print_success "Database Security:"
echo "  • Use strong, unique passwords (20+ characters)"
echo "  • Enable IP whitelisting"
echo "  • Use separate database for production"
echo "  • Enable audit logging"
echo "  • Regular security updates"

print_success "Connection Security:"
echo "  • Always use SSL/TLS connections"
echo "  • Use connection pooling"
echo "  • Set connection timeouts"
echo "  • Monitor connection metrics"

print_success "Data Security:"
echo "  • Enable encryption at rest"
echo "  • Use field-level encryption for sensitive data"
echo "  • Regular backup testing"
echo "  • Data retention policies"

echo ""
print_step "Example Production Connection String:"
echo ""
echo "mongodb+srv://snappy-prod-user:Xy9#mK$pL2@nQ7vB8cD4eF6gH@cluster0.rks24ra.mongodb.net/Snappy-Production?retryWrites=true&w=majority&appName=Cluster0"

echo ""
print_warning "IMPORTANT REMINDERS:"
echo "• NEVER use the same password as development"
echo "• NEVER commit the new connection string to Git"
echo "• ALWAYS test the connection before going live"
echo "• SET UP monitoring and alerts"
echo "• BACKUP your data before migration"

echo ""
print_success "Complete these steps, then update your .env file!"
echo ""
