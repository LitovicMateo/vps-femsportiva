# Component Organization

This directory contains all React components organized by functionality.

## Directory Structure

```
components/
├── layout/          # Layout components (Header, Footer)
├── post/            # Post-related components (PostCard, PostContent, etc.)
├── author/          # Author components (AuthorCard)
├── ui/              # Reusable UI components (Pagination, ThemeToggle)
├── seo/             # SEO and provider components (StructuredData, ClientProviders)
├── home/            # Homepage-specific components
└── search/          # Search page-specific components
```

## Component Categories

### Layout (`/layout`)

Components that form the main page structure:

- **Header** - Main navigation header with social links and search
- **HeaderWrapper** - Server component wrapper for Header with data fetching
- **Footer** - Site footer

### Post (`/post`)

All components related to blog posts:

- **PostCard** - Post preview card with metadata
- **PostContent** - Renders WordPress post content
- **ShareButtons** - Social sharing buttons
- **ViewCounter** - Tracks and displays post views
- **PaginatedPosts** - Client-side pagination for post lists

### Author (`/author`)

Components for displaying author information:

- **AuthorCard** - Author profile card

### UI (`/ui`)

Reusable UI components:

- **Pagination** - Page navigation component
- **ThemeToggle** - Dark/light theme switcher

### SEO (`/seo`)

SEO and provider components:

- **StructuredData** - JSON-LD structured data for SEO
- **ClientProviders** - Client-side context providers

### Home (`/home`)

Homepage-specific sections:

- **HeroSection** - Featured post hero banner
- **RecentNewsSection** - Latest posts section with sidebar
- **CategorySection** - Category-specific post listings
- **FeaturedSidebar** - Sidebar with featured post and about section

### Search (`/search`)

Search page components:

- **SearchHeader** - Search results page header
- **SearchResults** - Search results display

## Usage

### Direct Imports

```typescript
import Header from "@/components/layout/Header";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
```

### Index Imports (Recommended)

```typescript
import { Header, Footer } from "@/components/layout";
import { PostCard, PostContent } from "@/components/post";
import { Pagination, ThemeToggle } from "@/components/ui";
```

## Benefits

1. **Better Organization** - Related components are grouped together
2. **Easier Navigation** - Find components by functionality
3. **Improved Maintainability** - Clear separation of concerns
4. **Scalability** - Easy to add new components to existing categories
5. **Reduced Clutter** - No more single flat folder with 20+ components

## Guidelines

- Keep component files with their CSS modules in the same folder
- Use index.ts files for cleaner imports
- Place page-specific components in dedicated folders (home, search, etc.)
- Reusable components go in ui/
- Layout components that appear on every page go in layout/
