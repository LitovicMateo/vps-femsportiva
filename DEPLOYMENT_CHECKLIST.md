# Pre-Deployment Checklist

## ⚠️ BEFORE DEPLOYING TO PRODUCTION

### 1. Security Configuration (CRITICAL)

- [ ] Generate strong database passwords

  ```bash
  openssl rand -base64 32  # Run 3 times for root + user passwords
  ```

  Update in `.env.prod`:
  - `MYSQL_ROOT_PASSWORD`
  - `MYSQL_PASSWORD`
  - `WORDPRESS_DB_PASSWORD`

- [ ] Generate WordPress security keys
  - Visit: https://api.wordpress.org/secret-key/1.1/salt/
  - Replace ALL 8 keys in `.env.prod`

- [ ] Update SSL email in `.env.prod`
  ```env
  SSL_EMAIL=your-actual-email@femsportiva.com
  ```

### 2. DNS Configuration

- [ ] Add A record: `www.femsportiva.com` → VPS IP
- [ ] Add A record: `femsportiva.com` → VPS IP
- [ ] Wait for DNS propagation (check with `dig www.femsportiva.com`)

### 3. VPS Preparation

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker compose version`)
- [ ] Firewall configured:
  ```bash
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw enable
  ```
- [ ] Ports 80 & 443 are free (`sudo netstat -tulpn | grep ':80\|:443'`)

### 4. Files Transfer

- [ ] Upload project to VPS (`/var/www/vps-femsportiva`)
- [ ] Copy `.env.prod` to `.env`
- [ ] Verify all files are present

### 5. Environment Variables Verification

Open `.env` on VPS and verify:

- [ ] No "CHANGE_ME" placeholders remain
- [ ] No "GENERATE_UNIQUE_KEY" placeholders remain
- [ ] Domain is `www.femsportiva.com`
- [ ] All URLs use `https://www.femsportiva.com`

## 🚀 DEPLOYMENT STEPS

Run these commands on your VPS:

```bash
# 1. Navigate to project
cd /var/www/vps-femsportiva

# 2. Build containers
docker compose -f docker-compose.prod.yml build

# 3. Start services
docker compose -f docker-compose.prod.yml up -d

# 4. Wait for WordPress to initialize (30-60 seconds)
docker compose -f docker-compose.prod.yml logs -f wordpress

# 5. Initialize SSL (after WordPress is ready)
./scripts/init-ssl.sh

# 6. Verify all containers are running
docker compose -f docker-compose.prod.yml ps
```

## ✅ POST-DEPLOYMENT VERIFICATION

- [ ] All containers are running (status: Up)
- [ ] HTTPS works: https://www.femsportiva.com
- [ ] WordPress admin accessible: https://www.femsportiva.com/wp/wp-admin
- [ ] Frontend loads: https://www.femsportiva.com
- [ ] No console errors in browser
- [ ] Check logs for errors: `docker compose -f docker-compose.prod.yml logs`

## 🔧 WORDPRESS SETUP (First Time Only)

1. Visit https://www.femsportiva.com/wp/wp-admin
2. Complete WordPress installation
3. Go to **Settings → General:**
   - WordPress Address: `https://www.femsportiva.com/wp`
   - Site Address: `https://www.femsportiva.com`
   - Click **Save**
4. Go to **Settings → Permalinks:**
   - Select **Post name**
   - Click **Save**

## 📋 ENVIRONMENT SUMMARY

Your production `.env.prod` is configured with:

```
Domain:              www.femsportiva.com
WordPress Admin:     https://www.femsportiva.com/wp/wp-admin
Frontend Site:       https://www.femsportiva.com
WordPress API:       http://wordpress/wp-json (internal)
WordPress Path:      /wp
SSL Email:           admin@femsportiva.com
```

## 🔐 SECURITY NOTES

**NEVER commit `.env` files to Git!**

After deployment:

- Store passwords securely (password manager)
- Enable WordPress security plugins
- Set up automated backups
- Keep WordPress core/plugins updated
- Monitor logs regularly

## 📞 QUICK COMMANDS

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```
