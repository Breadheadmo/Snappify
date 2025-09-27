#!/bin/bash

# 🔐 SSL Certificate Renewal Script for Snappy E-commerce
# =======================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-your-domain.com}"
EMAIL="${SSL_EMAIL:-admin@your-domain.com}"
COMPOSE_FILE="docker-compose.production.yml"
LOG_FILE="logs/ssl-renewal.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check certificate expiry
check_certificate_expiry() {
    print_status "Checking certificate expiry for $DOMAIN_NAME..."
    
    # Get certificate expiry date
    expiry_date=$(echo | openssl s_client -servername "$DOMAIN_NAME" -connect "$DOMAIN_NAME:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    expiry_epoch=$(date -d "$expiry_date" +%s)
    current_epoch=$(date +%s)
    days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    print_status "Certificate expires in $days_until_expiry days"
    log "Certificate expires in $days_until_expiry days"
    
    # Return 0 if renewal needed (less than 30 days), 1 if not needed
    if [[ $days_until_expiry -lt 30 ]]; then
        print_warning "Certificate renewal needed"
        return 0
    else
        print_success "Certificate renewal not needed yet"
        return 1
    fi
}

# Renew certificate
renew_certificate() {
    print_status "Renewing SSL certificate..."
    log "Starting certificate renewal"
    
    # Run certbot renewal
    if docker-compose -f "$COMPOSE_FILE" run --rm certbot renew --quiet; then
        print_success "Certificate renewed successfully"
        log "Certificate renewed successfully"
        return 0
    else
        print_error "Certificate renewal failed"
        log "Certificate renewal failed"
        return 1
    fi
}

# Reload nginx
reload_nginx() {
    print_status "Reloading nginx to apply new certificate..."
    
    if docker-compose -f "$COMPOSE_FILE" exec nginx nginx -s reload; then
        print_success "Nginx reloaded successfully"
        log "Nginx reloaded successfully"
    else
        print_warning "Failed to reload nginx, restarting container..."
        docker-compose -f "$COMPOSE_FILE" restart nginx
        log "Nginx container restarted"
    fi
}

# Test SSL configuration
test_ssl_config() {
    print_status "Testing SSL configuration..."
    
    # Wait a moment for nginx to fully reload
    sleep 5
    
    # Test HTTPS connection
    if curl -f -s --max-time 10 "https://$DOMAIN_NAME/health" > /dev/null; then
        print_success "SSL configuration test passed"
        log "SSL configuration test passed"
        return 0
    else
        print_error "SSL configuration test failed"
        log "SSL configuration test failed"
        return 1
    fi
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Webhook notification
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🔐 SSL Renewal $status: $message\"}" \
            2>/dev/null || true
    fi
    
    # Email notification
    if [[ -n "${EMAIL_NOTIFICATION:-}" ]]; then
        echo "$message" | mail -s "SSL Renewal $status - $DOMAIN_NAME" "$EMAIL_NOTIFICATION" 2>/dev/null || true
    fi
    
    log "Notification sent: $status - $message"
}

# Backup current certificates
backup_certificates() {
    print_status "Backing up current certificates..."
    
    local backup_dir="./backups/ssl-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    if [[ -d "./certbot/conf/live/$DOMAIN_NAME" ]]; then
        cp -r "./certbot/conf/live/$DOMAIN_NAME" "$backup_dir/"
        print_success "Certificates backed up to $backup_dir"
        log "Certificates backed up to $backup_dir"
    else
        print_warning "No existing certificates found to backup"
        log "No existing certificates found to backup"
    fi
}

# Main renewal function
main() {
    print_status "🔐 Starting SSL certificate renewal check"
    log "SSL renewal script started"
    
    # Load environment variables
    if [[ -f ".env.production" ]]; then
        export $(cat .env.production | grep -v '#' | xargs)
        DOMAIN_NAME="${DOMAIN_NAME:-$DOMAIN_NAME}"
        EMAIL="${EMAIL:-$SSL_EMAIL}"
    fi
    
    # Create log directory
    mkdir -p logs
    
    # Check if renewal is needed
    if check_certificate_expiry; then
        # Backup current certificates
        backup_certificates
        
        # Renew certificate
        if renew_certificate; then
            # Reload nginx
            reload_nginx
            
            # Test configuration
            if test_ssl_config; then
                send_notification "SUCCESS" "SSL certificate renewed and tested successfully for $DOMAIN_NAME"
                print_success "✅ SSL certificate renewal completed successfully!"
            else
                send_notification "PARTIAL" "SSL certificate renewed but configuration test failed for $DOMAIN_NAME"
                print_warning "⚠️ SSL certificate renewed but test failed"
            fi
        else
            send_notification "FAILED" "SSL certificate renewal failed for $DOMAIN_NAME"
            print_error "❌ SSL certificate renewal failed!"
            exit 1
        fi
    else
        print_success "✅ SSL certificate renewal not needed"
        log "SSL certificate renewal not needed"
    fi
}

# Handle script interruption
trap 'print_error "SSL renewal interrupted!"; log "SSL renewal script interrupted"; exit 1' INT TERM

# Parse command line arguments
case "${1:-}" in
    "--force"|"-f")
        # Force renewal regardless of expiry date
        check_certificate_expiry() { return 0; }
        print_warning "Forcing certificate renewal..."
        ;;
    "--help"|"-h")
        echo "Usage: $0 [--force] [--help]"
        echo ""
        echo "Options:"
        echo "  --force, -f    Force renewal regardless of expiry date"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "This script checks SSL certificate expiry and renews if needed (< 30 days)."
        echo "It should be run via cron job for automatic renewal."
        echo ""
        echo "Example cron entry (daily at 2 AM):"
        echo "0 2 * * * /path/to/snappy/scripts/renew-ssl.sh"
        exit 0
        ;;
    "--test")
        # Test mode - just check expiry
        if check_certificate_expiry; then
            echo "Certificate needs renewal"
            exit 0
        else
            echo "Certificate does not need renewal"
            exit 1
        fi
        ;;
esac

# Run main function
main "$@"
