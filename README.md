# NextJS + WordPress Headless CMS Boilerplate

A production-ready boilerplate for building blogs with Next.js frontend and WordPress as a headless CMS, fully containerized with Docker. Designed for self-hosting on Ubuntu VPS (Hetzner) with multi-environment support.

## Features

- **Next.js 16** - Modern React framework with Server Components
- **WordPress** - Headless CMS via REST API
- **Nginx** - Reverse proxy with SSL support
- **Docker** - Fully containerized setup
- **Multi-Environment** - Dev, Staging, and Production configurations
- **TypeScript** - Type-safe WordPress API integration
- **Database Management** - Backup, restore, and sync tools
- **SSL/HTTPS** - Automatic Let's Encrypt certificates for production

## Architecture

```
┌─────────────────────────────────────────┐
│              Nginx (Port 80/443)        │
│  - Reverse Proxy                        │
│  - SSL Termination (Production)         │
└────────────┬────────────────────────────┘
             │
       ┌─────┴──────┐
       │            │
  ┌────▼────┐  ┌───▼──────┐
  │ Next.js │  │WordPress │
  │(Port    │  │ (CMS)    │
  │ 3000)   │  │          │
  └─────────┘  └────┬─────┘
                    │
               ┌────▼────┐
               │  MySQL  │
               │ Database│
               └─────────┘
```

**Routes:**

- `/` → Next.js frontend (blog)
- `/wp/` → WordPress admin panel
- Internal: WordPress REST API at `/wp-json`

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Make** (optional, for convenience commands)
- **Git** for version control
- For production: Ubuntu VPS with ports 80/443 open

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd vps-next-wordpress
```

### 2. Configure Environment

Copy and edit the development environment file:

```bash
cp .env.example .env.dev
# Edit .env.dev with your preferred settings
```

### 3. Start Development Environment

**On Windows (PowerShell):**

```powershell
# Using PowerShell script (recommended)
.\manage.ps1 dev

# Or using Make
make dev
```

**On Linux/Mac:**

```bash
# Using Make (recommended)
make dev

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up
```

### 4. Access Your Site

- **Frontend:** http://localhost:8080
- **WordPress Admin:** http://localhost:8080/wp/wp-admin
- **Next.js Dev Server:** http://localhost:3000

### 5. Initial WordPress Setup

1. Navigate to http://localhost:8080/wp/wp-admin
2. Complete the WordPress installation wizard
3. **Important:** Set permalink structure to "Post name" (Settings → Permalinks)
4. Create some test posts

## Environment Configuration

The project supports three environments:

### Development (.env.dev)

- Local development with hot-reload
- Exposed ports for debugging
- Development database with sample data

### Staging (.env.staging)

- WSL Ubuntu or local testing environment
- Production build with staging database
- Simulates production setup without SSL

### Production (.env.prod)

- Hetzner VPS deployment
- SSL/HTTPS enabled
- Optimized with health checks and resource limits

### Environment Variables

Key variables in `.env.*` files:

```bash
# Environment type
ENVIRONMENT=development|staging|production

# Database credentials
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=wordpress_dev
MYSQL_USER=wp_user
MYSQL_PASSWORD=user_password

# WordPress configuration
WORDPRESS_URL=http://localhost:8080
WORDPRESS_TABLE_PREFIX=wp_

# WordPress security keys
# Generate at: https://api.wordpress.org/secret-key/1.1/salt/
WORDPRESS_AUTH_KEY=...
WORDPRESS_SECURE_AUTH_KEY=...
# ... (8 keys total)

# Frontend API endpoint
NEXT_PUBLIC_WORDPRESS_API_URL=http://wordpress/wp-json

# Production: Domain and SSL
DOMAIN=yourdomain.com
SSL_EMAIL=admin@yourdomain.com
```

## Makefile Commands

All commands are available through `Makefile` (Linux/Mac) or `manage.ps1` (Windows PowerShell).

### Environment Management

**Linux/Mac:**

```bash
make dev              # Start development environment
make staging          # Start staging environment
make prod             # Start production environment
make dev-build        # Build and start development
make down             # Stop all services
make clean            # Stop and remove volumes (WARNING: deletes data)
```

**Windows (PowerShell):**

```powershell
.\manage.ps1 dev              # Start development environment
.\manage.ps1 staging          # Start staging environment
.\manage.ps1 prod             # Start production environment
.\manage.ps1 dev-build        # Build and start development
.\manage.ps1 down             # Stop all services
.\manage.ps1 clean            # Stop and remove volumes (WARNING: deletes data)
```

### Logs

**Linux/Mac:**

```bash
make logs             # Show logs (all services)
make logs-wp          # Show WordPress logs
make logs-frontend    # Show Next.js logs
make logs-nginx       # Show Nginx logs
```

**Windows (PowerShell):**

```powershell
.\manage.ps1 logs             # Show logs (all services)
.\manage.ps1 logs-wp          # Show WordPress logs
.\manage.ps1 logs-frontend    # Show Next.js logs
.\manage.ps1 logs-nginx       # Show Nginx logs
```

### Database Management

**Linux/Mac:**

```bash
# Backup database
make backup-db ENV=dev
make backup-db ENV=prod

