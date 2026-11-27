# Gym Shop

A dummy online store (gym clothes, shoes and accessories) built as a **test target for Eva**. It looks and behaves
like a real webshop (catalog, cart, login, checkout, order history, AI support chatbot), but nothing is real:
no payments, no emails, nothing ships.

What makes it useful for evaluation:

- **Seeded, resettable data.** `POST /api/admin/reset` restores the exact same users, products, stock and orders.
- **Deliberate-bug toggles.** Switch known defects on and off at runtime and check that Eva finds them.
- **Stable selectors.** Every interactive element has a `data-testid`.

## Quick start

```bash
docker compose up --build        # first build takes a few minutes
```

Open **http://localhost:3001**.

| Service | URL / port (host) | Notes |
|---|---|---|
| Web (Next.js) | http://localhost:3001 | The only thing a browser needs. It proxies `/api/*` to the API |
| API (ASP.NET Core) | http://localhost:5080 | For scripts and Eva: `/api/admin/*`, `/health` |
| Postgres 17 | localhost:5433 | user/password/db: `gymshop` (5433 avoids clashing with a local Postgres) |

Copy `.env.example` to `.env` to change ports, secrets, the chat model or the starting bugs. Everything has a default.

### Demo accounts (password for all: `Demo123!`)

| Email | Name | Orders |
|---|---|---|
| `demo@gymshop.test` | Alex Demo | 4: Delivered, Shipped (tracking `TRK-1002-SE`), Placed, Cancelled |
| `sam@gymshop.test` | Sam Runner | 3 (use this one to test that users can't see each other's orders) |
| `new@gymshop.test` | Nina New | none |

Handy seed data: *Apex Compression Tee* is sold out everywhere; *Velocity Runner* size 43 is sold out and size 42 has 2 left;
*Stride High-Waist Leggings* size S has 1 left.

## Pages

| Path | What it does |
|---|---|
| `/` | Hero, category tiles, featured products |
| `/products` | Catalog with search, category, size, price filters, sorting, pagination (filters are plain GET params) |
| `/products/[slug]` | Product detail: colour + size picker, stock hints, add to cart |
| `/cart` | Cart (guest cart in localStorage, server cart when logged in), shipping form, mock checkout |
| `/account` | Log in / register, profile, order history, cancel orders that haven't shipped |
| *(every page)* | Floating support chat widget (bottom right) |

Cart rules: max 10 per line, stock is checked on add and on checkout, shipping is €7.90 (free from €100).

## The support chatbot ("Gia")

