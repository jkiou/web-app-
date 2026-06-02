# Task Management REST API with RBAC (Backend)

This directory houses the backend codebase for the application. Built on Node.js and Express, it provides secure, modular REST endpoints for authentication and user task administration, fully mapped with a SQLite database using Prisma ORM.

## Tech Stack
- **Runtime**: Node.js (ES Modules syntax)
- **Framework**: Express.js
- **Database Access**: Prisma ORM with SQLite
- **Security & Utilities**:
  - `bcryptjs` (Password hashing)
  - `jsonwebtoken` (JWT Session authentication)
  - `zod` (Robust schema-based request validation and sanitization)
  - `cors` & `helmet` (Cross-origin permissions and HTTP protection headers)
  - `express-rate-limit` (IP request throttling to prevent brute-force attacks)
  - `winston` & `morgan` (Structured logging streams to files and terminal consoles)

---

## Folder Layout

```
backend/
├── prisma/
│   ├── schema.prisma   # Database Models (User & Task)
│   ├── seed.js         # Seed script for default accounts
│   └── dev.db          # SQLite Database File (Generated)
├── src/
│   ├── config/         # Server instances and configurations
│   ├── controllers/    # Route controllers housing business logic
│   ├── middlewares/    # Custom Express middlewares (Auth, Roles, Validation, Errors)
│   ├── routes/         # Router definitions (Auth, Tasks, Admin)
│   ├── utils/          # General loggers and error class templates
│   ├── app.js          # Express app configurations
│   └── server.js       # Database connection tests and startup script
├── logs/               # Saved log files (Generated)
│   ├── error.log
│   └── combined.log
├── .env.example        # Environment template variables
├── .env                # Local secrets (ignored in production git)
└── package.json
```

---

## Setup & Execution

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="super_secret_jwt_key_for_local_development_13579"
JWT_EXPIRES_IN="24h"
```

### 3. Run Database Migrations & Seeding
Create tables and relationships inside the SQLite file:
```bash
# Run schema migrations
npx prisma migrate dev --name init

# Populate mock accounts and tasks
npm run db:seed
```

### 4. Run Development Server
Start Express in watch mode (auto-refresh via Nodemon):
```bash
npm run dev
```
The server starts on `http://localhost:5000`.

---

## API Endpoints Overview

| Route | Method | Description | Access |
|---|---|---|---|
| **`/api/v1/auth/register`** | `POST` | Registers a new User | Public |
| **`/api/v1/auth/login`** | `POST` | Signs credentials and issues JWT | Public |
| **`/api/v1/auth/me`** | `GET` | Fetch profile details of logged-in user | JWT Bearer |
| **`/api/v1/tasks`** | `GET` | Fetch tasks list (filters: status, priority, search) | JWT (Owner / Admin) |
| **`/api/v1/tasks`** | `POST` | Create a new task item | JWT (Auth Users) |
| **`/api/v1/tasks/:id`** | `GET` | Fetch specific task by UUID | JWT (Owner / Admin) |
| **`/api/v1/tasks/:id`** | `PUT` | Update specific task attributes | JWT (Owner / Admin) |
| **`/api/v1/tasks/:id`** | `DELETE` | Terminate a task | JWT (Owner / Admin) |
| **`/api/v1/admin/users`** | `GET` | List all users and task counts | Admin Only |
| **`/api/v1/admin/users/:id/role`** | `PUT` | Promote or demote user role | Admin Only |
| **`/api/v1/admin/users/:id`** | `DELETE` | Delete user and cascade delete tasks | Admin Only |
| **`/api/v1/admin/stats`** | `GET` | View global metrics (totals, task breakdown) | Admin Only |

---

## Swagger API Documentation
An interactive Swagger UI dashboard is generated at the server root.
1. Run the development server (`npm run dev`).
2. Navigate to **`http://localhost:5000/api-docs`** in your browser.
3. Use the interface to test endpoints directly from the browser by pasting the JWT Bearer token into the "Authorize" button.
