<?php
/**
 * Plugin Name: WordPress Internal REST API Fix
 * Description: Routes internal WordPress REST API calls through Docker network instead of Nginx proxy
 * Version: 1.0
 */

// Intercept HTTP requests made by WordPress to its own REST API
add_filter('pre_http_request', function($preempt, $args, $url) {
    // Log to error log for debugging
    error_log("WordPress HTTP Request: " . $url);
    
    // Check if this is a request to our own REST API
    $site_url = get_option('siteurl');
    $home_url = get_option('home');
    
    // If the request is to our own WordPress REST API
    if (strpos($url, '/wp-json/') !== false && 
        (strpos($url, 'wordpress') !== false || strpos($url, $site_url) !== false)) {
        
        // Replace the external URL with internal WordPress service (Docker network)
        $internal_url = str_replace(
            array($site_url . '/wp-json/', $home_url . '/wp-json/'),
            'http://localhost/wp-json/',
            $url
        );
        
        error_log("Rewritten to internal URL: " . $internal_url);
        
        // Make the request using the internal URL instead
        $response = wp_remote_request($internal_url, $args);
        error_log("Response code: " . wp_remote_retrieve_response_code($response));
        
        return $response;
    }
    
    return $preempt;
}, 10, 3);
