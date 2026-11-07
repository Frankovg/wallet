# Mini Wallet

Billetera virtual full stack: registro/login, saldo inicial de $1000, transferencias entre usuarios por email e historial de movimientos.

**Stack:** React (Vite) · Node.js + Express 5 · PostgreSQL · Prisma 6

## Setup

Requisitos: Node 20+ y PostgreSQL corriendo localmente.

```bash
# Backend
cd server
cp .env.example .env        # completar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev      # crea la DB y aplica migraciones
npm run dev                 # http://localhost:4000

# Frontend (otra terminal)
cd client
cp .env.example .env        # opcional, por defecto apunta a localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

Generar un `JWT_SECRET`:
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password }` → 201 `{ token, user }` · 409 email existente |
| POST | `/api/auth/login` | — | `{ email, password }` → 200 `{ token, user }` · 401 |
| GET | `/api/me` | JWT | Usuario + saldo (centavos) |
| POST | `/api/transfers` | JWT | `{ toEmail, amount: "12.50" }` → 201 · 400 / 404 / 422 |
| GET | `/api/transfers` | JWT | Movimientos enviados y recibidos, más recientes primero |

Errores con formato uniforme: `{ "error": { "code": "INSUFFICIENT_FUNDS", "message": "Saldo insuficiente" } }`.

| Caso | HTTP |
|---|---|
| Validación (monto ≤ 0, > 2 decimales, email inválido, auto-transferencia) | 400 |
| Sin token / token inválido o expirado / credenciales incorrectas | 401 |
| Destinatario inexistente | 404 |
| Email ya registrado | 409 |
| Saldo insuficiente | 422 |

## Decisiones de diseño

- **Montos en centavos (`Int`).** El monto llega como string decimal y se convierte parseando el texto (`server/src/utils/money.js`), sin `parseFloat * 100`. El front solo divide por 100 para mostrar.
- **Transferencia atómica.** `prisma.$transaction` interactiva: débito, crédito y registro del movimiento se confirman juntos o hacen rollback (`server/src/services/transfer.service.js`).
- **Concurrencia / doble gasto.** El débito es un `UPDATE ... WHERE balance >= amount` condicional (`updateMany`). Postgres lockea la fila, así que validación y débito son una sola operación atómica: dos transferencias simultáneas no pueden gastar el mismo saldo. Si no se actualiza ninguna fila → 422.
- **Defensa en profundidad en la DB.** CHECK constraints en la migración: `balance >= 0`, `amount > 0`, `fromAccountId <> toAccountId`.
- **Autorización.** El origen de la transferencia sale siempre del `sub` del JWT, nunca del body.
- **Registro atómico.** User + Account se crean con un nested create (una sola transacción).
- **Login.** Mensaje genérico para no revelar si el email existe. Emails normalizados a minúsculas.
- **`User` / `Account` separados (1:1).** Deja abierta la puerta a múltiples cuentas o monedas.
- `bcryptjs` en lugar de `bcrypt` (sin compilación nativa); Express 5 propaga errores de handlers async al error handler.

## Pruebas

Con la API corriendo:

```bash
cd server
npm run test:concurrency   # 10 transferencias simultáneas de $200 con saldo $1000 → 5 OK, 5 rechazadas, saldo final 0
```

## Mejoras posibles

- Tests automatizados (supertest + DB de test).
- Paginación del historial (cursor por `createdAt, id`).
- Idempotency key en `POST /transfers` para evitar duplicados por reintentos.
- Rate limiting en login, refresh tokens, token en cookie httpOnly en lugar de localStorage.
- `BigInt` para saldos si se superan ~21M USD por cuenta.
