# FuelMate

Aplikacja webowa do wyszukiwania stacji paliw, przeglądania cen, dodawania opinii, zgłaszania alertów drogowych oraz zarządzania ulubionymi stacjami.

## Architektura

Projekt oparty jest na mikroserwisach. Każdy serwis ma własną bazę SQLite i komunikuje się przez REST API. Ruch z frontendu kierowany jest przez API Gateway.

| Serwis | Port | Opis |
|--------|------|------|
| frontend | 5173 | React + Vite (interfejs użytkownika) |
| api-gateway | 3000 | Brama API, routing do mikroserwisów |
| auth-service | 3001 | Rejestracja, logowanie, JWT, punkty użytkownika |
| station-service | 3002 | Stacje, ceny paliw, opinie |
| alert-service | 3003 | Alerty drogowe i potwierdzenia |
| favorite-service | 3004 | Ulubione stacje i powiadomienia |

## Wymagania

- Docker Desktop (z Docker Compose)

## Uruchomienie

Jedna komenda w głównym katalogu projektu:

```bash
docker compose up --build
```

Pierwsze uruchomienie zbuduje wszystkie obrazy i uruchomi serwisy.

## Dostepne adresy

- Aplikacja frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Dokumentacja API (Swagger UI auth-service): http://localhost:3001/api-docs

## Zatrzymanie

```bash
docker compose down
```

## Technologie

- Node.js + Express
- React + Vite
- Sequelize + SQLite
- JSON Web Token (JWT)
- Docker + Docker Compose
