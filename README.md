# BankLedger Backend API

A production-style banking backend built with Node.js, Express, and MongoDB that demonstrates secure authentication, account lifecycle management, and transaction-safe money transfers using immutable ledger entries.

## About the Project 
- Solves a real backend problem: reliable money movement with audit-friendly records.
- Uses idempotency keys to prevent duplicate transfers from retries.
- Implements ACID-style transfer flow with MongoDB sessions.
- Applies role-based access for system-level operations.
- Includes practical engineering details like token blacklisting and TTL cleanup.

## Core Features
- JWT-based authentication (register, login, logout)
- Multi-account support per user
- Real-time balance computation from ledger entries
- Peer-to-peer account transfers
- System-admin deposit endpoint
- Email notifications for auth and transaction events
- Secure logout using token blacklist

## Tech Stack
- Node.js, Express
- MongoDB, Mongoose
- JWT, bcrypt
- Nodemailer (Gmail OAuth2)
- dotenv, cookie-parser

## API Overview
### Auth (`/api/auth`)
- `POST /register` - Create user and return token
- `POST /login` - Login with credentials and return token
- `POST /logout` - Invalidate current token

### Accounts (`/api/accounts`)
- `POST /` - Create account
- `GET /` - Get logged-in user's accounts
- `GET /getbalance/:accountId` - Get computed account balance

### Transactions (`/api/transaction`)
- `POST /` - Transfer funds between accounts
- `POST /system/deposit` - System-user deposit to an account

## Data Model Snapshot
- User: identity, hashed password, `systemUser` role flag
- Account: owner reference, status (`ACTIVE | FROZEN | CLOSED`), currency
- Transaction: transfer metadata + unique `idempotencyKey`
- Ledger: immutable debit and credit records for every movement
- TokenBlacklist: invalidated JWTs with auto-expiry