# Restore database
make restore-db ENV=staging FILE=./backups/backup_prod_20260116_120000.sql.gz

# Sync production to staging
make sync-staging
```

**Windows (PowerShell):**

```powershell
# Backup database (requires WSL or Git Bash)
.\manage.ps1 backup-db dev
# Note: Will display instructions to run via bash

# Restore database (requires WSL or Git Bash)
.\manage.ps1 restore-db staging .\backups\backup_prod_20260116_120000.sql.gz
# Note: Will display instructions to run via bash

# For actual database operations on Windows, use WSL:
wsl bash scripts/backup-db.sh dev
wsl bash scripts/restore-db.sh staging ./backups/backup_prod_20260116_120000.sql.gz
```

### Shell Access

**Linux/Mac:**

```bash
make shell-wp         # WordPress shell
make shell-db         # Database shell
make shell-frontend   # Frontend shell
```

**Windows (PowerShell):**

```powershell
.\manage.ps1 shell-wp         # WordPress shell
.\manage.ps1 shell-db         # Database shell
.\manage.ps1 shell-frontend   # Frontend shell
```

### Production Setup

**Linux/Mac:**

```bash
# Initialize SSL certificates (run once on VPS)
make init-ssl
```

**Windows (PowerShell):**

```powershell
# For production SSL setup, run on Linux VPS:
make init-ssl
```

## Production Deployment

### Initial VPS Setup

1. **Provision Ubuntu VPS** (Hetzner, DigitalOcean, etc.)

2. **SSH into your VPS:**

   ```bash
   ssh root@your-vps-ip
   ```

3. **Install Docker:**

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   apt-get update
   apt-get install docker-compose-plugin
   ```

4. **Create application directory:**

   ```bash
   mkdir -p /var/www/vps-blog
   cd /var/www
   ```

5. **Clone your repository:**

   ```bash
   git clone <your-repo-url> vps-blog
   cd vps-blog
   ```

6. **Configure production environment:**

   ```bash
   cp .env.example .env.prod
   nano .env.prod
   ```

   Update:
   - Set `DOMAIN=yourdomain.com`
   - Set `SSL_EMAIL=admin@yourdomain.com`
   - Generate strong passwords for database
   - Generate WordPress security keys

7. **Point your domain to VPS:**
   - Add A record: `yourdomain.com` → `your-vps-ip`
   - Add A record: `www.yourdomain.com` → `your-vps-ip`
   - Wait for DNS propagation (5-30 minutes)

8. **Initialize SSL certificates:**

   ```bash
   chmod +x scripts/*.sh
   make init-ssl
   ```

9. **Start production environment:**

   ```bash
   make prod
   ```

10. **Complete WordPress setup:**
    - Visit `https://yourdomain.com/wp/wp-admin`
    - Complete installation wizard
    - Set permalinks to "Post name"

### Updating Production

**On VPS (Linux):**

```bash
# SSH to VPS
ssh root@your-vps-ip
cd /var/www/vps-blog

# Pull latest changes
git pull origin main

# Rebuild and restart
make prod-build
```

**Windows Development → VPS:**

```powershell
# 1. Commit and push changes
git add .
git commit -m "Update features"
git push origin main

# 2. SSH to VPS and pull
ssh root@your-vps-ip
cd /var/www/vps-blog
git pull origin main
make prod-build
```

## Staging Environment (WSL Ubuntu)

### Setup on Windows with WSL

1. **Enable WSL2** (if not already):

   ```powershell
   wsl --install
   ```

2. **In WSL Ubuntu terminal:**

   ```bash
   cd /mnt/d/workingDir/vps-next-wordpress  # Adjust path
   ```

3. **Start staging:**

   ```bash
   make staging
   # Or use the PowerShell script from Windows:
   # .\manage.ps1 staging
   ```

4. **Access staging:**
   - Frontend: http://localhost:8081
   - WordPress: http://localhost:8081/wp/wp-admin

### Sync Production Data to Staging

**On Linux/Mac or WSL:**

```bash
# This will:
# 1. Create production backup
# 2. Sanitize user data (emails, passwords)
# 3. Import to staging
# 4. Optionally sync media uploads

make sync-staging
```

**On Windows (PowerShell):**

```powershell
# Use WSL to run bash scripts
wsl make sync-staging
```

## Database Management

### Backup Database

**On Linux/Mac or VPS:**

```bash
# Backup development
make backup-db ENV=dev

# Backup production (on VPS)
make backup-db ENV=prod
```

**On Windows (PowerShell):**

```powershell
# Use WSL or Git Bash for database operations
wsl bash scripts/backup-db.sh dev
wsl bash scripts/backup-db.sh prod
```

Backups are saved to `./backups/` with timestamp:

```
backups/backup_prod_20260116_143022.sql.gz
```

### Restore Database

**On Linux/Mac or VPS:**

```bash
make restore-db ENV=staging FILE=./backups/backup_prod_20260116_143022.sql.gz
```

**On Windows (PowerShell):**

