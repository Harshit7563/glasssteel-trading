# GlassSteel Trading

Website for **GLASSTEEL TRADING (OPC) PRIVATE LIMITED** — steel, glass, interior & exterior catalogue.

**Domain:** https://glasssteel.in

## Stack

- React (Vite) + Express + PostgreSQL
- Production: Express serves `client/dist` + `/api`

## Local

```bash
npm run install:all
# configure server/.env from server/.env.example
npm run db:setup --prefix server
npm run db:seed-all-real --prefix server
npm run dev
```

Open http://127.0.0.1:5173

## WHM / cPanel deploy

See terminal commands in chat / run `scripts/deploy-whm.sh` on the server after clone.
