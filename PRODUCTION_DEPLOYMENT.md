# Production Deployment Guide

## Domain Configuration

**Production Domain:** www.femsportiva.com

## Pre-Deployment Checklist

### 1. Environment Variables (`.env.prod`)

The production environment file has been configured with your domain. Before deployment, you **MUST** complete these steps:

#### Required Actions:

1. **Generate Strong Database Passwords**

   ```bash
   # Replace these placeholders in .env.prod:
   MYSQL_ROOT_PASSWORD=CHANGE_ME_STRONG_ROOT_PASSWORD
   MYSQL_PASSWORD=CHANGE_ME_STRONG_USER_PASSWORD
   WORDPRESS_DB_PASSWORD=CHANGE_ME_STRONG_USER_PASSWORD
   ```

   Generate strong passwords using:

   ```bash
   openssl rand -base64 32
   ```

2. **Generate WordPress Security Keys**
   - Visit: https://api.wordpress.org/secret-key/1.1/salt/
   - Copy ALL 8 keys and replace them in `.env.prod`:
     - WORDPRESS_AUTH_KEY
     - WORDPRESS_SECURE_AUTH_KEY
     - WORDPRESS_LOGGED_IN_KEY
     - WORDPRESS_NONCE_KEY
     - WORDPRESS_AUTH_SALT
     - WORDPRESS_SECURE_AUTH_SALT
     - WORDPRESS_LOGGED_IN_SALT
     - WORDPRESS_NONCE_SALT

3. **Update SSL Email (Optional)**
   ```env
   SSL_EMAIL=admin@femsportiva.com
   ```
   Change to your actual admin email for Let's Encrypt notifications.

### 2. DNS Configuration

Point your domain to your VPS:

```
Type    Name                Value                   TTL
A       www.femsportiva.com YOUR_VPS_IP_ADDRESS    3600
A       femsportiva.com     YOUR_VPS_IP_ADDRESS    3600
```

**Note:** Make sure both www and non-www records point to your VPS.

### 3. Server Preparation - Initial VPS Setup

Once you SSH into your fresh Hetzner VPS, run these commands:

#### Step 1: Update System

```bash
# Update package list and upgrade existing packages
apt update && apt upgrade -y
```

#### Step 2: Install Docker

```bash
# Install dependencies
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
apt update

# Install Docker
apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
```

#### Step 3: Install Docker Compose

```bash
# Download Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker compose version
```

#### Step 4: Configure Firewall

```bash
# Enable UFW firewall
ufw --force enable

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check firewall status
ufw status
```

#### Step 5: Install Additional Tools (Optional but Recommended)

```bash
# Install useful tools
apt install -y git nano htop curl wget unzip

# Install certbot (for SSL certificate management)
apt install -y certbot
```

#### Step 6: Create Project Directory

```bash
# Create directory for your project
mkdir -p /var/www
cd /var/www
```

#### Step 7: Verify Everything is Ready

```bash
# Check Docker
docker --version
docker compose version

# Check ports are free
netstat -tulpn | grep ':80\|:443'

# Check firewall
ufw status
```

You should see:
- Docker version 24.0+ 
- Docker Compose version 2.20+
- Ports 80 and 443 should be empty (nothing running)
- Firewall showing ports 22, 80, 443 as allowed

## Deployment Steps

### Step 1: Transfer Files to VPS

```bash
# From your local machine
scp -r /path/to/vps-femsportiva root@YOUR_VPS_IP:/var/www/
```

Or use Git:

```bash
# On VPS
cd /var/www
git clone YOUR_REPOSITORY_URL vps-femsportiva
cd vps-femsportiva
```

### Step 2: Copy Environment File

```bash
# On VPS
cd /var/www/vps-femsportiva
cp .env.prod .env
```

### Step 3: Update .env with Secrets

```bash
nano .env
# Update all CHANGE_ME and GENERATE_UNIQUE_KEY values
```

### Step 4: Build and Start Services

```bash
# Build production containers
docker compose -f docker-compose.prod.yml build

# Start services in detached mode
docker compose -f docker-compose.prod.yml up -d
```

### Step 5: Initialize SSL Certificates

