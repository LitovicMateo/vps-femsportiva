#!/bin/bash

# ===========================================
# Database Restore Script
# ===========================================
# Usage: ./restore-db.sh [environment] [backup-file]
# Example: ./restore-db.sh staging ./backups/backup_prod_20260116_120000.sql.gz

set -e

# Check arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 [environment] [backup-file]"
    echo "Example: $0 staging ./backups/backup_prod_20260116_120000.sql.gz"
    exit 1
fi

ENV="$1"
BACKUP_FILE="$2"
ENV_FILE=".env.${ENV}"

# Validate inputs
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE not found"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "WARNING: This will replace the current ${ENV} database!"
echo "Database: ${MYSQL_DATABASE}"
echo "Backup file: ${BACKUP_FILE}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Restoring database..."

# Restore backup
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Gzipped backup
    gunzip < "$BACKUP_FILE" | docker-compose exec -T database mysql \
        -u root \
        -p"${MYSQL_ROOT_PASSWORD}" \
        "${MYSQL_DATABASE}"
else
    # Plain SQL backup
    docker-compose exec -T database mysql \
        -u root \
        -p"${MYSQL_ROOT_PASSWORD}" \
        "${MYSQL_DATABASE}" < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✓ Database restored successfully"
else
    echo "✗ Restore failed"
    exit 1
fi
