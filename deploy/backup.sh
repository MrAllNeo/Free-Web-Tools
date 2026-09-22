#!/usr/bin/env bash
# FWT yedekleme — Postgres dump + Sahne Avcısı indeksi.
#
# Kullanım:  ./backup.sh [hedef-dizin]
# Cron:      0 4 * * *  /srv/fwt/Free-Web-Tools/deploy/backup.sh /srv/backups
#
# SQLite dosyası worker tarafından sürekli yazılıyor olabilir, bu yüzden düz
# kopyalamak bozuk bir yedek üretebilir. `sqlite3 .backup` çalışan yazarlarla
# tutarlı bir kopya alır; bu yüzden cp yerine o kullanılıyor.

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

echo "→ Sahne Avcısı indeksi alınıyor"
# Konteynerde sqlite3 CLI yoksa Python'un kendi backup API'si aynı işi görür.
docker compose exec -T sahne python -c "
import sqlite3
source = sqlite3.connect('/data/sahne-avcisi.sqlite3')
target = sqlite3.connect('/tmp/index-backup.sqlite3')
with target:
    source.backup(target)
target.close(); source.close()
"
docker compose cp sahne:/tmp/index-backup.sqlite3 "$DESTINATION/sahne-index-$STAMP.sqlite3"
docker compose exec -T sahne rm -f /tmp/index-backup.sqlite3
gzip -f "$DESTINATION/sahne-index-$STAMP.sqlite3"

echo "→ $KEEP_DAYS günden eski yedekler siliniyor"
find "$DESTINATION" -name 'postgres-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
find "$DESTINATION" -name 'sahne-index-*.sqlite3.gz' -mtime "+$KEEP_DAYS" -delete

echo "✓ Yedekleme tamam: $DESTINATION"
ls -lh "$DESTINATION" | tail -5
