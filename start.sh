#!/bin/sh

node /app/station-service/seed.js || true

echo "Uruchamianie FuelMate..."
node /app/auth-service/index.js &
node /app/station-service/index.js &
node /app/favorite-service/index.js &
node /app/api-gateway/index.js &
cd /app/frontend && npm run dev -- --host 0.0.0.0 &

echo "FuelMate gotowy:"
echo "  - Frontend:         http://localhost:5173"
echo "  - API Gateway:      http://localhost:3000"
echo "  - Auth Service:     http://localhost:3001"
echo "  - Station Service:  http://localhost:3002"
echo "  - Favorite Service: http://localhost:3004"
echo ""

wait
