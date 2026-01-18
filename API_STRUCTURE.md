# API Structure for Headless WordPress Blog

## Overview

This document outlines the API routes for the Next.js frontend consuming WordPress REST API, including public routes for blog content and admin routes for site management.

---

## Public API Routes (WordPress REST API)

### Posts & Content

#### `GET /api/posts`

**Purpose:** Fetch paginated list of published posts  
**Query Parameters:**

- `page` (number) - Page number for pagination (default: 1)
- `per_page` (number) - Posts per page (default: 10, max: 100)
- `search` (string) - Search term for post title/content
- `orderby` (string) - Sort field: `date`, `title`, `relevance` (default: `date`)
- `order` (string) - Sort order: `asc`, `desc` (default: `desc`)

**Response:**

```json
{
  "posts": [
    /* array of post objects */
  ],
  "pagination": {
    "total": 125,
    "totalPages": 13,
    "currentPage": 1,
    "perPage": 10
  }
}
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts`

---

#### `GET /api/posts/:slug`

**Purpose:** Fetch single post by slug  
**Path Parameters:**

- `slug` (string) - Post slug/permalink

**Response:**

```json
{
  "id": 123,
  "title": "Post Title",
  "slug": "post-title",
  "content": "<p>Post content...</p>",
  "excerpt": "Short excerpt...",
  "date": "2026-01-15T10:30:00",
  "modified": "2026-01-16T14:22:00",
  "author": {
    "id": 1,
    "name": "John Doe",
    "avatar": "https://..."
  },
  "featured_image": {
    "url": "https://...",
    "alt": "Image alt text"
  },
  "categories": [
    /* array of category objects */
  ],
  "tags": [
    /* array of tag objects */
  ]
}
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts?slug={slug}`

---

### Categories

#### `GET /api/categories`

**Purpose:** Fetch all categories  
**Query Parameters:**

- `per_page` (number) - Categories per page (default: 100)
- `hide_empty` (boolean) - Hide categories with no posts (default: true)

**Response:**

```json
[
  {
    "id": 5,
    "name": "Technology",
    "slug": "technology",
    "description": "Tech related posts",
    "count": 42
  }
]
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/categories`

---

#### `GET /api/categories/:slug/posts`

**Purpose:** Fetch posts by category  
**Path Parameters:**

- `slug` (string) - Category slug

**Query Parameters:**

- `page` (number) - Page number
- `per_page` (number) - Posts per page

**Response:** Same as `GET /api/posts` with filtered results

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts?categories={id}`

---

### Tags

#### `GET /api/tags`

**Purpose:** Fetch all tags  
**Query Parameters:**

- `per_page` (number) - Tags per page (default: 100)
- `search` (string) - Search tags by name

**Response:**

```json
[
  {
    "id": 12,
    "name": "JavaScript",
    "slug": "javascript",
    "count": 28
  }
]
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/tags`

---

#### `GET /api/tags/:slug/posts`

**Purpose:** Fetch posts by tag  
**Path Parameters:**

- `slug` (string) - Tag slug

**Query Parameters:**

- `page`, `per_page` - Pagination

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts?tags={id}`

---

### Authors

#### `GET /api/authors`

**Purpose:** Fetch all authors

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "slug": "john-doe",
    "description": "Author bio...",
    "avatar": "https://...",
    "url": "https://johndoe.com",
    "post_count": 15
  }
]
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/users?who=authors`

---

#### `GET /api/authors/:slug`

**Purpose:** Fetch single author by slug

**WordPress Endpoint:** `GET /wp-json/wp/v2/users?slug={slug}`

---

#### `GET /api/authors/:slug/posts`

**Purpose:** Fetch posts by author  
**Path Parameters:**

- `slug` (string) - Author slug

**Query Parameters:**

- `page`, `per_page` - Pagination

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts?author={id}`

---

### Media

#### `GET /api/media/:id`

**Purpose:** Fetch media details  
**Path Parameters:**

- `id` (number) - Media attachment ID

**Response:**

```json
{
  "id": 456,
  "title": "Image Title",
  "url": "https://.../image.jpg",
  "alt": "Alt text",
  "caption": "Image caption",
  "sizes": {
    "thumbnail": "https://...",
    "medium": "https://...",
    "large": "https://..."
  }
}
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/media/{id}`

