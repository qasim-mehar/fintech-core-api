# Fintech Core API

> A production-grade RESTful backend engine for financial applications — built with Node.js, Express, and MongoDB — demonstrating real-world fintech architecture including multi-step transaction state machines, a double-entry ledger system, and JWT-secured user flows.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features & What I Learned](#core-features--what-i-learned)
- [Why This Project Matters](#why-this-project-matters)
- [System Architecture](#system-architecture)

- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Data Flow: A Transaction Lifecycle](#data-flow-a-transaction-lifecycle)
- [Financial Accuracy — The Ledger System](#financial-accuracy--the-ledger-system)
- [Security Implementation](#security-implementation)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Key Engineering Decisions](#key-engineering-decisions)
- [What's Next](#whats-next)

---

---

## Project Overview

**Fintech Core API** is the server-side engine of a modern fintech application. It handles everything a real financial platform needs under the hood: creating and verifying users, initiating money transfers that go through staged approval states, and maintaining a persistent ledger that tracks every financial change with full auditability.

This is not a tutorial CRUD app. The domain is financial software — a space where incorrect data handling can have real-world consequences — which pushed me to think beyond "does it work" and toward "is it correct, consistent, and safe."

---

## Core Features & What I Learned

### 1 · Secure User Onboarding

Users register with email and password. Passwords are hashed using **bcryptjs** before being stored — the plaintext password never touches the database. On successful login, the server issues a signed **JWT** with an expiry window. Every protected route passes through a middleware that verifies this token before allowing access.

**What I learned:** How to implement stateless authentication properly — why JWTs work the way they do, and why storing tokens server-side defeats their purpose.

---

### 2 · Multi-Step Transaction State Machine

Transactions don't go from "created" to "done" in a single step. They follow a deliberate lifecycle:

```
  INITIATED ──► PENDING ──► COMPLETED
                   │
                   └──► FAILED
```

A transaction is created with a `pending` status. The system validates the sender's available balance, applies business rules, and only then transitions the transaction to `completed` — writing both sides of the entry to the ledger atomically.

**What I learned:** How to model stateful business processes as state machines, and why this pattern prevents subtle double-spend and race condition bugs that a naive implementation would miss.

---

### 3 · Persistent Ledger System

Every financial event generates a **ledger entry**. This is the same principle used in real accounting: no money is moved directly — instead, every transfer creates a pair of offsetting records (debit on one side, credit on the other). The account balance at any point in time is always derivable by summing ledger entries.

**What I learned:** The difference between storing a "current balance" field (easy but fragile) versus maintaining a transaction log that makes balances auditable, reconstructable, and tamper-evident.

---

### 4 · Input Validation & Error Handling

All incoming request bodies are validated before reaching business logic. Malformed requests return meaningful error responses with appropriate HTTP status codes. A centralized error-handling middleware catches unhandled rejections and formats them consistently.

**What I learned:** Why validation belongs at the boundary of the system, not scattered through service logic — and how structured error responses make APIs consumable by frontend developers.

---

## Why This Project Matters

Most backend projects stop at basic CRUD. This one deliberately steps into the complexity of **financial systems**, where:

- A failed transaction must not corrupt balances
- Money must never be "lost" between a debit and a credit
- The same request made twice must not charge a user twice
- Every state change must be traceable

Building in this domain taught me how real banking and payments backends are designed — not just how to write Express routes.

---

## Skills Demonstrated

```
Backend Development        ████████████░░  Node.js · Express · REST API Design
Database Design            ██████████░░░░  MongoDB · Mongoose · Schema Modeling
Authentication & Security  ████████████░░  JWT · bcrypt · Middleware Patterns
Financial Systems Logic    █████████░░░░░  Ledger Design · State Machines
Code Architecture          ████████████░░  MVC Pattern · Separation of Concerns
Version Control            ████████████░░  Git · 35 meaningful commits
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT / FRONTEND                  │
└─────────────────────┬───────────────────────────────┘
                      │  HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────┐
│               EXPRESS APPLICATION                    │
│                                                      │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  Auth Routes │  │  User      │  │ Transaction │  │
│  │  /register   │  │  Routes    │  │   Routes    │  │
│  │  /login      │  │  /profile  │  │  /transfer  │  │
│  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘  │
│         │                │                │          │
│         └────────────────▼────────────────┘          │
│                   Middleware Layer                    │
│           (JWT Auth · Input Validation)               │
│                          │                           │
│         ┌────────────────▼────────────────┐          │
│         │        Business Logic Layer      │          │
│         │   Transaction State Machine      │          │
│         │   Ledger Engine · Balance Mgmt   │          │
│         └────────────────┬────────────────┘          │
└──────────────────────────┼──────────────────────────┘
                           │  Mongoose ODM
                           ▼
            ┌──────────────────────────┐
            │         MongoDB          │
            │                          │
            │  users · transactions    │
            │  ledger_entries          │
            └──────────────────────────┘
```

## Tech Stack

| Layer       | Technology                     | Role                                             |
| ----------- | ------------------------------ | ------------------------------------------------ |
| Runtime     | Node.js                        | JavaScript execution environment                 |
| Framework   | Express.js                     | HTTP routing and middleware pipeline             |
| Database    | MongoDB (Atlas)                | Document storage for users, transactions, ledger |
| ODM         | Mongoose                       | Schema definition, validation, query interface   |
| Auth        | JSON Web Tokens (jsonwebtoken) | Stateless session management                     |
| Security    | bcryptjs                       | Password hashing with salt rounds                |
| Environment | dotenv                         | Secret and config management                     |
| Dev Tooling | Nodemon                        | Hot-reloading during development                 |

---

## API Reference

### Authentication

| Method | Endpoint             | Description                  | Auth Required |
| ------ | -------------------- | ---------------------------- | ------------- |
| `POST` | `/api/auth/register` | Create a new user account    | No            |
| `POST` | `/api/auth/login`    | Authenticate and receive JWT | No            |

### User

| Method | Endpoint             | Description                        | Auth Required |
| ------ | -------------------- | ---------------------------------- | ------------- |
| `GET`  | `/api/users/profile` | Fetch authenticated user's profile | Yes           |
| `GET`  | `/api/users/balance` | Get current wallet balance         | Yes           |

### Transactions

| Method | Endpoint                     | Description                  | Auth Required |
| ------ | ---------------------------- | ---------------------------- | ------------- |
| `POST` | `/api/transactions/transfer` | Initiate a new transfer      | Yes           |
| `GET`  | `/api/transactions/history`  | Fetch transaction history    | Yes           |
| `GET`  | `/api/transactions/:id`      | Get single transaction by ID | Yes           |

### Ledger

| Method | Endpoint      | Description                              | Auth Required |
| ------ | ------------- | ---------------------------------------- | ------------- |
| `GET`  | `/api/ledger` | View all ledger entries for current user | Yes           |

> All protected routes require the header: `Authorization: Bearer <token>`

---

## Data Flow: A Transaction Lifecycle

Here's what happens internally when a user sends money:

```
1. POST /api/transactions/transfer
       │
       ▼
2. JWT Middleware — verify token, attach user to request
       │
       ▼
3. Input Validation — check amount > 0, recipient exists
       │
       ▼
4. Balance Check — query ledger to confirm sufficient funds
       │
       ├── INSUFFICIENT → return 400 with clear error message
       │
       ▼
5. Create Transaction record  (status: "pending")
       │
       ▼
6. Write Ledger Entries
   ├── Debit entry  →  sender account
   └── Credit entry →  recipient account
       │
       ▼
7. Update Transaction record  (status: "completed")
       │
       ▼
8. Return 201 with transaction summary
```

If anything fails between steps 5 and 7, the transaction remains in `failed` state and no ledger entries persist — preserving financial consistency.

---

## Financial Accuracy — The Ledger System

The ledger is what separates a toy app from a financial system.

```
Traditional approach (fragile):
  User.balance -= amount    ← direct field mutation, no history

Ledger approach (this project):
  LedgerEntry.create({ type: 'debit',  amount, userId: sender   })
  LedgerEntry.create({ type: 'credit', amount, userId: recipient })
  User.balance = SUM of all ledger entries   ← always derivable
```

This design means:

- Every cent is accounted for in an immutable log
- Balances can be reconstructed from scratch at any point
- Debugging a discrepancy means querying the ledger, not guessing

---

## Security Implementation

```
Password Storage
─────────────────────────────────────────────────────
  Plaintext:  "mypassword123"
  bcrypt hash: "$2b$10$x9fJkLm...Qzp8RvT..."   ← stored in DB

  Salt rounds: 10  (computationally expensive to brute-force)

Token Flow
─────────────────────────────────────────────────────
  Login success  →  server signs JWT with SECRET_KEY + expiry
  Client stores token  →  sends with every protected request
  Server verifies signature  →  never needs to query DB for session
  Token expires  →  user must re-authenticate
```

Environment variables (MongoDB URI, JWT secret) are managed via `.env` and never committed to source control.

---

## Project Structure

```
fintech-core-api/
│
├── server.js                  # App entry point, Express init
├── package.json
├── .env                       # Not committed — secrets live here
│
└── src/
    ├── config/
    │   └── db.js              # MongoDB connection logic
    │
    ├── middleware/
    │   ├── auth.js            # JWT verification middleware
    │   └── errorHandler.js    # Centralized error responses
    │
    ├── models/
    │   ├── User.js            # Mongoose user schema
    │   ├── Transaction.js     # Transaction + state tracking
    │   └── LedgerEntry.js     # Immutable financial record
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   └── transactionController.js
    │
    └── routes/
        ├── authRoutes.js
        ├── userRoutes.js
        └── transactionRoutes.js
```

The project follows a layered architecture: **routes → controllers → models**, keeping concerns separated and the codebase navigable.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/qasim-mehar/fintech-core-api.git
cd fintech-core-api

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in: MONGO_URI, JWT_SECRET, PORT

# 4. Start the development server
npm run dev

# Server runs at http://localhost:5000
```

**Environment variables required:**

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fintech
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

---

## Key Engineering Decisions

**Why a ledger instead of a balance field?**
A simple balance field is easy to corrupt — one failed update and the number is wrong with no way to trace why. A ledger is an append-only log; the truth lives in the entries, not a single number.

**Why a state machine for transactions?**
Financial operations have side effects. A transaction that partially executes is worse than one that never executes. Explicit states make it impossible to skip steps or double-process a transfer.

**Why JWT over sessions?**
Sessions require server-side storage — a bottleneck when scaling horizontally. JWTs are self-contained, verifiable without a database round-trip, and standard in modern API design.

**Why Mongoose over raw MongoDB driver?**
Mongoose schema validation acts as a contract on the data layer. In a financial context, enforcing data shape at the model level catches bugs before they reach the database.

---

## What's Next

- [ ] Add idempotency keys to prevent duplicate transaction submissions
- [ ] Implement rate limiting on auth routes to prevent brute-force attacks
- [ ] Add pagination to transaction history endpoints
- [ ] Write integration tests for the transaction state machine
- [ ] Explore database transactions (MongoDB multi-document) for atomic ledger writes

---

<div align="center">

**Built by [Qasim Ali](https://github.com/qasim-mehar)** · MERN Stack Developer · Islamabad, Pakistan

_"The best backend is one that makes wrong states unrepresentable."_

</div>
