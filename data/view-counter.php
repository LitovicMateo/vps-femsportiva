<?php
/**
 * Plugin Name: Post View Counter
 * Description: Tracks post views via REST API and exposes view count in post data
 * Version: 1.0.0
 * Author: Auto-generated
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register custom REST API endpoints for view tracking
 */
add_action('rest_api_init', function () {
    // Endpoint to increment view count
    register_rest_route('custom/v1', '/post-view/(?P<id>\d+)', [
        'methods'  => 'POST',
        'callback' => 'vps_increment_post_view_count',
        // Writes must come from the trusted Next.js proxy, not directly from
        // the public internet. See vps_view_write_permission().
        'permission_callback' => 'vps_view_write_permission',
        'args' => [
            'id' => [
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ],
        ],
    ]);
    
    // Endpoint to get view count
    register_rest_route('custom/v1', '/post-views/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => 'vps_get_post_view_count',
        'permission_callback' => '__return_true',
        'args' => [
            'id' => [
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ],
        ],
    ]);
});

/**
 * Permission gate for the view-write endpoint.
 *
 * The write endpoint is reachable directly through Nginx (`/wp-json/...`), so
 * without a gate any client could inflate counts and amplify DB writes. We
 * require a shared bearer token that only the server-side Next.js proxy knows
 * (env var VIEWS_SECRET, mirrored on the Next.js side). If no secret is
 * configured we fall back to open (backward compatible), but every environment
 * wires one via docker-compose.
 */
function vps_view_write_permission($request) {
    $secret = getenv('VIEWS_SECRET');

    if (empty($secret)) {
        return true; // No secret configured — legacy open behavior.
    }

    $auth = $request->get_header('authorization');
    if ($auth && preg_match('/^Bearer\s+(.+)$/i', trim($auth), $m)
        && hash_equals($secret, trim($m[1]))) {
        return true;
    }

    return new WP_Error(
        'rest_forbidden',
        'Missing or invalid view token',
        ['status' => 403]
    );
}

/**
 * Increment post view count with basic spam prevention
 */
function vps_increment_post_view_count($request) {
    $post_id = intval($request['id']);
    
    // Check if post exists
    if (!get_post($post_id)) {
        return new WP_Error('invalid_post', 'Post not found', ['status' => 404]);
    }
    
    // Basic spam prevention: Check if this IP has viewed this post recently (within 1 hour)
    $client_ip = vps_get_client_ip();
    $transient_key = 'post_view_' . $post_id . '_' . md5($client_ip);
    
    if (get_transient($transient_key)) {
        // IP has viewed this post within the last hour, don't increment
        $count = get_post_meta($post_id, 'post_views_count', true);
        return [
            'success' => true,
            'post_id' => $post_id,
            'views' => $count ? intval($count) : 0,
            'incremented' => false,
            'message' => 'View already counted recently',
        ];
    }
    
    // Get current count
    $count = get_post_meta($post_id, 'post_views_count', true);
    $count = $count ? intval($count) : 0;
    
    // Increment
    $new_count = $count + 1;
    update_post_meta($post_id, 'post_views_count', $new_count);
    
    // Set transient to prevent duplicate counting (1 hour)
    set_transient($transient_key, true, HOUR_IN_SECONDS);
    
    return [
        'success' => true,
        'post_id' => $post_id,
        'views' => $new_count,
        'incremented' => true,
    ];
}

/**
 * Get post view count
 */
function vps_get_post_view_count($request) {
    $post_id = intval($request['id']);
    
    if (!get_post($post_id)) {
        return new WP_Error('invalid_post', 'Post not found', ['status' => 404]);
    }
    
    $count = get_post_meta($post_id, 'post_views_count', true);
    
    return [
        'success' => true,
        'post_id' => $post_id,
        'views' => $count ? intval($count) : 0,
    ];
}

/**
 * Expose view count in REST API post response
 */
add_action('rest_api_init', function() {
    register_rest_field('post', 'view_count', [
        'get_callback' => function($post) {
            // intval() maps unset ('') and stored '0' to 0 correctly; the old
            // `$count ? intval($count) : 0` relied on PHP treating '0' as falsy.
            return intval(get_post_meta($post['id'], 'post_views_count', true));
        },
        'update_callback' => null,
        'schema' => [
            'description' => 'Post view count',
            'type' => 'integer',
            'context' => ['view', 'edit'],
        ],
    ]);
});

/**
 * Get the client IP address for view dedup.
 *
 * Only trusts `X-Real-IP`, which the reverse proxy controls: Nginx overwrites
 * it with `$remote_addr` on direct hits, and the Next.js proxy forwards the
 * real visitor IP for app traffic. We deliberately do NOT trust `HTTP_CLIENT_IP`
 * or arbitrary `X-Forwarded-For` entries — both are fully attacker-controlled
 * and would let a client rotate a header per request to defeat dedup and
 * inflate the count / amplify DB writes. Falls back to `REMOTE_ADDR`.
 */
function vps_get_client_ip() {
    $candidates = [];

    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $candidates[] = $_SERVER['HTTP_X_REAL_IP'];
    }
    if (!empty($_SERVER['REMOTE_ADDR'])) {
        $candidates[] = $_SERVER['REMOTE_ADDR'];
    }

    foreach ($candidates as $ip) {
        $ip = trim($ip);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return '0.0.0.0';
}

/**
 * Optional: Add view count to WordPress admin columns
 */
add_filter('manage_posts_columns', function($columns) {
    $columns['post_views'] = 'Views';
    return $columns;
});

add_action('manage_posts_custom_column', function($column_name, $post_id) {
    if ($column_name === 'post_views') {
        $count = get_post_meta($post_id, 'post_views_count', true);
        echo $count ? intval($count) : '0';
    }
}, 10, 2);

add_filter('manage_edit-post_sortable_columns', function($columns) {
    $columns['post_views'] = 'post_views';
    return $columns;
});
