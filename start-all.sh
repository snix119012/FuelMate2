#!/bin/bash

# Skrypt uruchamiający wszystkie serwisy FuelMate jednocześnie.
# Użycie: ./start-all.sh
# Zatrzymanie: Ctrl+C (lub ./stop-all.sh z innego terminala)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
PID_FILE="$LOG_DIR/pids"

# Wyczyść stary plik PIDów
> "$PID_FILE"

cleanup() {
  echo ""
  echo "Zatrzymywanie serwisów..."
  # Zabij bezpośrednie dzieci bieżącego skryptu
  pkill -9 -P $$ 2>/dev/null || true
  # Zabij procesy z zapisanych PIDów (to są bezpośrednie procesy node/vite)
  if [ -f "$PID_FILE" ]; then
    while read -r pid; do
      kill -9 "$pid" 2>/dev/null || true
    done < "$PID_FILE"
    rm "$PID_FILE"
  fi
  echo "Zatrzymano."
  exit 0
}

trap cleanup SIGINT SIGTERM

dependencies_missing() {
  local dir="$1"
  [ ! -f "$dir/package.json" ] && return 1
  node -e "
    const pkg = require('$dir/package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const fs = require('fs');
    for (const name of Object.keys(deps)) {
      if (!fs.existsSync('$dir/node_modules/' + name)) {
        process.exit(0);
      }
    }
    process.exit(1);
  " 2>/dev/null
}

ensure_node_modules() {
  local dir="$1"
  if [ -f "$dir/package.json" ]; then
    if [ ! -d "$dir/node_modules" ] || dependencies_missing "$dir"; then
      echo "Instaluję/aktualizuję zależności w $dir..."
      (cd "$dir" && npm install)
    fi
  fi
}

start_service() {
  local name="$1"
  local cmd="$2"
  local dir="$ROOT/$name"
  local log="$LOG_DIR/$name.log"

  if [ ! -d "$dir" ]; then
    echo "UWAGA: Brak katalogu $name — pomijam."
    return
  fi

  ensure_node_modules "$dir"

  echo "Uruchamianie $name..."
  (cd "$dir" && eval "$cmd" > "$log" 2>&1 &)
  echo $! >> "$PID_FILE"
}

echo "Uruchamianie FuelMate..."

start_service "auth-service" "node index.js"
start_service "station-service" "node index.js"

if [ -f "$ROOT/alert-service/package.json" ]; then
  start_service "alert-service" "node index.js"
else
  echo "UWAGA: alert-service nie ma package.json — pomijam (serwis niedokończony)."
fi

start_service "favorite-service" "node index.js"
start_service "api-gateway" "node index.js"
start_service "frontend" "npm run dev"

sleep 6

echo ""
echo "Wszystkie dostępne serwisy uruchomione:"
echo "  - Auth Service:     http://localhost:3001"
echo "  - Station Service:  http://localhost:3002"
echo "  - Alert Service:    http://localhost:3003 (jeśli ma package.json)"
echo "  - Favorite Service: http://localhost:3004"
echo "  - API Gateway:      http://localhost:3000"
echo "  - Frontend:         http://localhost:5173"
echo ""
echo "Logi znajdziesz w: $LOG_DIR/"
echo "Naciśnij Ctrl+C, aby zatrzymać wszystko."
echo ""

# Czekaj na sygnał zatrzymania
while true; do
  sleep 1
done
