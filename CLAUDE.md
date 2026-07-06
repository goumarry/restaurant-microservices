# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

```bash
# Start everything (builds all images first)
docker compose up --build

# Wipe all data and restart from scratch
docker compose down -v && docker compose up --build

# Rebuild and restart a single service (e.g. after Java changes)
docker compose up --build order-service
```

## Building a single service locally (without Docker)

Each Spring Boot service is an independent Maven project. From inside the service directory:

```bash
cd order-service
mvn package -DskipTests    # compile + package
mvn spring-boot:run        # run locally (needs local Postgres + RabbitMQ)
```

## Frontend development (hot reload)

```bash
cd frontend
npm install
npm run dev    # Vite dev server on :3000, proxies /api → localhost:9000
```

Vite's proxy (`vite.config.js`) routes all `/api` traffic to `http://localhost:9000` in dev. In production the nginx container handles this.

## Architecture

### Request flow

```
Browser → frontend(:3000) → API Gateway(:9000) → downstream service
```

The gateway (`api-gateway`) is a **Spring Cloud Gateway** (reactive/WebFlux) application. Every incoming request passes through `JwtAuthFilter` before routing. The filter:
- Lets `/api/auth/**` through without a token (the only public route)
- Validates the JWT, then **injects three headers** (`X-User-Id`, `X-User-Email`, `X-User-Role`) that downstream services read instead of touching the token themselves

### JWT propagation

`JWT_SECRET` is the single env var that must be identical across all services. It is defined once in `docker-compose.yml`. Each service reads it from its own `application.yml` via `${JWT_SECRET:...}`. The `client-service` signs tokens; every other service only verifies them.

### Async events (RabbitMQ)

Services communicate via three **topic exchanges** declared in each service's `RabbitMQConfig.java`:

| Exchange | Routing key | Published by | Consumed by |
|---|---|---|---|
| `order.exchange` | `order.created` | order-service | kitchen-service, delivery-service |
| `dish.exchange` | `dish.ready` | kitchen-service | order-service, delivery-service |
| `delivery.exchange` | `delivery.status` | delivery-service | order-service |

Each service declares only the queues it consumes. All messages are serialized to JSON via `Jackson2JsonMessageConverter`. The DTO classes for events live in each service's `messaging/dto/` package.

### Downstream service identity per request

Downstream controllers trust the gateway-injected headers (e.g. `@RequestHeader("X-User-Id")`). They never re-validate the JWT — that is solely the gateway's responsibility.

### Frontend API surface

`frontend/src/api.js` is the single HTTP client. It reads `localStorage` for `token` (JWT string) and `user` (JSON object with `role`). Role-based routing in `App.jsx` redirects users to `/client`, `/kitchen`, or `/delivery` based on `user.role` (`CLIENT`, `CHEF`, `LIVREUR`).

## Key URLs (all services running)

| Interface | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:9000 |
| RabbitMQ dashboard | http://localhost:15672 (admin / password) |
| Adminer (databases) | http://localhost:8080 |

Adminer: select PostgreSQL, use server names `client-db`, `order-db`, `kitchen-db`, or `delivery-db` with user `user` / password `password`.

## Tech stack

- **Java 21**, Spring Boot 3.2.5, Lombok
- **api-gateway**: Spring Cloud Gateway 2023.0.1 (reactive), JJWT 0.12.3
- **Other services**: Spring Web (servlet), Spring Data JPA, Spring AMQP, PostgreSQL 16
- **Frontend**: React 18, React Router 6, Vite 5 — no CSS framework, no test runner configured
- **Infra**: Docker Compose, each service has its own multi-stage Dockerfile (Maven build → JRE image)
