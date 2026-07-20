/**
 * TypeScript interfaces for WordPress REST API v2
 * Based on: https://developer.wordpress.org/rest-api/reference/
 */

/**
 * WordPress REST API Post object
 */
export interface WP_REST_API_Post {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  sticky: boolean;
  template: string;
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  meta: Record<string, unknown>;
  categories: number[];
  tags: number[];
  view_count?: number; // Custom field from view-counter plugin
  // Embedded data when using _embed parameter
  _embedded?: {
    author?: WP_REST_API_User[];
    "wp:featuredmedia"?: WP_REST_API_Media[];
    // "wp:term" is an array of term groups: [0] is categories, [1] is tags, etc.
    "wp:term"?: (WP_REST_API_Category | WP_REST_API_Tag)[][];
  };
}

/**
 * WordPress REST API User object
 */
export interface WP_REST_API_User {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [size: string]: string;
    "24": string;
    "48": string;
    "96": string;
  };
  meta: Record<string, unknown>;
  // Additional fields when context=edit
  email?: string;
  registered_date?: string;
  roles?: string[];
  capabilities?: Record<string, boolean>;
}

/**
 * WordPress REST API Media object
 */
export interface WP_REST_API_Media {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "inherit" | "private";
  type: "attachment";
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  template: string;
  meta: Record<string, unknown>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: "image" | "file" | "video" | "audio";
  mime_type: string;
  media_details: {
    width?: number;
    height?: number;
    file?: string;
    filesize?: number;
    sizes?: {
      [size: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
    image_meta?: Record<string, unknown>;
  };
  post: number | null;
  source_url: string;
}

/**
 * WordPress REST API Category object
 */
export interface WP_REST_API_Category {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "category";
  parent: number;
  meta: Record<string, unknown>;
}

/**
 * WordPress REST API Tag object
 */
export interface WP_REST_API_Tag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "post_tag";
  meta: Record<string, unknown>;
}

/**
 * WordPress REST API Comment object
 */
export interface WP_REST_API_Comment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: "hold" | "approve" | "spam" | "trash";
  type: "comment" | "trackback" | "pingback";
  author_avatar_urls: {
    [size: string]: string;
  };
  meta: Record<string, unknown>;
}

/**
 * WordPress REST API Page object
 * Similar to Post but with different fields
 */
export interface WP_REST_API_Page extends Omit<
  WP_REST_API_Post,
  "categories" | "tags" | "sticky" | "format" | "view_count"
> {
  parent: number;
  menu_order: number;
}

/**
 * WordPress REST API response with pagination headers
 */
export interface WP_REST_API_Posts_Response {
  posts: WP_REST_API_Post[];
  total: number;
  totalPages: number;
}

/**
 * Common query parameters for WordPress REST API
 */
export interface WP_REST_API_Query_Params {
  context?: "view" | "embed" | "edit";
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number | number[];
  author_exclude?: number | number[];
  before?: string;
  exclude?: number | number[];
  include?: number | number[];
  offset?: number;
  order?: "asc" | "desc";
  orderby?:
    | "author"
    | "date"
    | "id"
    | "include"
    | "modified"
    | "parent"
    | "relevance"
    | "slug"
    | "title";
  slug?: string | string[];
  status?: string | string[];
  categories?: number | number[];
  categories_exclude?: number | number[];
  tags?: number | number[];
  tags_exclude?: number | number[];
  sticky?: boolean;
  _embed?: boolean;
}
