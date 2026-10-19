#!/bin/bash

# ===========================================
# Install daily DB backup cron job
# ===========================================
# Usage (from the repo root, on the VPS): ./scripts/install-backup-cron.sh [environment]
# Default environment: prod. Runs daily at 03:15, logs to backups/cron.log.
# Re-running replaces the existing entry. Retention: BACKUP_RETENTION_DAYS (default 14).

set -euo pipefail

ENV="${1:-prod}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKER="# femsportiva-db-backup-${ENV}"
LINE="15 3 * * * cd ${REPO} && mkdir -p backups && bash scripts/backup-db.sh ${ENV} >> backups/cron.log 2>&1 ${MARKER}"

( crontab -l 2>/dev/null | grep -vF "$MARKER" || true; echo "$LINE" ) | crontab -

echo "✓ Installed cron job:"
echo "  $LINE"