---

### Pages

#### `GET /api/pages`

**Purpose:** Fetch static pages  
**Query Parameters:**

- `per_page` (number) - Pages per page

**WordPress Endpoint:** `GET /wp-json/wp/v2/pages`

---

#### `GET /api/pages/:slug`

**Purpose:** Fetch single page by slug  
**Path Parameters:**

- `slug` (string) - Page slug (e.g., "about", "contact")

**WordPress Endpoint:** `GET /wp-json/wp/v2/pages?slug={slug}`

---

### Comments

#### `GET /api/posts/:id/comments`

**Purpose:** Fetch comments for a post  
**Path Parameters:**

- `id` (number) - Post ID

**Query Parameters:**

- `page`, `per_page` - Pagination
- `order` (string) - `asc` or `desc`

**WordPress Endpoint:** `GET /wp-json/wp/v2/comments?post={id}`

---

#### `POST /api/comments`

**Purpose:** Submit a new comment (if enabled)  
**Body Parameters:**

```json
{
  "post": 123,
  "author_name": "Jane Doe",
  "author_email": "jane@example.com",
  "content": "Great post!"
}
```

**WordPress Endpoint:** `POST /wp-json/wp/v2/comments`

---

### Search

#### `GET /api/search`

**Purpose:** Global search across posts, pages, and custom post types  
**Query Parameters:**

- `q` or `search` (string) - Search query
- `type` (string) - Filter by type: `post`, `page`, `any` (default: `post`)
- `per_page` (number) - Results per page

**Response:**

```json
{
  "results": [
    {
      "id": 123,
      "title": "Matching Post",
      "type": "post",
      "url": "/posts/matching-post",
      "excerpt": "..."
    }
  ],
  "total": 5
}
```

**WordPress Endpoint:** `GET /wp-json/wp/v2/search?search={query}`

---

### Site Settings

#### `GET /api/settings`

**Purpose:** Fetch site metadata and settings

**Response:**

```json
{
  "title": "My Awesome Blog",
  "description": "A blog about coding",
  "url": "https://myblog.com",
  "timezone": "America/New_York",
  "date_format": "F j, Y",
  "time_format": "g:i a"
}
```

**WordPress Endpoint:** `GET /wp-json` (site info)

---

## Admin API Routes

These routes require authentication using WordPress credentials (JWT or Application Passwords).

### Authentication

#### `POST /api/admin/auth/login`

**Purpose:** Authenticate user with WordPress credentials  
**Body Parameters:**

```json
{
  "username": "admin",
  "password": "application_password_here"
}
```

**Response:**

```json
{
  "token": "jwt_token_or_session_id",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["administrator"]
  }
}
```

**Implementation:** Use WordPress Application Passwords or JWT Authentication plugin

---

#### `POST /api/admin/auth/logout`

**Purpose:** Invalidate current session

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### `GET /api/admin/auth/me`

