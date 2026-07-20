#!/bin/bash

# ===========================================
# Sync Production to Staging Script
# ===========================================
# This script:
# 1. Backs up production database
# 2. Sanitizes sensitive data
# 3. Restores to staging environment
# 4. Syncs media uploads from production
# ===========================================

set -euo pipefail

PROD_ENV_FILE=".env.prod"
STAGING_ENV_FILE=".env.staging"

# Check if environment files exist
if [ ! -f "$PROD_ENV_FILE" ]; then
    echo "Error: Production environment file $PROD_ENV_FILE not found"
    exit 1
fi

if [ ! -f "$STAGING_ENV_FILE" ]; then
    echo "Error: Staging environment file $STAGING_ENV_FILE not found"
    exit 1
fi

# Read a single var from an env file. We do NOT source env files — they contain
# WordPress salts with shell-significant characters that sourcing would execute.
read_env() {
    grep -E "^$2=" "$1" | head -n1 | cut -d= -f2- || echo ''
}

# The dump carries PRODUCTION's table prefix. NOTE: a dump-based sync only works
# if staging uses the SAME WORDPRESS_TABLE_PREFIX as production — otherwise the
# imported tables keep prod's prefix and staging's WordPress (configured with its
# own prefix) won't find them. Verify these match before relying on this script.
PROD_PREFIX="$(read_env "$PROD_ENV_FILE" WORDPRESS_TABLE_PREFIX)"
PROD_PREFIX="${PROD_PREFIX:-wp_}"

STAGING_DB="$(read_env "$STAGING_ENV_FILE" MYSQL_DATABASE)"
STAGING_ROOT_PW="$(read_env "$STAGING_ENV_FILE" MYSQL_ROOT_PASSWORD)"

if [ -z "$STAGING_DB" ] || [ -z "$STAGING_ROOT_PW" ]; then
    echo "Error: MYSQL_DATABASE and MYSQL_ROOT_PASSWORD must be set in $STAGING_ENV_FILE"
    exit 1
fi

# Per-run random staging password (printed once below) instead of a hard-coded
# literal committed to the repo.
STAGING_PASSWORD="staging-$(date +%s)-$RANDOM"

# Reused staging compose invocation.
STAGING_COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.staging.yml)

# Create temporary directory for sync
TEMP_DIR="./backups/temp_sync"
mkdir -p "$TEMP_DIR"

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="./backups/sync_prod_to_staging_${TIMESTAMP}.sql"
SANITIZED_FILE="${TEMP_DIR}/sanitized_${TIMESTAMP}.sql"

echo "========================================"
echo "Production to Staging Sync"
echo "========================================"
echo ""

# Step 1: Create production backup
echo "Step 1/4: Creating production database backup..."

# Note: This assumes you have SSH access to production server
# Modify this section based on your production setup
echo "Note: This script assumes local production setup."
echo "For remote VPS, you'll need to:"
echo "  1. SSH to VPS and run: docker-compose exec -T database mysqldump ..."
echo "  2. SCP the backup file back to local machine"
echo ""
read -p "Do you have a production backup file ready? (yes/no): " HAS_BACKUP

if [ "$HAS_BACKUP" != "yes" ]; then
    echo "Please create a production backup first using:"
    echo "  ./scripts/backup-db.sh prod"
    echo ""
    read -p "Enter the path to your production backup file: " PROD_BACKUP_PATH
    
    if [ ! -f "$PROD_BACKUP_PATH" ]; then
        echo "Error: Backup file not found: $PROD_BACKUP_PATH"
        exit 1
    fi
    
    # Decompress if needed
    if [[ "$PROD_BACKUP_PATH" == *.gz ]]; then
        echo "Decompressing backup..."
        gunzip < "$PROD_BACKUP_PATH" > "$BACKUP_FILE"
    else
        cp "$PROD_BACKUP_PATH" "$BACKUP_FILE"
    fi
else
    echo "Latest production backup:"
    LATEST_PROD_BACKUP=$(ls -t ./backups/backup_prod_*.sql.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_PROD_BACKUP" ]; then
        echo "No production backups found. Creating new backup..."
        ./scripts/backup-db.sh prod
        LATEST_PROD_BACKUP=$(ls -t ./backups/backup_prod_*.sql.gz | head -1)
    fi
    
    echo "Using: $LATEST_PROD_BACKUP"
    gunzip < "$LATEST_PROD_BACKUP" > "$BACKUP_FILE"
fi

echo "✓ Production backup ready"

# Step 2: Sanitize data
echo ""
echo "Step 2/4: Sanitizing sensitive data..."

# Create sanitized copy
cp "$BACKUP_FILE" "$SANITIZED_FILE"

# Sanitize user emails and passwords
# This is a basic example - adjust based on your needs.
# Uses the production table prefix (the dump's prefix), not a hard-coded wp_.
cat >> "${SANITIZED_FILE}" << EOF

-- Sanitize user data for staging
UPDATE ${PROD_PREFIX}users SET
    user_email = CONCAT('user', ID, '@staging.local');
EOF

# Reset passwords via WP-CLI after import (WordPress uses phpass, not MD5)
# This is done in Step 3 after the database is imported

echo "✓ Data sanitized"

# Step 3: Restore to staging
echo ""
echo "Step 3/4: Restoring to staging database..."
echo "Importing to staging database: ${STAGING_DB}"

"${STAGING_COMPOSE[@]}" exec -T database mysql \
    -u root \
    -p"${STAGING_ROOT_PW}" \
    "${STAGING_DB}" < "$SANITIZED_FILE"

echo "✓ Database restored to staging"

# Reset staging passwords via WP-CLI (phpass-compatible). Collect the IDs first,
# then iterate — the previous nested `exec` inside a `while read` pipeline was
# brittle and swallowed all errors.
echo "Resetting user passwords for staging..."
mapfile -t USER_IDS < <("${STAGING_COMPOSE[@]}" exec -T wordpress wp user list --field=ID --allow-root)
for user_id in "${USER_IDS[@]}"; do
    [ -n "$user_id" ] || continue
    "${STAGING_COMPOSE[@]}" exec -T wordpress \
        wp user update "$user_id" --user_pass="$STAGING_PASSWORD" --allow-root
done
echo "✓ Staging passwords reset to: ${STAGING_PASSWORD}"

# Step 4: Sync media uploads
echo ""
echo "Step 4/4: Syncing media uploads..."
echo "Note: For remote VPS, use:"
echo "  rsync -avz user@vps:/var/www/vps-blog/uploads/ ./data/uploads/"
echo ""
read -p "Do you want to sync uploads from production? (yes/no): " SYNC_UPLOADS

if [ "$SYNC_UPLOADS" = "yes" ]; then
    # For local testing, this might just copy from one place to another
    # For production, you'd use rsync from VPS
    echo "Please manually sync uploads if on remote VPS"
    echo "Command: rsync -avz user@your-vps:/var/www/vps-blog/uploads/ ./data/uploads/"
fi

# Cleanup
echo ""
echo "Cleaning up temporary files..."
rm -f "$BACKUP_FILE"
rm -rf "$TEMP_DIR"

echo ""
echo "========================================"
echo "✓ Sync completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start staging environment: make staging"
echo "2. Update WordPress URLs in wp-admin (Settings > General)"
echo "3. Test your staging site"
echo ""
