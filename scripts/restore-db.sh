#!/bin/bash

# ===========================================
# Database Restore Script
# ===========================================
# Usage: ./restore-db.sh [environment] [backup-file]
# Example: ./restore-db.sh staging ./backups/backup_prod_20260116_120000.sql.gz

set -euo pipefail

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

# Read only the values we need (see note in backup-db.sh — do not source salts).
read_env() {
    grep -E "^$1=" "$ENV_FILE" | head -n1 | cut -d= -f2- || echo ''
}

MYSQL_DATABASE="$(read_env MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(read_env MYSQL_ROOT_PASSWORD)"

if [ -z "$MYSQL_DATABASE" ] || [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    echo "Error: MYSQL_DATABASE and MYSQL_ROOT_PASSWORD must be set in $ENV_FILE"
    exit 1
fi

# Scope compose to this environment's overlay + env file (see backup-db.sh).
COMPOSE=(docker compose -f docker-compose.yml -f "docker-compose.${ENV}.yml" --env-file "$ENV_FILE")

echo "WARNING: This will replace the current ${ENV} database!"
echo "Database: ${MYSQL_DATABASE}"
echo "Backup file: ${BACKUP_FILE}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Restoring database..."

# `pipefail` makes a failed gunzip (corrupt/truncated backup) abort the restore
# instead of silently piping an empty stream into mysql and reporting success.
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip < "$BACKUP_FILE" | "${COMPOSE[@]}" exec -T database mysql \
        -u root \
        -p"${MYSQL_ROOT_PASSWORD}" \
        "${MYSQL_DATABASE}"
else
    "${COMPOSE[@]}" exec -T database mysql \
        -u root \
        -p"${MYSQL_ROOT_PASSWORD}" \
        "${MYSQL_DATABASE}" < "$BACKUP_FILE"
fi

echo "✓ Database restored successfully"
