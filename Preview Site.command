#!/bin/bash
# Double-click to preview the portfolio in your browser.
# Close this window (or press Ctrl+C) to stop the server.

cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 was not found."
  echo "Open Terminal and run: xcode-select --install"
  echo "Then double-click this file again."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

# Start at 8000; if it's already in use, try the next port up
PORT=8000
while lsof -i :"$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

python3 -m http.server "$PORT" --bind 127.0.0.1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT INT TERM HUP

sleep 1
open "http://localhost:$PORT"

echo ""
echo "Previewing at http://localhost:$PORT"
echo "Close this window or press Ctrl+C to stop."
wait $SERVER_PID
