#!/bin/bash
set -e

echo "=== Kalimaya Deploy Script ==="
echo "Target: Synology NAS / VPS"

# Check .env.prod exists
if [ ! -f .env.prod ]; then
  echo "ERROR: .env.prod tidak ditemukan!"
  echo "Buat dari template: cp .env.prod.example .env.prod"
  echo "Lalu isi DB_PASSWORD dan JWT_SECRET"
  exit 1
fi

# Load env
export $(grep -v '^#' .env.prod | xargs)

echo "[1/5] Pull latest code..."
git pull origin main 2>/dev/null || echo "Skipped (not a git repo)"

echo "[2/5] Build images..."
docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

echo "[3/5] Stop old containers..."
docker compose -f docker-compose.prod.yml --env-file .env.prod down

echo "[4/5] Start services..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo "[5/5] Health check..."
sleep 8
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/health)
if [ "$STATUS" = "200" ]; then
  echo "✅ Backend healthy (HTTP $STATUS)"
else
  echo "⚠️  Backend returned HTTP $STATUS — check logs:"
  docker logs kalimaya-backend --tail 30
fi

WEB=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3100)
echo "Web admin: HTTP $WEB"

echo ""
echo "=== Deploy selesai ==="
echo "Backend : http://127.0.0.1:5000"
echo "Web Admin: http://127.0.0.1:3100"
echo ""
echo "Synology DSM Reverse Proxy:"
echo "  Source : https://${DOMAIN:-kalimaya.local}"
echo "  Dest   : http://127.0.0.1:3100"
echo "  (Control Panel > Application Portal > Reverse Proxy)"
