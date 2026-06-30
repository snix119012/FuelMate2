FROM node:20-alpine

WORKDIR /app

# Kopiowanie package.json i instalacja zależności dla każdego serwisu
COPY auth-service/package*.json ./auth-service/
RUN cd auth-service && npm install

COPY station-service/package*.json ./station-service/
RUN cd station-service && npm install

COPY favorite-service/package*.json ./favorite-service/
RUN cd favorite-service && npm install

COPY api-gateway/package*.json ./api-gateway/
RUN cd api-gateway && npm install

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Kopiowanie kodu źródłowego
COPY auth-service ./auth-service
COPY station-service ./station-service
COPY favorite-service ./favorite-service
COPY api-gateway ./api-gateway
COPY frontend ./frontend

# Skrypt startowy
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000 3001 3002 3004 5173

CMD ["./start.sh"]
