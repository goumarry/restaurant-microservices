# Système de gestion de restaurant - Architecture microservices

Application de gestion de commandes restaurant découpée en services indépendants, communicant de façon synchrone (REST/JWT) et asynchrone (RabbitMQ).

---

## Technologies et choix d'architecture

### Spring Boot - un service par responsabilité

Chaque service est une application Spring Boot autonome avec sa propre base PostgreSQL. Cette isolation garantit qu'une panne d'un service n'entraîne pas la chute des autres.

| Service | Rôle |
|---|---|
| `client-service` | Authentification, gestion des utilisateurs, génération des JWT |
| `order-service` | Création et suivi des commandes |
| `kitchen-service` | Tableau de bord cuisine, validation des plats |
| `delivery-service` | Affectation des livreurs, suivi des livraisons |
| `api-gateway` | Point d'entrée unique - valide le JWT, route vers le bon service |

### Spring Cloud Gateway - JWT centralisé

Toutes les requêtes passent par la Gateway avant d'atteindre un service. Elle valide le JWT et injecte trois headers (`X-User-Id`, `X-User-Email`, `X-User-Role`) que les services lisent directement. Les services ne touchent jamais au token - la validation n'est faite qu'une seule fois.

### RabbitMQ - communication asynchrone et tolérance aux pannes

Les services ne s'appellent pas directement entre eux. Ils publient des événements dans des **exchanges** RabbitMQ, que les autres services consomment via leurs propres **queues**.

| Routing key | Queue(s) créée(s) | Publié par | Consommé par |
|---|---|---|---|
| `order.created` | `order.created.kitchen.queue` | `order-service` | `kitchen-service` |
| `dish.ready` | `dish.ready.order.queue` | `kitchen-service` | `order-service` |
| `dish.ready` | `dish.ready.delivery.queue` | `kitchen-service` | `delivery-service` |
| `delivery.status` | `delivery.status.order.queue` | `delivery-service` | `order-service` |

Chaque consommateur possède sa **propre queue**. Quand plusieurs services doivent recevoir le même événement (ex. `dish.ready`), le broker copie le message dans chacune de leurs queues simultanément - les services consomment de façon totalement indépendante.

**Intérêt clé :** si un service consommateur est arrêté, RabbitMQ conserve les messages dans sa queue. Dès que le service redémarre, il traite les messages en attente - aucun événement n'est perdu.

### PostgreSQL - une base par service

Chaque service possède sa propre base de données isolée. Aucun service ne peut lire ou écrire dans la base d'un autre. Cela permet de faire évoluer ou de remplacer un service sans impacter les autres.

### React + Vite - frontend

Interface unique adaptée selon le rôle de l'utilisateur connecté (`CLIENT`, `CHEF`, `LIVREUR`). En production, nginx sert les fichiers statiques et proxy les appels `/api` vers la Gateway.

---

## Lancer le projet

**Prérequis :** Docker et Docker Compose installés.

```bash
# Premier démarrage (build + lancement)
docker compose up --build

# Repartir de zéro (supprime les volumes = bases de données vidées)
docker compose down -v && docker compose up --build
```

### Interfaces

| Interface | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:3000 | voir comptes ci-dessous |
| RabbitMQ dashboard | http://localhost:15672 | `admin` / `password` |
| Adminer (BDD) | http://localhost:8080 | `user` / `password` |

### Comptes de test (créés automatiquement au démarrage)

| Rôle | Email | Mot de passe |
|---|---|---|
| Client | `client@test.com` | `password` |
| Chef | `chef@test.com` | `password` |
| Livreur | `livreur@test.com` | `password` |

---

## Tester la résilience - couper un service

Le comportement en cas de panne peut être observé directement avec Docker.

### Scénario : couper le kitchen-service pendant une commande

```bash
# 1. Passer une commande via le frontend (connecté en tant que client)

# 2. Couper le kitchen-service
docker compose stop kitchen-service

# 3. Observer dans le dashboard RabbitMQ (http://localhost:15672)
#    → la queue "kitchen.orders" accumule des messages non consommés

# 4. Redémarrer le service
docker compose start kitchen-service

#    → le service consomme immédiatement les messages en attente,
#      la commande apparaît dans le tableau de bord cuisine
```

### Autres services à tester

```bash
docker compose stop delivery-service   # les statuts de livraison s'accumulent en queue
docker compose stop order-service      # les mises à jour de statut de la cuisine sont conservées
```

Dans tous les cas, RabbitMQ fait office de tampon : les messages publiés pendant l'arrêt d'un service sont délivrés à sa reprise, sans perte et sans intervention manuelle.
