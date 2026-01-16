#!/bin/bash

# ===========================================
# Database Backup Script
# ===========================================
# Usage: ./backup-db.sh [environment]
# Example: ./backup-db.sh prod

set -e

# Determine environment (default to dev)
ENV="${1:-dev}"
ENV_FILE=".env.${ENV}"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Create backups directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${ENV}_${TIMESTAMP}.sql.gz"

echo "Creating backup for ${ENV} environment..."
echo "Database: ${MYSQL_DATABASE}"
echo "Output: ${BACKUP_FILE}"

# Create backup using docker exec
docker-compose exec -T database mysqldump \
    -u root \
    -p"${MYSQL_ROOT_PASSWORD}" \
    "${MYSQL_DATABASE}" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Backup created successfully: ${BACKUP_FILE}"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "  Backup size: ${BACKUP_SIZE}"
else
    echo "✗ Backup failed"
    exit 1
fi
