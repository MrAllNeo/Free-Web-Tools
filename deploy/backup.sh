#!/usr/bin/env bash
# FWT yedekleme — Postgres dump.
#
# Kullanım:  ./backup.sh [hedef-dizin]
# Cron:      0 4 * * *  /srv/fwt/Free-Web-Tools/deploy/backup.sh /srv/backups

set -euo pipefail

DESTINATION="${1:-/srv/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$DESTINATION"
cd "$COMPOSE_DIR"

# shellcheck disable=SC1091
[ -f .env ] && set -a && . ./.env && set +a

echo "→ Postgres dump alınıyor"
docker compose exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-fwt}" -d "${POSTGRES_DB:-fwt}" --clean --if-exists \
  | gzip > "$DESTINATION/postgres-$STAMP.sql.gz"

echo "→ $KEEP_DAYS günden eski yedekler siliniyor"
find "$DESTINATION" -name 'postgres-*.sql.gz' -mtime "+$KEEP_DAYS" -delete

echo "✓ Yedekleme tamam: $DESTINATION"
ls -lh "$DESTINATION" | tail -5
