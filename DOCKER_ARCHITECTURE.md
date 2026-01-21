# Docker Architecture & Service Communication

This document explains how all Docker services are connected and communicate with each other across different environments (development, staging, and production).

## Table of Contents

- [Overview](#overview)
- [Docker Services](#docker-services)
- [Network Architecture](#network-architecture)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [URL Transformation Flow](#url-transformation-flow)
- [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

The application uses a multi-tier architecture with the following services:
- **Frontend**: Next.js application (React-based)
- **WordPress**: Content management system and REST API provider
- **Nginx**: Reverse proxy and load balancer (staging/production only)
- **Database**: MySQL 8.0 for WordPress data persistence
- **Certbot**: SSL certificate management (production only)

All services communicate over a Docker bridge network created automatically by Docker Compose.

---

## Docker Services

### 1. Frontend (Next.js)

**Base Configuration** (`docker-compose.yml`)
```yaml
Service: frontend
Image: node:20-alpine (dev) / custom build (staging/prod)
Internal Port: 3000
External Port: 3000 (dev only)
```

**Purpose:**
- Server-side rendering (SSR) of React pages
- Fetches content from WordPress REST API
- Transforms internal WordPress URLs to browser-accessible URLs

**Environment Variables:**
| Variable | Dev | Staging | Production |
|----------|-----|---------|------------|
| `NEXT_PUBLIC_WORDPRESS_API_URL` | `http://wordpress/wp-json` | `http://wordpress/wp-json` | `http://wordpress/wp-json` |
| `NEXT_PUBLIC_WORDPRESS_URL` | `http://localhost:8080` | `http://localhost:8081` | `https://yourdomain.com` |
| `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX` | _(empty)_ | `/wp` | `/wp` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `http://localhost:3000` | `https://yourdomain.com` |
| `NODE_ENV` | `development` | `production` | `production` |

### 2. WordPress

**Base Configuration** (`docker-compose.yml`)
```yaml
Service: wordpress
Image: wordpress:latest
Internal Port: 80
External Port: 8080 (dev only)
```

**Purpose:**
- Content management system (CMS)
- REST API provider for frontend
- Media file storage and serving

**WordPress Configuration:**
```php
WP_HOME: ${WORDPRESS_URL}/wp
WP_SITEURL: ${WORDPRESS_URL}/wp
WP_CONTENT_URL: ${WORDPRESS_URL}/wp/wp-content
```

**Environment Variables:**
| Variable | Dev | Staging | Production |
|----------|-----|---------|------------|
| `WORDPRESS_URL` | `http://wordpress` | `http://wordpress` | `http://wordpress` |
| `WORDPRESS_INTERNAL_URL` | `http://wordpress` | `http://wordpress` | `http://wordpress` |
| `WORDPRESS_DEBUG` | `1` | `0` | `0` |

**Key Point:** WordPress always uses internal Docker service name (`http://wordpress`) for database storage. External URLs are handled by the frontend transformation layer.

### 3. Nginx (Staging/Production Only)

**Base Configuration** (`docker-compose.yml`)
```yaml
Service: nginx
Image: nginx:stable-alpine
Internal Port: 80
External Port: 8081 (staging), 80/443 (production)
```

**Purpose:**
- Reverse proxy for frontend and WordPress
- SSL termination (production)
- Static file caching
- Request routing

**URL Routing:**
```nginx
/               → frontend:3000 (Next.js)
/wp/            → wordpress:80 (WordPress admin/backend)
/wp-json/       → wordpress:80 (REST API)
/_next/static/  → frontend:3000 (Next.js static files)
```

### 4. Database (MySQL)

**Base Configuration** (`docker-compose.yml`)
```yaml
Service: database
Image: mysql:8.0
Internal Port: 3306
External Port: None (internal only)
```

**Purpose:**
- WordPress data persistence
- Only accessible from within Docker network

**Access:**
- WordPress connects via: `database:3306`
- Not accessible from host machine for security

### 5. Certbot (Production Only)

**Configuration** (`docker-compose.prod.yml`)
```yaml
Service: certbot
Image: certbot/certbot
Purpose: SSL certificate management
```

---

## Network Architecture

All services run on a Docker bridge network (`vps-next-wordpress_default`) created automatically by Docker Compose.

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                          HOST MACHINE                        │
│  Browser: http://localhost:3000                             │
│           http://localhost:8080                              │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              DOCKER NETWORK (Bridge)                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │◄───┤  WordPress   │◄───┤  Database    │  │
│  │  :3000       │    │  :80         │    │  :3306       │  │
│  │              │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                              │
│         │                    └──────────┐                   │
│         └───────────────────────────────┘                   │
│                 Internal DNS:                                │
│                 - wordpress                                  │
│                 - frontend                                   │
│                 - database                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- Frontend and WordPress both exposed to host
- Direct access to services for debugging
- No Nginx proxy layer
- Hot reload enabled for development

### Staging Environment

```
┌─────────────────────────────────────────────────────────────┐
│                          HOST MACHINE                        │
│  Browser: http://localhost:8081                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DOCKER NETWORK (Bridge)                         │
│                                                              │
│  ┌──────────────┐                                           │
│  │    Nginx     │                                           │
│  │    :80       │                                           │
│  └──────────────┘                                           │
│         │                                                    │
│    ┌────┴────┐                                              │
│    ▼         ▼                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │    │  WordPress   │◄───┤  Database    │  │
│  │  :3000       │    │  :80         │    │  :3306       │  │
│  │              │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  Internal Services NOT exposed to host                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- Only Nginx exposed to host (port 8081)
- All traffic routed through Nginx
- Services isolated from direct access
- Production-like architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                          INTERNET                            │
│  Browser: https://yourdomain.com                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DOCKER NETWORK (Bridge)                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │    Nginx     │◄───┤   Certbot    │                       │
│  │  :80/:443    │    │ (SSL certs)  │                       │
│  └──────────────┘    └──────────────┘                       │
│         │                                                    │
│    ┌────┴────┐                                              │
│    ▼         ▼                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │    │  WordPress   │◄───┤  Database    │  │
│  │  :3000       │    │  :80         │    │  :3306       │  │
│  │              │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  All services isolated - only Nginx exposed                 │
└─────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- SSL/TLS encryption via Let's Encrypt
- All traffic over HTTPS
- Maximum security isolation
- Resource limits configured

---

## Environment-Specific Configurations

### Development

**docker-compose command:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up
```

**Exposed Ports:**
- `3000` → Frontend (direct access)
- `8080` → WordPress (direct access)

**Service Communication:**
- Frontend → WordPress: `http://wordpress/wp-json` (internal)
- Browser → Frontend: `http://localhost:3000` (external)
- Browser → WordPress: `http://localhost:8080` (external)

**Image URL Transformation:**
```
Database:  http://wordpress/wp/wp-content/uploads/image.jpg
         ↓ (Frontend transformation)
Browser:   http://localhost:8080/wp-content/uploads/image.jpg
```

**Why no `/wp/` prefix?**  
Direct WordPress access (port 8080) serves files at root level. The `/wp/` path is only for Nginx proxy routing.

### Staging

**docker-compose command:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up
```

**Exposed Ports:**
- `8081` → Nginx (reverse proxy)

**Service Communication:**
- Frontend → WordPress: `http://wordpress/wp-json` (internal)
- Browser → Nginx: `http://localhost:8081` (external)
- Nginx → Frontend: `http://frontend:3000` (internal)
- Nginx → WordPress: `http://wordpress:80` (internal)

**Nginx Routing:**
```nginx
/               → frontend:3000
/wp/            → wordpress:80 (strips /wp/ prefix in proxy)
/wp-json/       → wordpress:80/wp-json/
/_next/static/  → frontend:3000
```

**Image URL Transformation:**
```
Database:  http://wordpress/wp/wp-content/uploads/image.jpg
         ↓ (Frontend transformation with /wp prefix)
Browser:   http://localhost:8081/wp/wp-content/uploads/image.jpg
         ↓ (Nginx strips /wp/ and proxies to WordPress)
WordPress: /wp-content/uploads/image.jpg
```

### Production

**docker-compose command:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

**Exposed Ports:**
- `80` → Nginx (HTTP, redirects to HTTPS)
- `443` → Nginx (HTTPS)

**Service Communication:**
- Frontend → WordPress: `http://wordpress/wp-json` (internal)
- Browser → Nginx: `https://yourdomain.com` (external)
- Nginx → Frontend: `http://frontend:3000` (internal)
- Nginx → WordPress: `http://wordpress:80` (internal)

**SSL/TLS:**
- Certbot manages Let's Encrypt certificates
- Nginx handles SSL termination
- Internal services use HTTP (encrypted by Docker network)

**Image URL Transformation:**
```
Database:  http://wordpress/wp/wp-content/uploads/image.jpg
         ↓ (Frontend transformation with /wp prefix)
Browser:   https://yourdomain.com/wp/wp-content/uploads/image.jpg
         ↓ (Nginx strips /wp/ and proxies to WordPress)
WordPress: /wp-content/uploads/image.jpg
```

---

## URL Transformation Flow

The application uses a multi-layer URL transformation system to handle different access patterns across environments.

### Layer 1: WordPress Database Storage

WordPress always stores URLs using the internal Docker service name:

```
WP_HOME: http://wordpress/wp
WP_SITEURL: http://wordpress/wp
WP_CONTENT_URL: http://wordpress/wp/wp-content
```

**Example stored URL:**
```
http://wordpress/wp/wp-content/uploads/2026/01/image.jpg
```

### Layer 2: Frontend Transformation

The Next.js frontend transforms internal URLs to browser-accessible URLs using `transformWordPressUrl()`:

**Code Location:** `frontend/lib/utils.ts`

```typescript
export function transformWordPressUrl(url: string | null): string | null {
  const externalUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const pathPrefix = process.env.NEXT_PUBLIC_WORDPRESS_PATH_PREFIX || "";
  
  return url
    .replace("http://wordpress/wp/", `${externalUrl}${pathPrefix}/`)
    .replace("http://wordpress/", `${externalUrl}${pathPrefix}/`);
}
```

**Transformation Examples:**

| Environment | Input URL | Output URL |
|-------------|-----------|------------|
| Dev | `http://wordpress/wp/wp-content/uploads/image.jpg` | `http://localhost:8080/wp-content/uploads/image.jpg` |
| Staging | `http://wordpress/wp/wp-content/uploads/image.jpg` | `http://localhost:8081/wp/wp-content/uploads/image.jpg` |
| Production | `http://wordpress/wp/wp-content/uploads/image.jpg` | `https://yourdomain.com/wp/wp-content/uploads/image.jpg` |

### Layer 3: Nginx Proxy Routing (Staging/Production Only)

Nginx intercepts requests with `/wp/` prefix and routes them to WordPress:

```nginx
location /wp/ {
  rewrite ^/wp/(.*) /$1 break;
  proxy_pass http://wordpress;
}
```

**Example Flow (Staging/Production):**
```
Browser Request:  http://localhost:8081/wp/wp-content/uploads/image.jpg
                ↓
Nginx Receives:   /wp/wp-content/uploads/image.jpg
                ↓
Nginx Rewrites:   /wp-content/uploads/image.jpg
                ↓
Proxy to:         http://wordpress:80/wp-content/uploads/image.jpg
                ↓
WordPress Serves: File from /var/www/html/wp-content/uploads/image.jpg
```

---

## Common Issues & Solutions

### Issue 1: Images Not Loading (NS_ERROR_UNKNOWN_HOST)

**Symptom:** Browser shows `http://wordpress/...` URLs that can't resolve

**Cause:** URLs not being transformed from internal Docker names to external URLs

**Solution:** Ensure `NEXT_PUBLIC_WORDPRESS_URL` and `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX` are set correctly in environment files

### Issue 2: 404 Errors on Images in Staging/Production

**Symptom:** Images work in dev but return 404 in staging/production

**Cause:** Incorrect `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX` value

**Solution:**
- Dev: `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX=` (empty)
- Staging/Prod: `NEXT_PUBLIC_WORDPRESS_PATH_PREFIX=/wp`

### Issue 3: WordPress Admin Not Accessible

**Symptom:** Can't access `http://localhost:8080/wp-admin` in dev

**Cause:** WordPress expects `/wp/` prefix in URLs

**Solution:** Access admin at `http://localhost:8080/wp/wp-admin` or configure WP_HOME without `/wp` suffix

### Issue 4: Database Connection Failed

**Symptom:** WordPress shows "Error establishing database connection"

**Cause:** Database not ready or wrong connection settings

**Solution:**
- Ensure database service is running: `docker-compose ps database`
- Check `WORDPRESS_DB_HOST=database:3306` in environment file
- Wait for healthcheck to pass (can take 30-40 seconds on first start)

### Issue 5: Port Already in Use

**Symptom:** `Error starting userland proxy: listen tcp 0.0.0.0:8080: bind: address already in use`

**Cause:** Another service using the same port

**Solution:**
- Change port in `.env.dev`: `NGINX_PORT=8082` (or another free port)
- Or stop the conflicting service

### Issue 6: Changes Not Reflecting

**Symptom:** Code changes not visible after editing files

**Cause (Dev):** Hot reload not working  
**Solution:** Restart frontend: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart frontend`

**Cause (Staging/Prod):** Using cached build  
**Solution:** Rebuild: `docker-compose -f docker-compose.yml -f docker-compose.staging.yml build --no-cache frontend`

---

## Environment Variables Reference

### Complete Variable List

**`.env.dev`**
```bash
WORDPRESS_URL=http://wordpress
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080
NEXT_PUBLIC_WORDPRESS_PATH_PREFIX=
NEXT_PUBLIC_WORDPRESS_API_URL=http://wordpress/wp-json
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NGINX_PORT=8081  # Not used in dev
```

**`.env.staging`**
```bash
WORDPRESS_URL=http://wordpress
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8081
NEXT_PUBLIC_WORDPRESS_PATH_PREFIX=/wp
NEXT_PUBLIC_WORDPRESS_API_URL=http://wordpress/wp-json
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NGINX_PORT=8081
```

**`.env.prod`**
```bash
WORDPRESS_URL=http://wordpress
NEXT_PUBLIC_WORDPRESS_URL=https://yourdomain.com
NEXT_PUBLIC_WORDPRESS_PATH_PREFIX=/wp
NEXT_PUBLIC_WORDPRESS_API_URL=http://wordpress/wp-json
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NGINX_PORT=80  # Not used (hardcoded 80/443 in prod)
```

---

## Service Access Patterns

### Internal Communication (Within Docker Network)

All services use Docker's internal DNS:

| From | To | URL |
|------|-----|-----|
| Frontend | WordPress API | `http://wordpress/wp-json` |
| Frontend | WordPress Media | N/A (URLs transformed for browser) |
| WordPress | Database | `database:3306` |
| Nginx | Frontend | `http://frontend:3000` |
| Nginx | WordPress | `http://wordpress:80` |

### External Access (From Browser)

| Environment | Service | URL |
|-------------|---------|-----|
| Dev | Frontend | `http://localhost:3000` |
| Dev | WordPress | `http://localhost:8080` |
| Staging | Nginx (all) | `http://localhost:8081` |
| Production | Nginx (all) | `https://yourdomain.com` |

---

## Debugging Tips

### View Service Logs
```bash
# All services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs

# Specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs frontend

# Follow logs in real-time
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
```

### Check Service Status
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

### Inspect Network
```bash
# List networks
docker network ls

# Inspect network details
docker network inspect vps-next-wordpress_default
```

### Execute Commands in Containers
```bash
# WordPress WP-CLI
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec wordpress wp --allow-root option get siteurl

# MySQL query
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec database mysql -u root -p

# Check environment variables
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend env | grep NEXT_PUBLIC
```

### Test Internal Connectivity
```bash
# From frontend to WordPress
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend wget -O- http://wordpress/wp-json

# From WordPress to database
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec wordpress nc -zv database 3306
```

---

## Architecture Diagram Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────────┤
│  Browser ──→ localhost:3000 ──→ Frontend:3000                   │
│         └──→ localhost:8080 ──→ WordPress:80                    │
│                                     └──→ Database:3306           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 STAGING/PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────────┤
│  Browser ──→ Domain/Port ──→ Nginx:80 ──→ Frontend:3000         │
│                                      └──→ WordPress:80           │
│                                              └──→ Database:3306  │
│                                                                  │
│  [Production adds: Certbot for SSL, Resource Limits]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Internal Communication**: All Docker services use internal DNS names (`wordpress`, `frontend`, `database`)

2. **URL Transformation**: Frontend transforms internal WordPress URLs to browser-accessible URLs based on environment

3. **Path Prefix**: Dev uses no prefix (direct access), Staging/Prod use `/wp` prefix (Nginx routing)

4. **Security**: Production isolates all services behind Nginx with SSL/TLS

5. **Environment Consistency**: Same base configuration with environment-specific overrides via compose files

6. **Database Access**: MySQL only accessible within Docker network for security

7. **Media Files**: WordPress serves uploads, but URLs are transformed by frontend for browser access
