#!/bin/bash

# ===========================================
# Database Backup Script
# ===========================================
# Usage: ./backup-db.sh [environment]
# Example: ./backup-db.sh prod

set -euo pipefail

# Determine environment (default to dev)
ENV="${1:-dev}"
ENV_FILE=".env.${ENV}"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

# Read only the values we need. We intentionally do NOT source the whole env
# file: it contains WordPress salts that can include shell-significant
# characters (backticks, $, etc.) which sourcing would execute.
read_env() {
    grep -E "^$1=" "$ENV_FILE" | head -n1 | cut -d= -f2- || echo ''
}

MYSQL_DATABASE="$(read_env MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(read_env MYSQL_ROOT_PASSWORD)"

if [ -z "$MYSQL_DATABASE" ] || [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    echo "Error: MYSQL_DATABASE and MYSQL_ROOT_PASSWORD must be set in $ENV_FILE"
    exit 1
fi

# Scope compose to this environment's overlay + env file, so it targets the
# right stack instead of a base-only project (which warns on unset vars).
COMPOSE=(docker compose -f docker-compose.yml -f "docker-compose.${ENV}.yml" --env-file "$ENV_FILE")

# Create backups directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${ENV}_${TIMESTAMP}.sql.gz"

echo "Creating backup for ${ENV} environment..."
echo "Database: ${MYSQL_DATABASE}"
echo "Output: ${BACKUP_FILE}"

# `pipefail` (set above) makes the `if` see a mysqldump failure even though it is
# piped into gzip — previously `$?` only reflected gzip, so a broken dump that
# still gzipped an empty/partial stream reported success (silent corruption).
if "${COMPOSE[@]}" exec -T database mysqldump \
    -u root \
    -p"${MYSQL_ROOT_PASSWORD}" \
    "${MYSQL_DATABASE}" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    | gzip > "$BACKUP_FILE"; then
    echo "✓ Backup created successfully: ${BACKUP_FILE}"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "  Backup size: ${BACKUP_SIZE}"

    # Prune old backups for this environment (default: keep 14 days).
    RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
    find "$BACKUP_DIR" -name "backup_${ENV}_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete
else
    echo "✗ Backup failed"
    rm -f "$BACKUP_FILE"
    exit 1
fi