The C# API calls the Anthropic Messages API (streaming + tool use). The key never reaches the browser.
Tools: `search_products`, `check_stock`, `get_return_policy`, and for logged-in users `list_my_orders` and
`get_order_status` (which only returns the caller's own orders). Chat transcripts are stored in Postgres.

Four ways to run it (set in `.env`):

1. **Anthropic API directly**: `ANTHROPIC_API_KEY=...` (model via `CHAT_MODEL`, default `claude-haiku-5-5`).
2. **An AI gateway** (e.g. Netlight's): set `ANTHROPIC_BASE_URL=https://llm.netlight.ai/`, `ANTHROPIC_AUTH_TOKEN=<token>`
   (sent as a Bearer header) and `CHAT_MODEL` to a model name the gateway offers, e.g. `claude-haiku-latest`.
   List them with `curl https://llm.netlight.ai/v1/models -H "Authorization: Bearer $TOKEN"`.
3. **Fake LLM, free and deterministic**: `node scripts/mock-anthropic.mjs`, then set `ANTHROPIC_API_KEY=mock` and
   `ANTHROPIC_BASE_URL=http://host.docker.internal:9090/`. It triggers tools by keyword (an order number like `GS-1002`,
   "order", "return", "stock"), so the tool loop and the UI can be tested without spending tokens.
4. **Nothing set**: the widget replies "the support chatbot isn't configured".

Verified end to end with real Claude through the Netlight gateway (tool calls, ownership check, both chat bugs).

## Admin API (for Eva / test scripts)

Direct to the API on port 5080, header `X-Admin-Key` (default `dev-admin-key`, set `ADMIN_API_KEY`; leave it empty to disable).
These endpoints are deliberately **not** reachable through the web app's proxy.

```bash
KEY="X-Admin-Key: dev-admin-key"
curl -X POST localhost:5080/api/admin/reset -H "$KEY"                       # restore seed data + default flags
curl localhost:5080/api/admin/flags -H "$KEY"                               # list bug flags
curl -X PUT localhost:5080/api/admin/flags -H "$KEY" -H 'content-type: application/json' \
     -d '{"flags":{"cart_total_wrong":true}}'                               # switch bugs on/off
curl localhost:5080/api/admin/chat-sessions -H "$KEY"                       # recent chat sessions
curl localhost:5080/api/admin/chat-sessions/<id> -H "$KEY"                  # full transcript + which tools were used
```

## Deliberate bugs (all off by default)

Start with some on via `BUGS=cart_total_wrong,checkout_500` in `.env`, or toggle at runtime with the admin API.
`/api/admin/reset` returns them to their starting values.

| Flag | What goes wrong | What Eva should notice |
|---|---|---|
| `cart_total_wrong` | A cart line's total ignores the quantity | 2 × €14 shows €14 (subtotal, total and the order) |
| `checkout_500` | Placing an order fails with a server error | Checkout shows a failure / the order never appears |
| `stock_ignored` | Out-of-stock items can be added and ordered | A sold-out size can be bought |
| `login_wrong_error` | Wrong password says "No account found…", unknown email says "Incorrect password." | Error messages reveal which part was wrong (and are swapped) |
| `chat_invents_policy` | The bot claims a 90-day return window with free returns and instant refunds | Answer contradicts the real 30-day policy |
| `chat_leaks_other_orders` | The order tool skips the ownership check | Asking about `GS-1005` as Alex returns Sam's order |

## Tests

```bash
node scripts/smoke-api.mjs            # 30 API checks against a running stack (resets data first)
pnpm --filter web test:e2e            # 5 Playwright browser tests against http://localhost:3001
pnpm test                             # both
```

Playwright needs its browser once: `pnpm --filter web exec playwright install chromium`.
`pnpm typecheck` and `pnpm lint` check the frontend.

## Running without Docker (hot reload)

```bash
docker compose up db -d                                # just Postgres, on localhost:5433
export DATABASE_URL="Host=localhost;Port=5433;Database=gymshop;Username=gymshop;Password=gymshop"
ASPNETCORE_URLS=http://localhost:5080 pnpm dev:api     # API (needs .NET 10 SDK); migrates and seeds on start
pnpm install && API_URL=http://localhost:5080 pnpm dev:web   # web on :3001
```

## Project layout

```
apps/web/                  Next.js (App Router) + TypeScript + Tailwind
  app/                     pages, plus route handlers: /api/auth/* (sets the HttpOnly cookie) and /api/[...path] (proxy)
  components/              providers (auth, cart), header, chat widget, product card
  e2e/                     Playwright tests
backend/src/GymShop.Api/   ASP.NET Core minimal APIs, EF Core 10 + Npgsql, ASP.NET Core Identity, JWT
  Domain/ Data/            entities, DbContext, migrations, seeder
  Endpoints/ Admin/ Chat/  HTTP endpoints, admin + bug flags, chatbot
scripts/                   smoke-api.mjs, mock-anthropic.mjs
docker-compose.yml         db + api + web
```

How login works: the browser posts to the web app, which calls the API, then stores the returned JWT in an
**HttpOnly cookie**. For every other `/api/*` call the web app attaches the JWT as a Bearer header.
So the browser never talks to the C# API directly (no CORS, no tokens in JavaScript).

Database changes: `cd backend && SEED_ON_START=false dotnet ef migrations add <Name> --project src/GymShop.Api --output-dir Data/Migrations`
(the EF tool is pinned in `backend/dotnet-tools.json`; run `dotnet tool restore` once).

## Deploying

### Vercel (current setup)

Two Vercel projects in team `asly1`, plus a Neon Postgres from the Vercel Marketplace:

| Project | What | Root directory | URL |
|---|---|---|---|
| `gym-shop-web` | Next.js (native Vercel build) | `apps/web` | https://gym-shop-web.vercel.app |
| `gym-shop-api` | C# API, built from `backend/Dockerfile` with Vercel's Container runtime (beta) | `backend` | https://gym-shop-api.vercel.app |
| `gym-shop-db` | Neon Postgres (region `iad1`) | | connected to `gym-shop-api` |

Browsers only talk to the web app; it proxies `/api/*` to the API (`API_URL`). Eva and scripts call the API directly for `/api/admin/*`.
Production secrets (`ADMIN_API_KEY`, `JWT_SECRET`) were generated at setup; a local copy is in `.env.vercel.local` (git-ignored).

Env vars: web has `API_URL` and `COOKIE_SECURE=true`. API has `PORT=8080`, `SEED_ON_START=false`, `ADMIN_API_KEY`, `JWT_SECRET`, the Neon
variables (the API prefers `DATABASE_URL_UNPOOLED`), and optionally `ANTHROPIC_*` / `CHAT_MODEL` for the chatbot.

Redeploy (from the repo root for web, from `backend/` for the API):

```bash
vercel deploy --prod --yes                 # in gym-shop/      -> gym-shop-web
cd backend && vercel deploy --prod --yes   # in gym-shop/backend -> gym-shop-api
```

After adding a migration, run it once against the production database *before* deploying the API, because the API
doesn't migrate on start in production (cold starts stay fast):

```bash
cd backend && vercel env pull /tmp/prod.env --environment production --yes
docker build -t gym-shop-api . && docker run --rm -e MIGRATE_ONLY=true \
  -e DATABASE_URL="$(grep ^DATABASE_URL_UNPOOLED= /tmp/prod.env | cut -d= -f2- | tr -d '"')" gym-shop-api
rm /tmp/prod.env
```

`POST /api/admin/reset` also migrates and re-seeds at any time.

Things to know about the Vercel setup:
- The container runtime is **beta**. Instances scale to zero after 5 minutes idle, so the first request after a quiet period is slower.
- Bug flags are stored in the database (not memory), because several API instances can run at once.
- The API is publicly reachable (Eva needs it). The only protection for `/api/admin/*` is the `ADMIN_API_KEY`.
- Test production the same way as local: `node scripts/smoke-api.mjs <api-url> <admin-key>` and
  `WEB_URL=... API_URL=... ADMIN_API_KEY=... pnpm --filter web test:e2e`. Both reset the production data.
- Adding the chatbot: `vercel env add ANTHROPIC_API_KEY -e production` (or `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` + `CHAT_MODEL`
  in `backend/`), then redeploy the API.

### Any other container platform

The same images run anywhere (Azure Container Apps, Fly.io, Railway, a VM with compose...):
- **web** (`apps/web/Dockerfile`, context = repo root): `API_URL`, `COOKIE_SECURE=true` over HTTPS.
- **api** (`backend/Dockerfile`, context = `backend/`): `DATABASE_URL` (Npgsql string or `postgres://` URL), `JWT_SECRET`,
  `ADMIN_API_KEY` (empty disables the admin API), chat settings, `PORT` if the platform sets one.
- The default `JWT_SECRET` / `ADMIN_API_KEY` are for local use only.
