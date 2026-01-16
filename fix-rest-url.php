<?php
/**
 * Plugin Name: Fix REST API and Reverse Proxy
 * Description: Fixes REST API when WordPress is behind Nginx reverse proxy
 */

// Trust the X-Forwarded headers from Nginx
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'http') {
    $_SERVER['HTTPS'] = 'off';
}

if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}

// Fix REST API URL when called internally
add_filter('rest_url', function($url, $path, $blog_id, $scheme) {
    // If this is a server-side request (not from browser), use internal URL
    if (defined('REST_REQUEST') && REST_REQUEST && !isset($_SERVER['HTTP_USER_AGENT'])) {
        // Replace external URL with internal container URL
        $url = str_replace('http://localhost:8080/wp/', 'http://wordpress/', $url);
    }
    return $url;
}, 10, 4);

// Ensure proper URL handling for admin
add_filter('admin_url', function($url) {
    return $url;
}, 10, 1);
