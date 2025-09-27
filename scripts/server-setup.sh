#!/bin/bash

# 🔧 Server Setup Script for Ubuntu 22.04 LTS
# ============================================

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

# Update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    print_success "System updated"
}

# Install Docker
install_docker() {
    print_status "Installing Docker..."
    
    # Remove old versions
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    print_success "Docker installed"
}

# Install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    # Download latest version
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose installed"
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Update npm to latest version
    sudo npm install -g npm@latest
    
    print_success "Node.js installed"
}

# Install monitoring tools
install_monitoring() {
    print_status "Installing monitoring tools..."
    
    # Install htop, iotop, and other monitoring tools
    sudo apt install -y htop iotop nethogs ncdu tree
    
    print_success "Monitoring tools installed"
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow monitoring ports (optional)
    sudo ufw allow 3000  # Grafana
    sudo ufw allow 9090  # Prometheus
    
    print_success "Firewall configured"
}

# Setup swap file
setup_swap() {
    print_status "Setting up swap file..."
    
    # Check if swap already exists
    if free | awk '/^Swap:/ {exit !$2}'; then
        print_warning "Swap already exists, skipping..."
        return
    fi
    
    # Create 2GB swap file
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Make permanent
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    
    # Optimize swap settings
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
    
    print_success "Swap file created"
}

# Setup SSL tools
setup_ssl_tools() {
    print_status "Installing SSL tools..."
    
    # Install certbot
    sudo apt install -y certbot
    
    print_success "SSL tools installed"
}

# Setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    # Create logrotate config for application logs
    sudo tee /etc/logrotate.d/snappy << EOF
/home/*/snappy/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
    
    print_success "Log rotation configured"
}

# Optimize system for production
optimize_system() {
    print_status "Optimizing system for production..."
    
    # Increase file limits
    sudo tee -a /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF
    
    # Optimize network settings
    sudo tee -a /etc/sysctl.conf << EOF
# Network optimizations
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq
EOF
    
    # Apply settings
    sudo sysctl -p
    
    print_success "System optimized"
}

# Create application user
create_app_user() {
    print_status "Creating application user..."
    
    # Create snappy user if it doesn't exist
    if ! id "snappy" &>/dev/null; then
        sudo useradd -m -s /bin/bash snappy
        sudo usermod -aG docker snappy
        print_success "User 'snappy' created"
    else
        print_warning "User 'snappy' already exists"
    fi
}

# Setup directory structure
setup_directories() {
    print_status "Setting up directory structure..."
    
    # Create application directory
    sudo mkdir -p /opt/snappy
    sudo chown snappy:snappy /opt/snappy
    
    # Create backup directory
    sudo mkdir -p /opt/backups
    sudo chown snappy:snappy /opt/backups
    
    print_success "Directories created"
}

# Install security updates automatically
setup_auto_updates() {
    print_status "Setting up automatic security updates..."
    
    sudo apt install -y unattended-upgrades
    
    # Configure automatic updates
    sudo tee /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    
    print_success "Automatic updates configured"
}

# Display completion info
display_completion_info() {
    print_success "🎉 Server setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Reboot the server to apply all changes:"
    echo "   sudo reboot"
    echo ""
    echo "2. Clone your application repository:"
    echo "   git clone https://github.com/your-username/snappy.git"
    echo ""
    echo "3. Configure environment variables:"
    echo "   cp .env.example .env.production"
    echo "   nano .env.production"
    echo ""
    echo "4. Run the deployment script:"
    echo "   ./scripts/deploy.sh"
    echo ""
    echo "Installed software versions:"
    echo "  Docker: $(docker --version)"
    echo "  Docker Compose: $(docker-compose --version)"
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
    echo ""
    print_warning "Please log out and log back in for group changes to take effect!"
}

# Main setup function
main() {
    print_status "🚀 Starting server setup for Snappy E-commerce"
    echo ""
    
    update_system
    install_docker
    install_docker_compose
    install_nodejs
    install_monitoring
    setup_firewall
    setup_swap
    setup_ssl_tools
    setup_log_rotation
    optimize_system
    create_app_user
    setup_directories
    setup_auto_updates
    display_completion_info
    
    print_success "✅ Server setup completed!"
}

# Run main function
main "$@"
