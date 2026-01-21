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
        'permission_callback' => '__return_true', // Public endpoint
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
            $count = get_post_meta($post['id'], 'post_views_count', true);
            return $count ? intval($count) : 0;
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
 * Get client IP address (handles proxies)
 */
function vps_get_client_ip() {
    $ip = '';
    
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Handle multiple IPs (take the first one)
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    
    return filter_var(trim($ip), FILTER_VALIDATE_IP) ? trim($ip) : '0.0.0.0';
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
