#!/bin/bash

# ===========================================
# Initial SSL Certificate Setup Script
# ===========================================
# Run this ONCE on your VPS (from the repo root) before starting the production
# docker-compose stack. It obtains the initial Let's Encrypt certificate.
#
# Convention: DOMAIN in .env.prod is the APEX domain (e.g. femsportiva.com),
# NOT the www host. The certificate is issued for BOTH <apex> and www.<apex>,
# and is stored under /etc/letsencrypt/live/<apex>/ — the path that
# nginx/nginx.prod.conf references. If you change the domain, update BOTH
# .env.prod and the hard-coded domain in nginx/nginx.prod.conf.
# ===========================================

set -euo pipefail

# Must run from the repo root (where .env.prod lives)
if [ ! -f ".env.prod" ]; then
    echo "Error: .env.prod not found. Run this script from the repository root."
    exit 1
fi

# Read only the two values we need. We intentionally do NOT source the whole
# .env.prod: it contains WordPress salts that can include shell-significant
# characters (backticks, $, etc.) which sourcing would execute.
DOMAIN="$(grep -E '^DOMAIN=' .env.prod | head -n1 | cut -d= -f2- || echo '')"
SSL_EMAIL="$(grep -E '^SSL_EMAIL=' .env.prod | head -n1 | cut -d= -f2- || echo '')"

if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo "Error: DOMAIN and SSL_EMAIL must be set in .env.prod"
    exit 1
fi

# Normalize to the apex (strip a leading "www." if someone set it), so the cert
# is always issued as <apex> + www.<apex> and stored under live/<apex>/.
BASE_DOMAIN="${DOMAIN#www.}"

echo "========================================"
echo "Let's Encrypt SSL Certificate Setup"
echo "========================================"
echo "Domains: ${BASE_DOMAIN}, www.${BASE_DOMAIN}"
echo "Email:   ${SSL_EMAIL}"
echo ""

# Always clean up the temporary container + config, even on failure/interrupt.
cleanup() {
    docker rm -f nginx-init >/dev/null 2>&1 || true
    rm -f nginx/nginx.init.conf
}
trap cleanup EXIT

mkdir -p certbot/conf certbot/www

echo "Step 1: Starting temporary Nginx for the ACME challenge..."

# Default server — answers the ACME HTTP-01 challenge for any Host header.
cat > nginx/nginx.init.conf <<'EOF'
server {
    listen 80 default_server;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        add_header Content-Type text/plain;
        return 200 'SSL setup in progress';
    }
}
EOF

docker run -d --name nginx-init \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx.init.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    nginx:1.28-alpine

echo "✓ Temporary Nginx started"
echo ""

# Give nginx a moment to come up.
sleep 5

echo "Step 2: Obtaining SSL certificate from Let's Encrypt..."
echo ""

# The cert directory is named after the FIRST -d, so apex goes first to match
# the live/<apex>/ path referenced in nginx/nginx.prod.conf.
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot:v3.1.0 certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$SSL_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$BASE_DOMAIN" \
    -d "www.$BASE_DOMAIN"

# With `set -e`, reaching here means certbot succeeded.
echo ""
echo "✓ SSL certificate obtained successfully!"
echo ""
echo "========================================"
echo "✓ SSL Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start production environment: make prod"
echo "2. Your site will be available at https://www.${BASE_DOMAIN}"
echo ""
echo "Note: Certificate auto-renewal is configured in docker-compose.prod.yml"
