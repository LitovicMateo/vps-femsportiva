<?php
/**
 * Plugin Name: Fix Admin URL Prefix
 * Description: nginx strips the /wp prefix before proxying, so WordPress sees /wp-admin/... and builds
 *              redirect_to / form URLs without the prefix. Those then hit nginx's 301 for bare /wp-admin
 *              paths, which turns a settings POST into a GET (changes silently not saved). Restore the
 *              prefix on REQUEST_URI for admin and login requests.
 * Version: 1.0.0
 */

$fap_prefix = parse_url((string) getenv('WORDPRESS_URL'), PHP_URL_PATH);
$fap_prefix = $fap_prefix ? rtrim($fap_prefix, '/') : '';

if (
    $fap_prefix !== ''
    && isset($_SERVER['REQUEST_URI'])
    && preg_match('#^/wp-(admin|login)#', $_SERVER['REQUEST_URI'])
) {
    $_SERVER['REQUEST_URI'] = $fap_prefix . $_SERVER['REQUEST_URI'];
}
