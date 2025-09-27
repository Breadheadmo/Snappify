#!/bin/bash

# 🚀 Snappy E-commerce Production Deployment Script
# =================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-your-domain.com}"
EMAIL="${SSL_EMAIL:-admin@your-domain.com}"
BACKUP_ENABLED="${BACKUP_ENABLED:-true}"
MONITORING_ENABLED="${MONITORING_ENABLED:-true}"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root!"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env.production exists
    if [[ ! -f ".env.production" ]]; then
        print_error ".env.production file not found. Please create it first."
        exit 1
    fi
    
    # Check if domain name is set
    if [[ "$DOMAIN_NAME" == "your-domain.com" ]]; then
        print_warning "Domain name is not set. Please update DOMAIN_NAME in .env.production"
    fi
    
    print_success "Prerequisites check completed"
}

# Load environment variables
load_environment() {
    print_status "Loading environment variables..."
    
    if [[ -f ".env.production" ]]; then
        export $(cat .env.production | grep -v '#' | xargs)
        print_success "Environment variables loaded"
    else
        print_error ".env.production file not found"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "logs"
        "certbot/conf"
        "certbot/www"
        "monitoring"
        "backup/scripts"
        "server/uploads/profile-pictures"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
    
    print_success "Directories created"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Create initial nginx config without SSL
    print_status "Starting nginx for SSL challenge..."
    docker-compose -f docker-compose.production.yml up -d nginx
    
    # Wait for nginx to start
    sleep 10
    
    # Request SSL certificate
    print_status "Requesting SSL certificate for $DOMAIN_NAME..."
    docker-compose -f docker-compose.production.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN_NAME" \
        -d "www.$DOMAIN_NAME"
    
    if [[ $? -eq 0 ]]; then
        print_success "SSL certificate obtained successfully"
    else
        print_error "Failed to obtain SSL certificate"
        exit 1
    fi
    
    # Restart nginx with SSL
    docker-compose -f docker-compose.production.yml restart nginx
    print_success "SSL setup completed"
}

# Build and deploy application
deploy_application() {
    print_status "Building and deploying application..."
    
    # Pull latest images
    print_status "Pulling latest base images..."
    docker-compose -f docker-compose.production.yml pull
    
    # Build application
    print_status "Building application images..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    print_success "Application deployed successfully"
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    services=("mongodb" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.production.yml ps "$service" | grep -q "Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
}

# Setup monitoring
setup_monitoring() {
    if [[ "$MONITORING_ENABLED" == "true" ]]; then
        print_status "Setting up monitoring..."
        
        # Create Prometheus config
        cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'snappy-backend'
    static_configs:
      - targets: ['backend:5001']
    metrics_path: '/api/metrics'
    
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:8080']
    metrics_path: '/nginx-status'
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF
        
        print_success "Monitoring setup completed"
    fi
}

# Setup backup
setup_backup() {
    if [[ "$BACKUP_ENABLED" == "true" ]]; then
        print_status "Setting up backup system..."
        
        # Create backup script
        cat > backup/scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/app/backups"
MONGO_URI="${MONGO_URI}"

# Create backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Upload to S3 (if configured)
if [[ -n "${S3_BUCKET:-}" ]]; then
    aws s3 cp "$BACKUP_DIR/backup_$DATE.tar.gz" "s3://$S3_BUCKET/backups/"
fi

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete
EOF
        
        chmod +x backup/scripts/backup.sh
        print_success "Backup system setup completed"
    fi
}

# Setup SSL renewal
setup_ssl_renewal() {
    print_status "Setting up SSL certificate renewal..."
    
    # Create renewal script
    cat > scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.production.yml run --rm certbot renew
docker-compose -f docker-compose.production.yml restart nginx
EOF
    
    chmod +x scripts/renew-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * /path/to/snappy/scripts/renew-ssl.sh") | crontab -
    
    print_success "SSL renewal setup completed"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check if application is accessible
    if curl -f -s "https://$DOMAIN_NAME/health" > /dev/null; then
        print_success "Application is accessible via HTTPS"
    else
        print_error "Application is not accessible via HTTPS"
    fi
    
    # Check API endpoint
    if curl -f -s "https://$DOMAIN_NAME/api/health" > /dev/null; then
        print_success "API is accessible"
    else
        print_error "API is not accessible"
    fi
    
    # Check database connection
    if docker-compose -f docker-compose.production.yml exec -T backend node -e "require('./config/database')().then(() => console.log('DB Connected')).catch(e => {console.error('DB Error:', e); process.exit(1)})" 2>/dev/null | grep -q "DB Connected"; then
        print_success "Database connection is working"
    else
        print_error "Database connection failed"
    fi
}

# Display deployment information
display_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Application URLs:"
    echo "  Frontend: https://$DOMAIN_NAME"
    echo "  API: https://$DOMAIN_NAME/api"
    echo "  Admin: https://$DOMAIN_NAME/admin"
    echo ""
    if [[ "$MONITORING_ENABLED" == "true" ]]; then
        echo "Monitoring URLs:"
        echo "  Grafana: http://$DOMAIN_NAME:3000"
        echo "  Prometheus: http://$DOMAIN_NAME:9090"
        echo ""
    fi
    echo "Useful commands:"
    echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  Stop services: docker-compose -f docker-compose.production.yml down"
    echo "  Restart services: docker-compose -f docker-compose.production.yml restart"
    echo "  Update SSL: ./scripts/renew-ssl.sh"
    echo ""
    print_warning "Please update your DNS records to point to this server!"
}

# Main deployment function
main() {
    print_status "🚀 Starting Snappy E-commerce Production Deployment"
    echo ""
    
    check_root
    check_prerequisites
    load_environment
    create_directories
    setup_monitoring
    setup_backup
    deploy_application
    setup_ssl
    setup_ssl_renewal
    run_health_checks
    display_info
    
    print_success "✅ Deployment process completed!"
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
