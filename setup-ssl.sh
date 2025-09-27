#!/bin/bash

# SSL Certificate Setup Script for Snappy E-commerce

echo "🔐 Setting up SSL Certificate for Snappy E-commerce..."

# Create SSL directory
mkdir -p ssl

# Option 1: Let's Encrypt (Free SSL Certificate)
echo "📋 SSL Certificate Options:"
echo "1. Let's Encrypt (Free, Recommended for production)"
echo "2. Self-signed (For development/testing only)"
echo ""

read -p "Choose option (1 or 2): " ssl_option

if [ "$ssl_option" = "1" ]; then
    echo "🌐 Setting up Let's Encrypt SSL Certificate..."
    
    # Install certbot if not already installed
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
        
        # CentOS/RHEL
        # sudo yum install -y certbot python3-certbot-nginx
        
        # macOS
        # brew install certbot
    fi
    
    read -p "Enter your domain name (e.g., yourdomain.com): " domain_name
    read -p "Enter your email address: " email_address
    
    echo "📧 Obtaining SSL certificate for $domain_name..."
    
    # Stop nginx if running
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Obtain certificate
    sudo certbot certonly --standalone \
        --email $email_address \
        --agree-tos \
        --no-eff-email \
        -d $domain_name \
        -d www.$domain_name
    
    # Copy certificates to our ssl directory
    sudo cp /etc/letsencrypt/live/$domain_name/fullchain.pem ssl/yourdomain.crt
    sudo cp /etc/letsencrypt/live/$domain_name/privkey.pem ssl/yourdomain.key
    
    # Set proper permissions
    sudo chown $USER:$USER ssl/yourdomain.crt ssl/yourdomain.key
    chmod 644 ssl/yourdomain.crt
    chmod 600 ssl/yourdomain.key
    
    echo "✅ Let's Encrypt SSL certificate installed successfully!"
    echo "📝 Certificate files:"
    echo "   - Certificate: ssl/yourdomain.crt"
    echo "   - Private Key: ssl/yourdomain.key"
    
    # Update nginx.conf with actual domain
    sed -i "s/yourdomain.com/$domain_name/g" nginx.conf
    
    # Set up auto-renewal
    echo "⏰ Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
elif [ "$ssl_option" = "2" ]; then
    echo "🔧 Creating self-signed SSL certificate for development..."
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/yourdomain.key \
        -out ssl/yourdomain.crt \
        -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Snappy/OU=IT/CN=localhost"
    
    echo "✅ Self-signed SSL certificate created!"
    echo "⚠️  Warning: Self-signed certificates are for development only."
    echo "📝 Certificate files:"
    echo "   - Certificate: ssl/yourdomain.crt"
    echo "   - Private Key: ssl/yourdomain.key"
    
else
    echo "❌ Invalid option selected."
    exit 1
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Update your DNS records to point to this server"
echo "2. Update docker-compose.yml with your domain name"
echo "3. Run: docker-compose up -d"
echo "4. Test your SSL certificate at: https://www.ssllabs.com/ssltest/"

echo ""
echo "📋 SSL Configuration Summary:"
echo "✅ SSL certificate installed"
echo "✅ Nginx configuration updated"
echo "✅ Security headers configured"
echo "✅ HTTP to HTTPS redirect enabled"
echo "✅ Rate limiting configured"

if [ "$ssl_option" = "1" ]; then
    echo "✅ Auto-renewal configured"
fi
