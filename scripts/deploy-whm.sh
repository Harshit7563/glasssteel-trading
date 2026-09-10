#!/usr/bin/env bash
# Run ON the WHM/cPanel server after git clone
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/glasssteel}"
DOMAIN="${DOMAIN:-glasssteel.in}"

cd "$APP_DIR"

echo "==> Pull latest"
git pull origin main

echo "==> Install deps"
npm run install:all

echo "==> Build React client"
npm run build

echo "==> Ensure server .env exists"
if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo "Edit server/.env with DB password, JWT_SECRET, CLIENT_ORIGIN=https://$DOMAIN"
  exit 1
fi

echo "==> Seed DB (first time only — comment out later)"
# npm run db:setup --prefix server
# npm run db:seed-all-real --prefix server

echo "==> Restart Node app (Passenger / PM2)"
if command -v passenger-config >/dev/null 2>&1; then
  mkdir -p tmp
  touch tmp/restart.txt
  echo "Passenger restart triggered (tmp/restart.txt)"
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart glasssteel || pm2 start server/src/index.js --name glasssteel --cwd "$APP_DIR/server"
  pm2 save
else
  echo "Restart the app from cPanel → Setup Node.js App → Restart"
fi

echo "Done. Visit https://$DOMAIN"