**Purpose:** Get current authenticated user details  
**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roles": ["administrator"],
  "capabilities": ["edit_posts", "publish_posts", ...]
}
```

---

### Post Management

#### `GET /api/admin/posts`

**Purpose:** Fetch all posts (including drafts, private)  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**

- `status` (string) - Filter by status: `publish`, `draft`, `pending`, `private`, `any`
- `page`, `per_page` - Pagination
- `author` (number) - Filter by author ID

**WordPress Endpoint:** `GET /wp-json/wp/v2/posts?status=any` (authenticated)

---

#### `POST /api/admin/posts`

**Purpose:** Create new post  
**Headers:** `Authorization: Bearer {token}`  
**Body Parameters:**

```json
{
  "title": "New Post Title",
  "content": "<p>Post content...</p>",
  "status": "draft",
  "categories": [5, 7],
  "tags": [12, 15],
  "featured_media": 456
}
```

**WordPress Endpoint:** `POST /wp-json/wp/v2/posts`

---

#### `PUT /api/admin/posts/:id`

**Purpose:** Update existing post  
**Headers:** `Authorization: Bearer {token}`  
**Path Parameters:**

- `id` (number) - Post ID

**Body Parameters:** Same as POST (partial updates allowed)

**WordPress Endpoint:** `PUT /wp-json/wp/v2/posts/{id}`

---

#### `DELETE /api/admin/posts/:id`

**Purpose:** Delete or trash post  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**

- `force` (boolean) - Permanently delete (default: false, sends to trash)

**WordPress Endpoint:** `DELETE /wp-json/wp/v2/posts/{id}`

---

### Media Management

#### `POST /api/admin/media`

**Purpose:** Upload new media file  
**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:** File upload with metadata

**WordPress Endpoint:** `POST /wp-json/wp/v2/media`

---

#### `DELETE /api/admin/media/:id`

**Purpose:** Delete media file

**WordPress Endpoint:** `DELETE /wp-json/wp/v2/media/{id}`

---

### Category/Tag Management

#### `POST /api/admin/categories`

**Purpose:** Create new category  
**Body:**

```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description"
}
```

**WordPress Endpoint:** `POST /wp-json/wp/v2/categories`

---

#### `PUT /api/admin/categories/:id`

**Purpose:** Update category

**WordPress Endpoint:** `PUT /wp-json/wp/v2/categories/{id}`

---

#### `DELETE /api/admin/categories/:id`

**Purpose:** Delete category

**WordPress Endpoint:** `DELETE /wp-json/wp/v2/categories/{id}`

---

#### `POST /api/admin/tags`

**Purpose:** Create new tag

**WordPress Endpoint:** `POST /wp-json/wp/v2/tags`

---

### User Management

#### `GET /api/admin/users`

**Purpose:** Fetch all users  
**Headers:** `Authorization: Bearer {token}`

**WordPress Endpoint:** `GET /wp-json/wp/v2/users`

---

#### `POST /api/admin/users`

**Purpose:** Create new user

**WordPress Endpoint:** `POST /wp-json/wp/v2/users`

---

#### `PUT /api/admin/users/:id`

**Purpose:** Update user profile

**WordPress Endpoint:** `PUT /wp-json/wp/v2/users/{id}`

---

### Site Settings Management

#### `GET /api/admin/settings`

**Purpose:** Fetch site settings (authenticated)

**WordPress Endpoint:** `GET /wp-json/wp/v2/settings`

---

#### `PUT /api/admin/settings`

**Purpose:** Update site settings  
**Body:**

```json
{
  "title": "New Site Title",
  "description": "New tagline",
  "timezone_string": "America/New_York"
}
```

**WordPress Endpoint:** `PUT /wp-json/wp/v2/settings`

---

### Analytics & Stats (Future)

#### `GET /api/admin/analytics`

**Purpose:** Fetch site analytics  
**Query Parameters:**

- `start_date`, `end_date` - Date range
- `metric` - Views, visitors, popular posts

**Note:** Requires custom plugin or integration (e.g., WordPress Statistics plugin)

---

## Implementation Notes

### Next.js API Routes Structure

```
frontend/app/api/
├── posts/
│   ├── route.ts                    # GET /api/posts
│   └── [slug]/
│       └── route.ts                # GET /api/posts/:slug
├── categories/
│   ├── route.ts                    # GET /api/categories
│   └── [slug]/
│       └── posts/
│           └── route.ts            # GET /api/categories/:slug/posts
├── authors/
│   ├── route.ts                    # GET /api/authors
│   └── [slug]/
│       ├── route.ts                # GET /api/authors/:slug
│       └── posts/
│           └── route.ts            # GET /api/authors/:slug/posts
├── search/
│   └── route.ts                    # GET /api/search
├── settings/
│   └── route.ts                    # GET /api/settings
└── admin/
    ├── auth/
    │   ├── login/route.ts          # POST /api/admin/auth/login
    │   ├── logout/route.ts         # POST /api/admin/auth/logout
    │   └── me/route.ts             # GET /api/admin/auth/me
    ├── posts/
    │   ├── route.ts                # GET /api/admin/posts, POST /api/admin/posts
    │   └── [id]/route.ts           # PUT /api/admin/posts/:id, DELETE
    ├── media/
    │   ├── route.ts                # POST /api/admin/media
    │   └── [id]/route.ts           # DELETE /api/admin/media/:id
    ├── categories/
    │   ├── route.ts                # POST /api/admin/categories
    │   └── [id]/route.ts           # PUT, DELETE
    ├── tags/
    │   ├── route.ts                # POST /api/admin/tags
    │   └── [id]/route.ts           # PUT, DELETE
    └── settings/
        └── route.ts                # GET /api/admin/settings, PUT
