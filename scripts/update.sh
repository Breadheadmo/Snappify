#!/bin/bash

# 🔄 Snappy E-commerce Update Script
# ==================================

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
BACKUP_BEFORE_UPDATE="${BACKUP_BEFORE_UPDATE:-true}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"

# Create backup before update
create_backup() {
    if [[ "$BACKUP_BEFORE_UPDATE" == "true" ]]; then
        print_status "Creating backup before update..."
        
        DATE=$(date +%Y%m%d_%H%M%S)
        BACKUP_DIR="./backups/pre-update-$DATE"
        
        mkdir -p "$BACKUP_DIR"
        
        # Backup database
        docker-compose -f docker-compose.production.yml exec -T mongodb mongodump --archive > "$BACKUP_DIR/database.archive"
        
        # Backup uploaded files
        cp -r server/uploads "$BACKUP_DIR/" 2>/dev/null || true
        
        # Backup environment files
        cp .env.production "$BACKUP_DIR/" 2>/dev/null || true
        
        print_success "Backup created at $BACKUP_DIR"
    fi
}

# Pull latest code
pull_latest_code() {
    print_status "Pulling latest code from repository..."
    
    # Stash any local changes
    git stash push -m "Auto-stash before update $(date)"
    
    # Pull latest changes
    git pull origin main
    
    print_success "Latest code pulled"
}

# Update dependencies
update_dependencies() {
    print_status "Updating dependencies..."
    
    # Update backend dependencies
    cd server
    npm ci --only=production
    cd ..
    
    # Update frontend dependencies and rebuild
    cd client
    npm ci
    npm run build
    cd ..
    
    print_success "Dependencies updated"
}

# Update Docker images
update_docker_images() {
    print_status "Updating Docker images..."
    
    # Pull latest base images
    docker-compose -f docker-compose.production.yml pull
    
    # Rebuild application images
    docker-compose -f docker-compose.production.yml build --no-cache
    
    print_success "Docker images updated"
}

# Perform rolling update
rolling_update() {
    print_status "Performing rolling update..."
    
    # Update backend first
    print_status "Updating backend service..."
    docker-compose -f docker-compose.production.yml up -d --no-deps backend
    
    # Wait for backend to be healthy
    wait_for_service_health "backend"
    
    # Update frontend
    print_status "Updating frontend service..."
    docker-compose -f docker-compose.production.yml up -d --no-deps frontend
    
    # Wait for frontend to be healthy
    wait_for_service_health "frontend"
    
    # Update nginx (if needed)
    docker-compose -f docker-compose.production.yml up -d --no-deps nginx
    
    print_success "Rolling update completed"
}

# Wait for service to be healthy
wait_for_service_health() {
    local service=$1
    local timeout=$HEALTH_CHECK_TIMEOUT
    local elapsed=0
    
    print_status "Waiting for $service to be healthy..."
    
    while [[ $elapsed -lt $timeout ]]; do
        if docker-compose -f docker-compose.production.yml ps "$service" | grep -q "Up (healthy)"; then
            print_success "$service is healthy"
            return 0
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    print_error "$service failed to become healthy within $timeout seconds"
    return 1
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if migrations are needed
    if [[ -d "server/migrations" ]]; then
        docker-compose -f docker-compose.production.yml exec -T backend npm run migrate
        print_success "Database migrations completed"
    else
        print_warning "No migrations directory found, skipping..."
    fi
}

# Clear caches
clear_caches() {
    print_status "Clearing caches..."
    
    # Clear Redis cache
    docker-compose -f docker-compose.production.yml exec -T redis redis-cli FLUSHALL
    
    # Clear application cache
    docker-compose -f docker-compose.production.yml exec -T backend node -e "
        const redis = require('redis');
        const client = redis.createClient(process.env.REDIS_URL);
        client.flushall(() => {
            console.log('Cache cleared');
            client.quit();
        });
    " 2>/dev/null || true
    
    print_success "Caches cleared"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    local domain="${DOMAIN_NAME:-localhost}"
    
    # Check frontend
    if curl -f -s "https://$domain/health" > /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    # Check API
    if curl -f -s "https://$domain/api/health" > /dev/null; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        return 1
    fi
    
    # Check database connectivity
    if docker-compose -f docker-compose.production.yml exec -T backend node -e "
        require('./config/database')().then(() => {
            console.log('Database connected');
            process.exit(0);
        }).catch(e => {
            console.error('Database error:', e.message);
            process.exit(1);
        });
    " > /dev/null 2>&1; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
        return 1
    fi
    
    print_success "All health checks passed"
}

# Rollback to previous version
rollback() {
    print_error "Update failed, initiating rollback..."
    
    # Get previous commit
    local previous_commit=$(git log --oneline -n 2 | tail -n 1 | cut -d' ' -f1)
    
    print_status "Rolling back to commit: $previous_commit"
    
    # Reset to previous commit
    git reset --hard "$previous_commit"
    
    # Rebuild and restart services
    docker-compose -f docker-compose.production.yml build --no-cache
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    sleep 30
    
    if run_health_checks; then
        print_success "Rollback completed successfully"
    else
        print_error "Rollback failed! Manual intervention required."
        exit 1
    fi
}

# Send notification (if configured)
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🚀 Snappy Update $status: $message\"}" \
            2>/dev/null || true
    fi
    
    if [[ -n "${EMAIL_NOTIFICATION:-}" ]]; then
        echo "$message" | mail -s "Snappy Update $status" "$EMAIL_NOTIFICATION" 2>/dev/null || true
    fi
}

# Main update function
main() {
    print_status "🚀 Starting Snappy E-commerce update process"
    echo ""
    
    # Load environment variables
    if [[ -f ".env.production" ]]; then
        export $(cat .env.production | grep -v '#' | xargs)
    fi
    
    # Create backup
    create_backup
    
    # Start update process
    if pull_latest_code && \
       update_dependencies && \
       update_docker_images && \
       rolling_update && \
       run_migrations && \
       clear_caches && \
       run_health_checks; then
        
        print_success "✅ Update completed successfully!"
        send_notification "SUCCESS" "Application updated successfully"
        
        # Display update info
        echo ""
        echo "Update Summary:"
        echo "  Commit: $(git log --oneline -n 1)"
        echo "  Time: $(date)"
        echo "  Services: All healthy"
        echo ""
        
    else
        print_error "❌ Update failed!"
        send_notification "FAILED" "Application update failed, initiating rollback"
        rollback
    fi
}

# Handle script interruption
trap 'print_error "Update interrupted!"; rollback; exit 1' INT TERM

# Parse command line arguments
case "${1:-}" in
    "--no-backup")
        BACKUP_BEFORE_UPDATE="false"
        shift
        ;;
    "--help"|"-h")
        echo "Usage: $0 [--no-backup] [--help]"
        echo ""
        echo "Options:"
        echo "  --no-backup    Skip creating backup before update"
        echo "  --help, -h     Show this help message"
        exit 0
        ;;
esac

# Run main function
main "$@"
