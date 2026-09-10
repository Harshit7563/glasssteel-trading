#!/bin/zsh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

pkill -f "node src/index.js" 2>/dev/null || true
pkill -f "vite --host" 2>/dev/null || true
sleep 1

cd "$ROOT/server"
nohup npm start > /tmp/glassteel-api.log 2>&1 &

cd "$ROOT/client"
nohup npx vite --host 127.0.0.1 --port 5173 --strictPort > /tmp/glassteel-vite.log 2>&1 &

sleep 3
echo "API:  http://127.0.0.1:5001/api/health"
curl -s http://127.0.0.1:5001/api/health || true
echo
echo "SITE: http://127.0.0.1:5173/"
curl -s -o /dev/null -w "site HTTP %{http_code}\n" http://127.0.0.1:5173/ || true