```bash
# Run SSL initialization script
./scripts/init-ssl.sh
```

This will:

- Request SSL certificates from Let's Encrypt
- Configure Nginx with HTTPS
- Set up automatic certificate renewal

### Step 6: Verify Deployment

1. **Check containers are running:**

   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. **Check logs:**

   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

3. **Test WordPress admin:**
   - Visit: https://www.femsportiva.com/wp/wp-admin
   - Complete WordPress setup if first deployment

4. **Test frontend:**
   - Visit: https://www.femsportiva.com

## Environment Variables Reference

### Configured for Production:

| Variable                            | Value                       | Purpose                     |
| ----------------------------------- | --------------------------- | --------------------------- |
| `WORDPRESS_URL`                     | https://www.femsportiva.com | Public WordPress URL        |
| `WORDPRESS_INTERNAL_URL`            | http://wordpress            | Internal Docker network URL |
| `NEXT_PUBLIC_WORDPRESS_API_URL`     | http://wordpress/wp-json    | Next.js SSR API calls       |
| `NEXT_PUBLIC_WORDPRESS_URL`         | https://www.femsportiva.com | Client-side WordPress URL   |
| `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX` | /wp                         | WordPress subdirectory      |
| `NEXT_PUBLIC_SITE_URL`              | https://www.femsportiva.com | Public site URL             |
| `DOMAIN`                            | www.femsportiva.com         | Nginx SSL domain            |
| `SSL_EMAIL`                         | admin@femsportiva.com       | Let's Encrypt contact       |

## Post-Deployment

### 1. WordPress Configuration

After first deployment, configure WordPress:

1. **Login to WordPress Admin:**
   - URL: https://www.femsportiva.com/wp/wp-admin

2. **Settings → General:**
   - WordPress Address (URL): `https://www.femsportiva.com/wp`
   - Site Address (URL): `https://www.femsportiva.com`

3. **Settings → Permalinks:**
   - Select "Post name" structure
   - Save changes

### 2. SSL Verification

Verify SSL certificate is working:

```bash
# Check certificate
openssl s_client -connect www.femsportiva.com:443 -servername www.femsportiva.com
```

### 3. Monitor Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f wordpress
docker compose -f docker-compose.prod.yml logs -f nginx
```

### 4. Backup Setup

Set up automated backups:

```bash
# Add to crontab
crontab -e

# Add these lines:
# Daily database backup at 2 AM
0 2 * * * /var/www/vps-femsportiva/scripts/backup-db.sh

# Weekly full backup at 3 AM on Sundays
0 3 * * 0 tar -czf /backups/site-$(date +\%Y\%m\%d).tar.gz /var/www/vps-femsportiva
```

## Troubleshooting

### SSL Certificate Issues

If SSL initialization fails:

```bash
# Check Nginx configuration
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Manually request certificate
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d www.femsportiva.com -d femsportiva.com \
  --email admin@femsportiva.com \
  --agree-tos --no-eff-email
```

### WordPress Connection Issues

If WordPress can't connect to database:

```bash
# Check database is running
docker compose -f docker-compose.prod.yml exec database mysql -u wp_prod_user -p

# Check WordPress logs
docker compose -f docker-compose.prod.yml logs wordpress
```

### Frontend Build Issues

If frontend fails to build:

```bash
# Rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

## Security Reminders

- [ ] All passwords in `.env` are unique and strong
- [ ] WordPress security keys are generated and unique
- [ ] SSL certificates are active and auto-renewing
- [ ] Firewall is configured (only ports 80, 443, 22 open)
- [ ] SSH key authentication is enabled (disable password auth)
- [ ] Regular backups are scheduled
- [ ] WordPress is kept updated

## Maintenance Commands

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Update containers (after code changes)
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# View resource usage
docker stats

# Clean up old images/containers
docker system prune -a
```

## Support

For issues, check:

1. Docker logs: `docker compose -f docker-compose.prod.yml logs`
2. Nginx error logs: `docker compose -f docker-compose.prod.yml logs nginx`
3. WordPress debug mode (add to wp-config.php): `define('WP_DEBUG', true);`
