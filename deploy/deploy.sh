#!/usr/bin/env bash
# Runs ON THE VPS (Ubuntu). Called by scripts/deploy.ps1 over SSH. Idempotent.
set -euo pipefail
APP_DIR=/opt/ndflk
REPO=https://github.com/nuwansamaranayake/ndflk.git
if [ ! -d "$APP_DIR/.git" ]; then git clone "$REPO" "$APP_DIR"; fi
cd "$APP_DIR"
git fetch --quiet origin main && git reset --quiet --hard origin/main
export APP_VERSION="$(git rev-parse --short HEAD)"
if [ ! -f deploy/.env ]; then echo "deploy/.env missing. Create it from .env.example first." >&2; exit 1; fi
echo "APP_VERSION=$APP_VERSION" > deploy/.version
set -a; . deploy/.env; set +a
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env build --build-arg APP_VERSION="$APP_VERSION" ndflk-web
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d
for i in $(seq 1 30); do if docker exec ndflk-db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then break; fi; sleep 2; done
docker exec ndflk-web node scripts/migrate.mjs
docker exec ndflk-web node scripts/seed.mjs
TABLES=$(docker exec ndflk-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'" | tr -d '[:space:]')
echo "tables=$TABLES"
sleep 3
docker exec -e NDF_BASE_URL=http://127.0.0.1:3000 -e NDF_ADMIN_TOKEN="$ADMIN_TOKEN" -e EXPECTED_TABLES=14 ndflk-web node /app/scripts/smoke.mjs --tables "$TABLES" || { echo "SMOKE FAILED"; docker logs --tail 50 ndflk-web; exit 1; }
echo "deploy ok $APP_VERSION"
