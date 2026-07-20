<?php
/**
 * Plugin Name: Next.js Revalidation Webhook
 * Description: Fires webhook to Next.js on content changes to invalidate ISR cache.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Send revalidation request to Next.js
 */
function nextjs_revalidate($type, $slug = '', $extra = array()) {
    $url = getenv('NEXT_REVALIDATE_URL');
    $secret = getenv('NEXT_REVALIDATE_SECRET');

    if (empty($url) || empty($secret)) {
        // Previously a silent no-op — surface the misconfiguration.
        error_log('[nextjs-revalidate] skipped: NEXT_REVALIDATE_URL / NEXT_REVALIDATE_SECRET not configured');
        return;
    }

    $body = array_merge(array(
        'type' => $type,
        'slug' => $slug,
    ), $extra);

    // Coalesce duplicate dispatches within a single request. A bulk action or a
    // single save can fire the same hook several times; without this each
    // duplicate becomes its own webhook (revalidation storm on the Next side).
    static $sent = array();
    $signature = md5(wp_json_encode($body));
    if (isset($sent[$signature])) {
        return;
    }
    $sent[$signature] = true;

    $response = wp_remote_post($url, array(
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => array(
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $secret,
        ),
        'body' => wp_json_encode($body),
    ));

    // Non-blocking, so we only see dispatch-time errors (Next unreachable, DNS,
    // etc.). ISR's time-based window is the fallback if a purge is lost.
    if (is_wp_error($response)) {
        error_log('[nextjs-revalidate] dispatch failed for ' . $type . '/' . $slug . ': ' . $response->get_error_message());
    }
}

/**
 * Get category slugs for a post
 */
function nextjs_get_post_category_slugs($post_id) {
    $categories = wp_get_post_categories($post_id, array('fields' => 'slugs'));
    return is_array($categories) ? $categories : array();
}

/**
 * Get tag slugs for a post
 */
function nextjs_get_post_tag_slugs($post_id) {
    $tags = wp_get_post_tags($post_id, array('fields' => 'slugs'));
    return is_array($tags) ? $tags : array();
}

/**
 * Hook: Post status transition (publish, update, trash)
 */
add_action('transition_post_status', function($new_status, $old_status, $post) {
    // Only handle posts and pages
    if (!in_array($post->post_type, array('post', 'page'), true)) {
        return;
    }

    // Only fire if transitioning to/from published
    if ($new_status !== 'publish' && $old_status !== 'publish') {
        return;
    }

    $type = $post->post_type === 'page' ? 'page' : 'post';
    $slug = $post->post_name;

    $extra = array();
    if ($type === 'post') {
        $extra['categories'] = nextjs_get_post_category_slugs($post->ID);
        $extra['tags'] = nextjs_get_post_tag_slugs($post->ID);
    }

    nextjs_revalidate($type, $slug, $extra);
}, 10, 3);

/**
 * Hook: Category edited
 */
add_action('edited_category', function($term_id) {
    $term = get_term($term_id, 'category');
    if ($term && !is_wp_error($term)) {
        nextjs_revalidate('category', $term->slug);
    }
});

/**
 * Hook: Tag edited
 */
add_action('edited_post_tag', function($term_id) {
    $term = get_term($term_id, 'post_tag');
    if ($term && !is_wp_error($term)) {
        nextjs_revalidate('tag', $term->slug);
    }
});

/**
 * Hook: Category/tag created or deleted
 */
add_action('created_category', function($term_id) {
    nextjs_revalidate('category');
});

add_action('delete_category', function($term_id) {
    nextjs_revalidate('category');
});

add_action('created_post_tag', function($term_id) {
    nextjs_revalidate('tag');
});

add_action('delete_post_tag', function($term_id) {
    nextjs_revalidate('tag');
});

/**
 * Hook: User profile updated (author changes)
 *
 * Only revalidate for users who actually have published posts — otherwise every
 * subscriber/admin profile edit would purge author caches for a page that
 * doesn't exist on the frontend.
 */
add_action('profile_update', function($user_id) {
    $user = get_userdata($user_id);
    if (!$user) {
        return;
    }

    if ((int) count_user_posts($user_id, 'post', true) === 0) {
        return;
    }

    nextjs_revalidate('author', $user->user_nicename);
});
