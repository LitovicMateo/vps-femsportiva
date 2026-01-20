<?php
/**
 * Plugin Name: All-in-One WP Migration Unlimited Upload
 * Description: Removes the 512MB upload limit from All-in-One WP Migration plugin
 * Version: 1.0
 * Author: Custom
 */

// Increase import file size limit to 2GB
add_filter('ai1wm_max_file_size', function() {
    return 2147483648; // 2GB in bytes
});

// Increase chunk size for large files
add_filter('ai1wm_max_chunk_size', function() {
    return 5242880; // 5MB chunks
});
