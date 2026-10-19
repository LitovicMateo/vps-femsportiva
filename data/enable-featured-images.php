<?php
/**
 * Plugin Name: Enable Featured Images Support
 * Plugin URI: https://femsportiva.com
 * Description: Must-use plugin that ensures featured images (post thumbnails) are enabled for all post types and properly exposed via REST API for headless WordPress.
 * Version: 1.0.1
 * Author: FemSportiva
 * License: GPL v2 or later
 *
 * This plugin must be placed in wp-content/mu-plugins/ to auto-load.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enable theme support for post thumbnails (featured images)
 */
function femsportiva_enable_featured_images() {
    // Enable post thumbnails for all post types
    add_theme_support('post-thumbnails');
    
    // Enable support for all post types explicitly
    add_post_type_support('post', 'thumbnail');
    add_post_type_support('page', 'thumbnail');
    
    // Register custom image sizes for responsive images
    // These can be used in your Next.js frontend
    add_image_size('thumbnail-small', 150, 150, true);      // Small square thumbnail
    add_image_size('thumbnail-medium', 300, 300, true);     // Medium square thumbnail
    add_image_size('featured-large', 1200, 630, true);      // Large featured image (OG image size)
    add_image_size('featured-medium', 800, 450, true);      // Medium featured image
    add_image_size('featured-small', 400, 225, true);       // Small featured image
}
add_action('after_setup_theme', 'femsportiva_enable_featured_images');

/**
 * Ensure featured images are included in REST API responses
 */
function femsportiva_register_featured_image_rest_field() {
    $post_types = get_post_types(['show_in_rest' => true], 'names');
    
    foreach ($post_types as $post_type) {
        register_rest_field(
            $post_type,
            'featured_image',
            [
                'get_callback' => 'femsportiva_get_featured_image_rest',
                'schema' => [
                    'description' => __('Featured image details'),
                    'type' => 'object',
                    'properties' => [
                        'id' => [
                            'type' => 'integer',
                            'description' => __('Featured image ID'),
                        ],
                        'url' => [
                            'type' => 'string',
                            'format' => 'uri',
                            'description' => __('Featured image URL'),
                        ],
                        'alt' => [
                            'type' => 'string',
                            'description' => __('Featured image alt text'),
                        ],
                        'width' => [
                            'type' => 'integer',
                            'description' => __('Featured image width'),
                        ],
                        'height' => [
                            'type' => 'integer',
                            'description' => __('Featured image height'),
                        ],
                        'sizes' => [
                            'type' => 'object',
                            'description' => __('Available image sizes'),
                        ],
                    ],
                ],
            ]
        );
    }
}
add_action('rest_api_init', 'femsportiva_register_featured_image_rest_field');

/**
 * Get featured image data for REST API
 */
function femsportiva_get_featured_image_rest($object, $field_name, $request) {
    $featured_image_id = get_post_thumbnail_id($object['id']);
    
    if (!$featured_image_id) {
        return null;
    }
    
    $image_data = wp_get_attachment_image_src($featured_image_id, 'full');
    $image_alt = get_post_meta($featured_image_id, '_wp_attachment_image_alt', true);
    
    if (!$image_data) {
        return null;
    }
    
    // Get all available sizes
    $sizes = [];
    $available_sizes = ['thumbnail', 'medium', 'large', 'full', 'thumbnail-small', 'thumbnail-medium', 'featured-large', 'featured-medium', 'featured-small'];
    
    foreach ($available_sizes as $size) {
        $size_data = wp_get_attachment_image_src($featured_image_id, $size);
        if ($size_data) {
            $sizes[$size] = [
                'url' => $size_data[0],
                'width' => $size_data[1],
                'height' => $size_data[2],
            ];
        }
    }
    
    return [
        'id' => $featured_image_id,
        'url' => $image_data[0],
        'alt' => $image_alt ?: '',
        'width' => $image_data[1],
        'height' => $image_data[2],
        'sizes' => $sizes,
    ];
}

/**
 * Add featured image to REST API _embed response
 */
function femsportiva_add_featured_image_to_embed($response, $post, $request) {
    if (has_post_thumbnail($post->ID)) {
        $featured_image_id = get_post_thumbnail_id($post->ID);
        $featured_image = wp_get_attachment_image_src($featured_image_id, 'full');
        
        if ($featured_image) {
            $response->data['featured_media_url'] = $featured_image[0];
        }
    }
    
    return $response;
}
add_filter('rest_prepare_post', 'femsportiva_add_featured_image_to_embed', 10, 3);
add_filter('rest_prepare_page', 'femsportiva_add_featured_image_to_embed', 10, 3);