```powershell
wsl bash scripts/restore-db.sh staging ./backups/backup_prod_20260116_143022.sql.gz
```

### Manual Database Access

**All Platforms:**

```bash
# Access MySQL shell (use make or manage.ps1)
make shell-db
# or
.\manage.ps1 shell-db

# Then inside the container:
mysql -u root -p

# Import SQL file manually
docker-compose exec -T database mysql -u root -p wordpress_dev < backup.sql
```

## WordPress Configuration

### Required Permalink Settings

For Next.js to fetch posts correctly, set WordPress permalinks to "Post name":

1. Go to **Settings → Permalinks**
2. Select **Post name** (`https://yourdomain.com/sample-post/`)
3. Click **Save Changes**

### Recommended Plugins

For headless WordPress, consider:

- **Yoast SEO** - SEO optimization
- **Advanced Custom Fields (ACF)** - Custom content fields
- **Custom Post Type UI** - Custom post types
- **WP REST API Cache** - API caching

## TypeScript Integration

WordPress REST API types are defined in `frontend/types/wordpress.ts`:

```typescript
import { WP_REST_API_Post, WP_REST_API_User } from "@/types/wordpress";

// Fetch posts with type safety
const posts: WP_REST_API_Post[] = await fetchPosts();
```

Available types:

- `WP_REST_API_Post`
- `WP_REST_API_User`
- `WP_REST_API_Media`
- `WP_REST_API_Category`
- `WP_REST_API_Tag`
- `WP_REST_API_Comment`

## Troubleshooting

### WordPress returns 404 on REST API

**Solution:** Check permalink settings. Must be "Post name" structure.

```bash
# Or set via WP-CLI in container:
docker-compose exec wordpress wp rewrite structure '/%postname%/' --allow-root
docker-compose exec wordpress wp rewrite flush --allow-root
```

### CORS errors in browser console

**Solution:** WordPress CORS is handled via `WORDPRESS_CONFIG_EXTRA` in docker-compose files. Ensure the configuration is applied.

### Database connection refused

**Solution:** Ensure database service is running and credentials in `.env.*` match:

```bash
docker-compose ps
docker-compose logs database
```

### SSL certificate renewal fails

**Solution:** Certbot runs automatically every 12 hours. Check logs:

```bash
docker-compose logs certbot
```

Manually renew:

```bash
docker-compose exec certbot certbot renew
```

### Next.js can't connect to WordPress

**Solution:** Verify `NEXT_PUBLIC_WORDPRESS_API_URL` points to internal Docker network:

```bash
# Correct (internal)
NEXT_PUBLIC_WORDPRESS_API_URL=http://wordpress/wp-json

# Incorrect (external)
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:8080/wp/wp-json
```

### Port conflicts (8080 already in use)

**Solution:** Change `NGINX_PORT` in your `.env.*` file:

```bash
NGINX_PORT=8081
```

## Project Structure

```
vps-next-wordpress/
├── .env.example              # Environment template
├── .env.dev                  # Development config
├── .env.staging              # Staging config
├── .env.prod                 # Production config
├── docker-compose.yml        # Base Docker services
├── docker-compose.dev.yml    # Development overrides
├── docker-compose.staging.yml # Staging overrides
├── docker-compose.prod.yml   # Production overrides
├── Makefile                  # Command shortcuts
├── frontend/                 # Next.js application
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Homepage (post list)
│   │   └── posts/[id]/page.tsx # Post detail
│   ├── types/               # TypeScript definitions
│   │   └── wordpress.ts     # WordPress API types
│   ├── Dockerfile           # Frontend container
│   └── package.json
├── nginx/                    # Nginx configurations
│   ├── nginx.conf           # Dev/staging config
│   └── nginx.prod.conf      # Production with SSL
├── scripts/                  # Utility scripts
│   ├── backup-db.sh         # Database backup
│   ├── restore-db.sh        # Database restore
│   ├── sync-prod-to-staging.sh # Data sync
│   └── init-ssl.sh          # SSL initialization
├── data/                     # Persistent data
│   └── uploads/             # WordPress uploads
├── backups/                  # Database backups (gitignored)
└── certbot/                  # SSL certificates (gitignored)
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS 4
- **CMS:** WordPress (latest)
- **Database:** MySQL 8.0
- **Proxy:** Nginx (Alpine)
- **SSL:** Let's Encrypt (Certbot)
- **Containerization:** Docker, Docker Compose

## Security Considerations

- WordPress file editing disabled in production
- Non-root user in Next.js container
- Security headers in Nginx (HSTS, CSP, X-Frame-Options)
- Database credentials via environment variables
- SSL/TLS 1.2+ only
- WordPress authentication keys unique per environment

## Performance Optimizations

- Multi-stage Docker builds
- Production-only npm dependencies
- Docker layer caching for faster builds
- Next.js Server Components for SSR
- Health checks for service reliability
- Resource limits in production

## License

MIT - Feel free to use this boilerplate for your projects.

## Contributing

This is a boilerplate project. Fork it and customize for your needs!

## Support

For issues or questions, please open a GitHub issue.

---

**Happy blogging! 🚀**
