# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A headless WordPress + Next.js blog ("Femsportiva"), fully containerized with Docker Compose. WordPress is the CMS (content/auth/media), Next.js is the public frontend, and Nginx reverse-proxies both. Three environments: dev, staging, prod — each with its own `.env.*` and `docker-compose.*.yml` overlay.

## Commands

All commands are run from the repo root via `make` (Linux/Mac) or `manage.ps1` (Windows). Compose files are layered: `docker-compose.yml` (base) + `docker-compose.<env>.yml` (overlay) + `--env-file .env.<env>`.

```bash
make dev                 # start dev (detached)
make dev-build           # build + start dev (foreground, for watching logs)
make staging / make staging-build
make prod / make prod-build

make logs                # all services
make logs-wp / make logs-frontend / make logs-nginx
make down                # stop all
make clean               # stop + remove volumes (destructive, prompts for confirmation)

make shell-wp / make shell-db / make shell-frontend

make backup-db ENV=dev
make restore-db ENV=staging FILE=./backups/backup.sql.gz
make sync-staging        # sync prod DB -> staging (scripts/sync-prod-to-staging.sh)
make init-ssl            # one-time Let's Encrypt setup on the prod VPS
```

### Frontend (run inside `frontend/`, or via `make shell-frontend`)

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
```

There is no configured test runner — don't assume `npm test` works.

## Architecture

### Request flow

```
Nginx (80/443) -> Next.js (/)  and  WordPress (/wp/, /wp-json)
                -> MySQL (via WordPress only)
```

- `nginx/nginx.conf` is used for dev/staging; `nginx/nginx.prod.conf` adds SSL/Certbot. `nginx/proxy_headers_common.conf` holds shared proxy headers.
- WordPress permalinks **must** be set to "Post name" or the frontend's REST queries break.

### Frontend data layer (`frontend/lib/`)

Two layers, both important to keep in sync:

- **`lib/wordpress.ts`** — talks to the WordPress REST API directly. Every fetch function tries three URL forms in order (`?rest_route=...` via `index.php`, `/wp-json/...`, and `${API_BASE}/...`) because WordPress's rewrite rules are unreliable across environments — `tryFetch()` and the per-function URL-building loops encode this fallback. Each fetcher sets Next.js `revalidate`/`tags` for ISR caching (posts: 60s, taxonomies/authors/pages/settings: 3600s).
- **`lib/api.ts`** — the layer components actually call (`fetchPostsAPI`, `fetchPostBySlugAPI`, etc.). On the **server**, it calls `lib/wordpress.ts` directly (avoids self-HTTP-calls). On the **client**, it calls the app's own `app/api/*` route handlers, which themselves call `lib/wordpress.ts`. When adding a new data fetcher, implement it in `wordpress.ts`, then wire both branches in `api.ts`, then add the matching `app/api/<resource>/route.ts`.

### ISR revalidation webhook

- `data/revalidate-webhook.php` is a WordPress mu-plugin (mounted read-only into the WordPress container) that POSTs to `frontend/app/api/revalidate/route.ts` on publish/update of posts, pages, categories, tags, and author profile changes. Auth via `Authorization: Bearer <REVALIDATION_SECRET>` (env vars `NEXT_REVALIDATE_URL` / `NEXT_REVALIDATE_SECRET` on the WP side, `REVALIDATION_SECRET` on the Next.js side — must match).
- The revalidate route maps each content type to the cache tags used by `lib/wordpress.ts` (`posts`, `post-<slug>`, `category-<slug>`, `tag-<slug>`, `author-<slug>`, `page-<slug>`, `settings`, etc.) and purges them via `revalidateTag(tag, { expire: 0 })`. If you add a new cache tag in `wordpress.ts`, add its purge case here too.

### Other WordPress mu-plugins (`data/`, mounted read-only)

- `view-counter.php` — exposes `/wp-json/custom/v1/post-view/<id>` (POST), used by `app/api/views/[id]/route.ts` and `components/post/ViewCounter.tsx` to track/display post view counts. Adds `view_count` to the post REST response (see `types/wordpress.ts`).
- `sync-urls.php` — on every WP boot, forces `siteurl`/`home` options to match the `WORDPRESS_URL` env var, so the same DB dump works across environments without manual URL fixes.
- `ai1wm-unlimited.php` — removes import/export size limits for the All-in-One WP Migration plugin (used by `scripts/sync-prod-to-staging.sh` for DB/media sync).

### Frontend structure (`frontend/`)

- `app/` — Next.js App Router. Routes mirror WordPress taxonomies: `[category]/[slug]` (single post), `[category]` (category archive), `authors/[author]`, `tags/[slug]`, `search/`. `app/api/*` are the client-facing API routes described above (posts, categories, tags, authors, pages, search, settings, revalidate, views, og image, feed.xml, sitemap, robots).
- `components/` — organized by feature area (`layout`, `post`, `author`, `home`, `search`, `ui`, `seo`), each with an `index.ts` for grouped imports (see `components/README.md` for the full convention). Co-locate `*.module.css` with each component.
- `lib/SettingsContext.tsx` / `lib/ThemeContext.tsx` — client-side React contexts for site settings and dark/light theme (`ThemeToggle`).
- `types/wordpress.ts` — hand-written TypeScript types for the WP REST API v2 shapes consumed by the app (`WP_REST_API_Post`, `_User`, `_Media`, `_Category`, `_Tag`, `_Page`), including the custom `view_count` field added by `view-counter.php`.

### Environment files

- `.env.example` documents all variables; `.env.dev` / `.env.staging` / `.env.prod` are environment-specific and gitignored-by-convention but currently checked in for this project — be careful when editing not to leak prod secrets into other environments.
- `NEXT_PUBLIC_WORDPRESS_API_URL` must point at the **internal** Docker network (`http://wordpress/wp-json`), not a host-exposed URL — SSR fetches happen container-to-container.
