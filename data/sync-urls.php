<?php
/**
 * Plugin Name: Sync Site URLs from Environment
 * Description: Keeps siteurl and home options in sync with WORDPRESS_URL env var on every boot
 * Version: 1.0.0
 */

add_action('init', function () {
    $env_url = getenv('WORDPRESS_URL');
    if (empty($env_url)) {
        return;
    }

    $env_url = rtrim($env_url, '/');

    if (get_option('siteurl') !== $env_url) {
        update_option('siteurl', $env_url);
    }

    if (get_option('home') !== $env_url) {
        update_option('home', $env_url);
    }
}, 1);
