#!/bin/bash

# ===========================================
# Initial SSL Certificate Setup Script
# ===========================================
# Run this ONCE on your VPS before starting production docker-compose
# This obtains the initial SSL certificate from Let's Encrypt
# ===========================================

set -e

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "Error: .env.prod file not found"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.prod | xargs)

if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo "Error: DOMAIN and SSL_EMAIL must be set in .env.prod"
    exit 1
fi

echo "========================================"
echo "Let's Encrypt SSL Certificate Setup"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Email: $SSL_EMAIL"
echo ""

# Create certbot directories
mkdir -p certbot/conf
mkdir -p certbot/www

echo "Step 1: Starting temporary Nginx for certificate challenge..."

# Create temporary nginx config for initial certificate
cat > nginx/nginx.init.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'SSL setup in progress';
        add_header Content-Type text/plain;
    }
}
EOF

# Start temporary nginx
docker run -d --name nginx-init \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx.init.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    nginx:stable-alpine

echo "✓ Temporary Nginx started"
echo ""

# Wait for nginx to be ready
sleep 5

echo "Step 2: Obtaining SSL certificate from Let's Encrypt..."
echo ""

# Obtain certificate
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$SSL_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSL certificate obtained successfully!"
else
    echo ""
    echo "✗ Failed to obtain SSL certificate"
    docker stop nginx-init
    docker rm nginx-init
    exit 1
fi

# Stop temporary nginx
echo ""
echo "Step 3: Cleaning up..."
docker stop nginx-init
docker rm nginx-init
rm nginx/nginx.init.conf

echo ""
echo "========================================"
echo "✓ SSL Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start production environment: make prod"
echo "2. Your site will be available at https://$DOMAIN"
echo ""
echo "Note: Certificate auto-renewal is configured in docker-compose.prod.yml"
echo ""
