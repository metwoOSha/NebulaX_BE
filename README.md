# NebulaX — Backend

REST API + Socket.io server for NebulaX, a real-time chat app with public rooms, typing indicators and presence.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-validation-3E67B1)

[Live demo](https://nebulax-snowy.vercel.app/) · [Frontend repo](https://github.com/metwoOSha/NebulaX_FE)

## Highlights

- **Redis pub/sub decouples HTTP from sockets.** `message.handler.ts` writes the message to Postgres, then publishes it to a `room:<id>` Redis channel instead of emitting directly. `socket/index.ts` subscribes once with `pSubscribe('room:*', ...)` and re-emits to the matching Socket.io room — this is what lets the server scale to multiple instances without sticky sessions.
- **Presence is tracked in Redis, not in memory.** Online users per room are stored as a Redis Set (`room:<id>:online`), updated with `sAdd`/`sRem` on `join_room`, `leave_room` and `disconnect`, so presence survives socket reconnects and works across processes.
- **Cursor-based pagination for message history.** `getMessages` in `messages.controller.ts` paginates by `created_at` (`WHERE created_at < $cursor ORDER BY created_at DESC LIMIT $limit`), then reverses the page before returning it, so the client always renders in chronological order while still paging backwards through history.
- **Socket auth reuses the same JWT as the REST API, without depending on the cookie reaching the handshake.** The `io.use` middleware in `socket/index.ts` accepts the token either from `socket.handshake.auth.token` or by parsing it out of the raw `Cookie` header — a dedicated `GET /api/auth/socket-token` endpoint exists specifically to hand the token to clients (e.g. cross-site deployments) where the cookie isn't reliably attached to the WS handshake.
- **Rooms are split into `my` / `joined` / `recommended` in a single query fan-out.** `getRooms` runs three queries in parallel (owned via `room_members.role = 'admin'`, joined as member, and recommended by matching a user's `user_tags` against `room_tags` for rooms they haven't joined), then annotates each with a live `online_count` read from Redis.
- **Request validation is schema-first with Zod**, applied via a generic `validate(schema)` middleware that parses `req.body`, replaces it with the parsed/typed result, or short-circuits with a 400 and the Zod issue list.

## Stack

- **Runtime:** Node.js ≥ 18, TypeScript, ESM (`"type": "module"`)
- **HTTP:** Express 5, Helmet, CORS, Morgan, cookie-parser, express-rate-limit
- **Realtime:** Socket.io 4
- **Data:** PostgreSQL (`pg`), Redis 7 (`redis`) for pub/sub + presence
- **Auth:** JWT (`jsonwebtoken`), bcrypt
- **Validation:** Zod
- **API docs:** swagger-jsdoc + swagger-ui-express, generated from `docs/*.swagger.ts`
- **Tooling:** ESLint, Prettier (+ `prettier-plugin-sql`), Husky + lint-staged, Vitest

## Project structure

```
src/
├── config/       # env, CORS/cookie/socket/rate-limit options, swagger setup
├── controllers/  # auth, users, rooms, messages, tags
├── db/           # pg pool, schema.sql, seed.sql
├── redis/        # publisher/subscriber clients
├── helpers/      # JWT sign/verify
├── middleware/   # auth, validation, error handling, rate limiting
├── routes/       # Express routers per resource
├── socket/       # Socket.io auth middleware + join/leave/message/typing handlers
├── validators/   # Zod schemas
├── app.ts        # Express app assembly
└── server.ts     # HTTP + Socket.io bootstrap, DB/Redis connection
docs/             # swagger-jsdoc annotations per resource
scripts/          # generate-swagger.ts
```

## Prerequisites & running locally

- Node.js ≥ 18
- PostgreSQL and Redis — either running locally or via the provided `docker-compose.yml` (`docker compose up -d`, exposes Postgres on `5432` and Redis on `6379`)

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nebulax

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:3000
```

Apply the schema (`src/db/schema.sql`, optionally seed with `src/db/seed.sql`), then start the dev server:

```bash
npm run dev
```

This runs `docs:generate` (regenerates the Swagger spec from `docs/*.swagger.ts`) and starts the server with `--watch` via `ts-node/esm`. The API is served on `PORT` (default `3001`), with interactive docs at `/api-docs` and a health check at `/health`.

For a production build:

```bash
npm run build
npm start
```

## Lint & testing

```bash
npm run lint     # eslint src/**/*.ts
npm run format   # prettier --write src/**/*.{ts,sql}
```

Vitest and `@vitest/coverage-v8` are configured (`vitest.config.ts`) for the test suite. Husky + lint-staged run ESLint/Prettier on staged files before each commit.
