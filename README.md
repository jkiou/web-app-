# NexusFlow - Secure REST API & Premium Admin Dashboard

NexusFlow is a full-stack, responsive task management and administration portal built to demonstrate a secure, scalable backend architecture paired with a premium glassmorphic frontend interface.

---

## Technical Architecture Overview

The project is structured as a monorepo containing two main decoupled components:
1. **Backend (`/backend`)**: A Node.js and Express REST API (v1 versioned) that manages authentication, schema validation, structured logging, custom error handling, and Role-Based Access Controls (RBAC). It interacts with a SQLite database through Prisma ORM.
2. **Frontend (`/frontend`)**: A React Single Page Application (SPA) built with Vite, styled with custom premium CSS rules, utilizing React Router DOM for route guards, and managing authentication state with JWTs.

### Monorepo Structure
```
newproject/
├── backend/            # Express REST API (v1, Auth, RBAC, Swagger, Prisma, Winston)
├── frontend/           # React + Vite (Custom Glassmorphism CSS, Guards, Context)
├── package.json        # Monorepo scripts (concurrently launches both servers)
└── README.md           # Quick setup, architecture and scalability design
```

---

## Quick Setup & Start Guide

To run the entire ecosystem (frontend & backend) concurrently with a single command, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- `npm` (v9.x or higher)

### 1. Installation
From the **root directory** (`/newproject`), run the custom installer command to install dependencies for both the frontend and backend in one go:
```bash
npm run install:all
```

### 2. Initialize Database & Migration
Migrate the Prisma schema and seed the database with mock accounts:
```bash
# Performs SQLite schema migration
npm run db:migrate

# Seeds mock users (admin and user) and default tasks
npm run db:seed
```

### 3. Spin Up Development Servers
Start both the Express API server (on port `5000`) and the Vite React app (on port `5173`) concurrently:
```bash
npm run dev
```
- Open **`http://localhost:5173`** to access the premium frontend UI.
- Open **`http://localhost:5000/api-docs`** to access the interactive Swagger API documentation.

---

## Mock Accounts for Evaluation

On the Login page, you can use these seeded credentials:

| Email | Password | Role | Features |
|---|---|---|---|
| **`admin@example.com`** | `admin123` | **`ADMIN`** | Accesses the personal task manager, lists all system tasks, accesses user registry tables, promotes/demotes roles, deletes accounts, and reviews real-time database charts/stats. |
| **`user@example.com`** | `user123` | **`USER`** | Accesses the personal task manager (scoped CRUD: create, read, edit, delete tasks, search/filter controls, status toggling). Denied access to administrative pages. |

---

## Security Implementation Details

- **Password Hashing**: Utilizes `bcryptjs` with a work factor of 10 salt rounds to hash user passwords before storing them.
- **JWT Token Authentication**: Issues stateless JWT signatures containing user IDs on login, validated in backend route scopes via a standard `Authorization: Bearer <token>` header.
- **Role-Based Access Control (RBAC)**: Custom middlewares (`protect` and `authorize('ADMIN')`) restrict routes. Standard users are confined to their own resources, while administrators can execute global operations.
- **Input Sanitization & Validation**: Requests are validated against `zod` schemas. Extra fields sent in JSON bodies are automatically stripped, mitigating Mass Assignment vulnerabilities.
- **IP Rate Limiting**: Employs `express-rate-limit` to restrict requests per IP window, preventing brute-force login attempts and API flooding.
- **HTTP Security Headers**: Uses `helmet` to secure Express headers (XSS protections, clickjacking mitigations, etc.).
- **Structured Error Boundary**: A global Express error handler catches database exceptions, validation errors, and runtime failures, logging them with traces, and preventing stack leaks in production.

---

## Production Scalability Note

For high-traffic production workloads, the system can scale through the following design adjustments:

### 1. Database & Connection Pooling
- **Transition**: Move from SQLite to a highly-available managed database cluster like Amazon RDS (PostgreSQL/MySQL).
- **Prisma Configuration**: Update `schema.prisma` connection provider:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- **Connection Pooling**: Configure PgBouncer (for PostgreSQL) or scale Prisma's internal connection pool variables (`?connection_limit=20`) to manage database concurrent connection handles efficiently.

### 2. High-Performance Caching (Redis)
- **Session Caching**: Store revoked JWT tokens (blacklist) or active user session validation objects in a Redis database for sub-millisecond lookups.
- **Query Caching**: Cache expensive REST requests (like Admin `/stats` or user `/tasks`) in Redis with cache-invalidation policies (Cache-Aside Pattern) tied to database writes (Create/Update/Delete).

### 3. Load Balancing & Horizontal Scaling
- **Stateless Design**: The REST API is fully stateless (JWT session tokens). Any application instance can serve any user request.
- **Reverse Proxy / Load Balancer**: Use Nginx or AWS Application Load Balancer (ALB) to distribute requests round-robin across a cluster of Node.js servers.
- **Process Management**: On a single virtual machine (EC2/VPS), run Node.js in cluster mode using **PM2** to harness all CPU cores:
  ```bash
  pm2 start src/server.js -i max
  ```

### 4. Containerization & Orchestration (Docker)
- **Dockerization**: Containerize both the Express API and Vite React app using multi-stage builds (building static HTML/CSS files for Vite and serving via Nginx).
- **Orchestration**: Deploy containers using Docker Compose locally, or scale horizontally across cloud clusters using **Kubernetes** or AWS ECS.

### 5. Microservices Transition
- **Services Separation**: Deconstruct the codebase into isolated microservices:
  - **Auth Service**: Manages accounts registration, login, and JWT issues.
  - **Task Service**: Handles CRUD operations.
  - **Admin & Analytics Service**: Handles user directories, promotions, and aggregates stats.
- **API Gateway**: Place a gateway (e.g., Kong, Express Gateway) in front of the microservices to route public requests, rate-limit client scopes, and perform central token decryptions.
