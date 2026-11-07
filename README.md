# Mini Wallet

Full-stack virtual wallet: register/login, an initial balance of $1000, transfers between users by email, and a transaction history.

**Stack:** React (Vite) · Node.js + Express 5 · PostgreSQL · Prisma 6

## Setup

Requirements: Node 20+ and a locally running PostgreSQL.

```bash
# Backend
cd server
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev      # creates the DB and applies migrations
npm run dev                 # http://localhost:4000

# Frontend (another terminal)
cd client
cp .env.example .env        # optional, defaults to localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

Generate a `JWT_SECRET`:
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password }` → 201 `{ token, user }` · 409 email already exists |
| POST | `/api/auth/login` | — | `{ email, password }` → 200 `{ token, user }` · 401 |
| GET | `/api/me` | JWT | User + balance (cents) |
| POST | `/api/transfers` | JWT | `{ toEmail, amount: "12.50" }` → 201 · 400 / 404 / 422 |
| GET | `/api/transfers` | JWT | Sent and received transactions, most recent first |

Errors share a uniform format: `{ "error": { "code": "INSUFFICIENT_FUNDS", "message": "Insufficient funds" } }`.

| Case | HTTP |
|---|---|
| Validation (amount ≤ 0, > 2 decimals, invalid email, self-transfer) | 400 |
| No token / invalid or expired token / wrong credentials | 401 |
| Recipient does not exist | 404 |
| Email already registered | 409 |
| Insufficient funds | 422 |

## Design decisions

- **Amounts in cents (`Int`).** The amount arrives as a decimal string and is converted by parsing the text (`server/src/utils/money.ts`), without `parseFloat * 100`. The frontend only divides by 100 for display.
- **Atomic transfer.** Interactive `prisma.$transaction`: debit, credit and transaction record are committed together or rolled back (`server/src/services/transfer.service.ts`).
- **Concurrency / double spending.** The debit is a conditional `UPDATE ... WHERE balance >= amount` (`updateMany`). Postgres locks the row, so validation and debit are a single atomic operation: two simultaneous transfers cannot spend the same balance. If no row is updated → 422.
- **Defense in depth in the DB.** CHECK constraints in the migration: `balance >= 0`, `amount > 0`, `fromAccountId <> toAccountId`.
- **Authorization.** The transfer sender always comes from the JWT `sub`, never from the body.
- **Atomic registration.** User + Account are created with a nested create (a single transaction).
- **Login.** Generic message so it does not reveal whether the email exists. Emails are normalized to lowercase.
- **Separate `User` / `Account` (1:1).** Leaves the door open to multiple accounts or currencies.
- `bcryptjs` instead of `bcrypt` (no native compilation); Express 5 propagates async handler errors to the error handler.

## Tests

With the API running:

```bash
cd server
npm run test:concurrency   # 10 simultaneous $200 transfers with a $1000 balance → 5 OK, 5 rejected, final balance 0
```

## Possible improvements

- Automated tests (supertest + test DB).
- History pagination (cursor on `createdAt, id`).
- Idempotency key on `POST /transfers` to avoid duplicates from retries.
- Rate limiting on login, refresh tokens, httpOnly cookie token instead of localStorage.
- `BigInt` for balances if accounts exceed ~21M USD.
