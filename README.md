# Restaurant Microservices

Système de gestion de commandes pour un restaurant, basé sur une architecture microservices.

---

## Vue d'ensemble

L'application permet à des clients de passer des commandes, à la cuisine de les traiter, et aux livreurs de les acheminer. Elle est découpée en services indépendants qui communiquent via une API Gateway (REST synchrone) et un bus d'événements RabbitMQ (asynchrone).

```
Frontend  →  API Gateway  →  client-service   (users + JWT)
                          →  order-service    (commandes)
                          →  kitchen-service  (cuisine)
                          →  delivery-service (livraison)

Tous les services  ↔  RabbitMQ  (événements asynchrones)
Adminer            →  accès aux 4 bases de données
```

---

## Architecture

### Services

| Service | Rôle | Base de données | Port |
|---|---|---|---|
| `api-gateway` | Point d'entrée unique, validation JWT, routage | — | 9000 |
| `client-service` | Gestion des utilisateurs, authentification, génération JWT | `client_db` | 8081 |
| `order-service` | Création et suivi des commandes | `order_db` | 8082 |
| `kitchen-service` | Tableau de bord cuisine, mise à jour des statuts plats | `kitchen_db` | 8083 |
| `delivery-service` | Affectation des livreurs, suivi des livraisons | `delivery_db` | 8084 |

### Infrastucture

| Conteneur | Rôle | Port |
|---|---|---|
| `rabbitmq` | Bus d'événements asynchrone | 5672 (AMQP) / 15672 (dashboard) |
| `adminer` | Interface web d'accès aux bases | 8080 |
| `client-db` | PostgreSQL dédié au client-service | — |
| `order-db` | PostgreSQL dédié à l'order-service | — |
| `kitchen-db` | PostgreSQL dédié au kitchen-service | — |
| `delivery-db` | PostgreSQL dédié au delivery-service | — |

### Rôles utilisateur

Trois rôles sont gérés directement en base dans le `client-service` :

- `CLIENT` — parcourir le menu, passer une commande, suivre son statut
- `CHEF` — voir les commandes entrantes, mettre à jour le statut des plats
- `LIVREUR` — voir les commandes à livrer, mettre à jour le statut de livraison

---

## Structure du projet

```
restaurant-microservices/
│
├── frontend/                        → Interface utilisateur (React / Angular / Vue)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── api-gateway/                     → Passerelle : valide les JWT, route les requêtes
│   ├── src/
│   ├── Dockerfile
│   └── application.yml
│
├── client-service/                  → Utilisateurs, login, génération de JWT
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   │   └── User                 → id, email, password (hashé), role
│   │   └── security/                → génération et validation JWT
│   ├── Dockerfile
│   └── application.yml
│
├── order-service/                   → Commandes
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/                → Order, OrderItem
│   │   └── messaging/               → publishers et listeners RabbitMQ
│   ├── Dockerfile
│   └── application.yml
│
├── kitchen-service/                 → Cuisine
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/                → KitchenOrder, DishStatus
│   │   └── messaging/
│   ├── Dockerfile
│   └── application.yml
│
├── delivery-service/                → Livraison
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/                → Delivery, DeliveryStatus, Livreur
│   │   └── messaging/
│   ├── Dockerfile
│   └── application.yml
│
├── docker-compose.yml               → Lance toute l'infra en une commande
└── README.md
```

---

## Flux d'événements RabbitMQ

RabbitMQ est le cœur de la résilience du système. Les services ne s'appellent pas directement — ils publient des événements dans des files. Si un service est momentanément indisponible, le message reste en attente et est traité à son redémarrage.

```
[Client passe commande]
  order-service        →  publie  →  commande.créée
  kitchen-service      →  consomme  →  affiche la commande au chef

[Chef valide le plat]
  kitchen-service      →  publie  →  plat.prêt
  order-service        →  consomme  →  met à jour le statut
  delivery-service     →  consomme  →  affecte un livreur

[Livreur met à jour]
  delivery-service     →  publie  →  livraison.statut
  order-service        →  consomme  →  met à jour le suivi client
```

---

## Authentification JWT

Il n'y a pas de service d'authentification externe (pas de Keycloak). Le `client-service` gère l'intégralité de la logique d'identité :

1. **Inscription** (`POST /register`) — crée l'utilisateur, hache le mot de passe (bcrypt)
2. **Connexion** (`POST /login`) — vérifie les identifiants, retourne un JWT signé contenant l'`id`, l'`email` et le `role`
3. **Validation** — la Gateway et chaque service vérifient le JWT avec le `JWT_SECRET` partagé, sans contacter le `client-service`

Le secret JWT est défini une seule fois dans le `docker-compose.yml` et injecté comme variable d'environnement dans tous les services.

---

## Lancer le projet

### Prérequis

- [Docker](https://www.docker.com/) et Docker Compose installés

### Démarrage

```bash
git clone https://github.com/votre-org/restaurant-microservices.git
cd restaurant-microservices

# Lancer toute l'infrastructure
docker compose up --build
```

L'ensemble des conteneurs démarre automatiquement dans le bon ordre (`depends_on`).

### Comptes de test

Au premier démarrage, trois comptes sont créés automatiquement dans la base `client-db` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Client | `client@test.com` | `password` |
| Chef | `chef@test.com` | `password` |
| Livreur | `livreur@test.com` | `password` |

Ces comptes sont créés uniquement s'ils n'existent pas déjà — relancer les conteneurs sans `-v` ne les duplique pas.

### Interfaces disponibles

| Interface | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:3000 | voir comptes de test ci-dessus |
| API Gateway | http://localhost:9000 | — |
| Adminer (BDD) | http://localhost:8080 | voir ci-dessous |
| RabbitMQ Dashboard | http://localhost:15672 | `admin` / `password` |

### Accéder aux bases via Adminer

Rendez-vous sur http://localhost:8080, sélectionnez **PostgreSQL**, puis connectez-vous à chaque base en changeant le champ "Serveur" :

| Serveur | Base | Utilisateur | Mot de passe |
|---|---|---|---|
| `client-db` | `client_db` | `user` | `password` |
| `order-db` | `order_db` | `user` | `password` |
| `kitchen-db` | `kitchen_db` | `user` | `password` |
| `delivery-db` | `delivery_db` | `user` | `password` |

---

## Variables d'environnement

Le fichier `docker-compose.yml` centralise toutes les variables. La seule à modifier avant de déployer est `JWT_SECRET` — elle doit être identique dans tous les services.

| Variable | Description |
|---|---|
| `JWT_SECRET` | Clé de signature des tokens JWT (identique dans tous les services) |
| `SPRING_DATASOURCE_URL` | URL de connexion à la base PostgreSQL du service |
| `SPRING_RABBITMQ_HOST` | Hostname du broker RabbitMQ (`rabbitmq` dans Docker) |

---

## Arrêter et nettoyer

```bash
# Arrêter les conteneurs
docker compose down

# Arrêter ET supprimer les volumes (repart de zéro)
docker compose down -v
```