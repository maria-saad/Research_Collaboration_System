# Research Collaboration System — Backend

Backend API for a polyglot persistence system that combines:

- **MongoDB** (document storage: Researchers / Projects / Publications)
- **Neo4j** (collaboration graph)
- **Redis** (caching layer)
- **Express.js** (REST API)

## Features

- CRUD APIs for Researchers / Projects / Publications (MongoDB)
- Graph sync + collaboration relations + collaborator lookup (Neo4j)
- Aggregated profile endpoint: Mongo + Neo4j in one response
- Analytics endpoint: Top Researchers by collaboration degree
- Redis caching for profile + analytics

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Neo4j + neo4j-driver
- Redis
- Docker Compose (for local DB services)

---

## Project Structure

2. Create .env file

Copy .env.example to .env:

cp .env.example .env
Windows PowerShell:
Copy-Item .env.example .env
Edit .env if needed.

////////////////

Run Databases with Docker 3) Start MongoDB + Neo4j + Redis

If docker-compose.yml exists in the project root:

docker compose up -d
docker compose ps

Expected services:

MongoDB: localhost:27017

Neo4j Browser: http://localhost:7474

Neo4j Bolt: bolt://localhost:7687

Redis: localhost:6379

Neo4j credentials (default):

user: neo4j

pass: 123456789

/////////////////////////////
Run Backend API 4) Install dependencies
npm install

5. Start server (dev)
   npm run dev

API should run on:

http://localhost:5000

Health check:

GET http://localhost:5000/health

API Endpoints (Main)
Health

GET /health

Researchers (MongoDB)

POST /api/researchers

GET /api/researchers

GET /api/researchers/:id

PUT /api/researchers/:id

DELETE /api/researchers/:id

Projects (MongoDB)

POST /api/projects

GET /api/projects

GET /api/projects/:id

PUT /api/projects/:id

DELETE /api/projects/:id

Publications (MongoDB)

POST /api/publications

GET /api/publications

GET /api/publications/:id

PUT /api/publications/:id

DELETE /api/publications/:id

Graph (Neo4j)

POST /api/graph/researchers/:id/sync

POST /api/graph/collaborations

GET /api/graph/researchers/:id/collaborators

Aggregation (Mongo + Neo4j + Redis)

GET /api/researchers/:id/profile

returns { source: "db" | "cache", researcher, collaborators }

Analytics (Neo4j + Redis)

GET /api/analytics/top-researchers?limit=5

returns { source: "db" | "cache", limit, topResearchers[] }
“API documentation is available at /api/docs and generated automatically using Swagger (OpenAPI 3.0).”
