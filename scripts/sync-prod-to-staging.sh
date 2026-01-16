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

set -e

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
export $(grep -v '^#' "$PROD_ENV_FILE" | xargs)
PROD_DB="${MYSQL_DATABASE}"

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
# This is a basic example - adjust based on your needs
cat >> "${SANITIZED_FILE}" << 'EOF'

-- Sanitize user data for staging
UPDATE wp_users SET 
    user_email = CONCAT('user', ID, '@staging.local'),
    user_pass = MD5('staging_password_123');

-- Update site URL (will be done via wp-cli or manual config)
-- UPDATE wp_options SET option_value = 'http://localhost:8081' WHERE option_name IN ('siteurl', 'home');
EOF

echo "✓ Data sanitized"

# Step 3: Restore to staging
echo ""
echo "Step 3/4: Restoring to staging database..."
export $(grep -v '^#' "$STAGING_ENV_FILE" | xargs)

echo "Importing to staging database: ${MYSQL_DATABASE}"

docker-compose -f docker-compose.yml -f docker-compose.staging.yml exec -T database mysql \
    -u root \
    -p"${MYSQL_ROOT_PASSWORD}" \
    "${MYSQL_DATABASE}" < "$SANITIZED_FILE"

echo "✓ Database restored to staging"

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
