#!/bin/zsh
ROOT="/Users/harshit/GLASSTEEL TRADING (OPC) PRIVATE LIMITED"
cd "$ROOT" || exit 1

# free ports
for p in 5173 5001; do
  pid=$(lsof -ti tcp:$p -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pid" ]; then kill $pid 2>/dev/null || true; fi
done
sleep 1

echo "Starting GLASSTEEL…"
echo "SITE → http://127.0.0.1:5173/"
echo "API  → http://127.0.0.1:5001/"
echo "Is window ko OPEN rakho — band kiya to site band ho jayegi."
echo ""

npm run dev