```

### Authentication Strategy

**Recommended:** WordPress Application Passwords (built-in since WP 5.6)

1. Generate Application Password in WordPress admin
2. Send username + app password to `/api/admin/auth/login`
3. Create session token (JWT or server-side session)
4. Store token in httpOnly cookie or localStorage
5. Include token in Authorization header for admin requests

**Alternative:** JWT Authentication plugin for WordPress

### Error Handling

All API routes should return consistent error responses:

```json
{
  "error": true,
  "code": "invalid_slug",
  "message": "Post not found",
  "status": 404
}
```

### Rate Limiting

Consider implementing rate limiting for:

- Search endpoints
- Comment submission
- Admin authentication attempts

### Caching Strategy

- **Public routes:** Cache with ISR (Incremental Static Regeneration)
- **Admin routes:** No caching
- **Consider:** Redis cache for WordPress REST API responses

---

## WordPress Plugins Required

1. **Application Passwords** (built-in WP 5.6+) - For admin authentication
2. **Better REST API Featured Images** - Include featured images in responses
3. **WP REST Cache** - Cache REST API responses
4. **JWT Authentication for WP REST API** (alternative auth method)

---

## Security Considerations

1. **CORS:** Configure WordPress to allow requests from Next.js domain
2. **Authentication:** Use HTTPS only for admin routes
3. **Validation:** Sanitize all user inputs
4. **Rate Limiting:** Prevent brute force attacks on login
5. **Permissions:** Verify user capabilities before allowing admin actions
6. **CSRF Protection:** Implement CSRF tokens for admin forms

---

## Phase 3 - TODO Features

### Comments API

- [ ] `GET /api/posts/:id/comments` - Fetch comments for a post
- [ ] `POST /api/comments` - Submit new comment (if enabled)
- [ ] Comment moderation endpoints for admin

### Related Posts

- [ ] `GET /api/posts/:slug/related` - Get related posts based on tags/categories
- [ ] Smart recommendations based on content similarity

### Content Revalidation

- [ ] `POST /api/revalidate` - Webhook endpoint to trigger ISR revalidation
- [ ] Integration with WordPress to call on post publish/update
- [ ] Bulk revalidation for category/tag updates

### RSS & Sitemap

- [ ] `GET /api/feed.xml` or `/feed.xml` - Generate RSS/Atom feed
- [ ] `GET /api/sitemap.xml` or `/sitemap.xml` - Dynamic sitemap generation
- [ ] Separate sitemaps for posts, pages, categories, authors

### Image Optimization

- [ ] `GET /api/images/:path` - Proxy WordPress images through Next.js Image Optimization
- [ ] Automatic WebP conversion
- [ ] Responsive image sizing

### Analytics & Stats (Admin)

- [ ] `GET /api/admin/analytics` - Site traffic and post views
- [ ] Popular posts endpoint
- [ ] Integration with Google Analytics or custom tracking

### Media Library (Admin)

- [ ] `GET /api/admin/media` - List all media with filters
- [ ] `POST /api/admin/media/upload` - Upload new media
- [ ] `DELETE /api/admin/media/:id` - Delete media
- [ ] Image cropping/editing capabilities

---

## Future Enhancements

- [ ] Newsletter subscription API
- [ ] Contact form submission API
- [ ] Custom post types support
- [ ] Advanced Custom Fields (ACF) integration
- [ ] Multi-language support (WPML/Polylang)
- [ ] GraphQL support (WPGraphQL plugin)
- [ ] Webhooks for content updates
- [ ] Real-time preview for draft posts
- [ ] Progressive Web App (PWA) support
- [ ] Social sharing optimization
- [ ] AMP (Accelerated Mobile Pages) support

---

**Last Updated:** January 18, 2026
