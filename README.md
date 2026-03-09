# HomeLedger

Modern personal finance manager built with Next.js 15, React Server Components, and PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: Server Components + React Compiler
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Auth.js v5 + Keycloak (OIDC)
- **Validation**: Zod
- **i18n**: next-intl (EN/FR)
- **Logging**: Pino
- **Testing**: Vitest + Testing Library

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) (`brew install mkcert`)

### Local domains

The project uses custom local domains. Add these to your `/etc/hosts`:

```
127.0.0.1   mac-perso-ora.test
127.0.0.1   keycloak.test
```

| Service    | URL                                    |
|------------|----------------------------------------|
| App        | `https://mac-perso-ora.test:3000`      |
| Keycloak   | `http://keycloak.test:8080`            |
| PostgreSQL | `localhost:5432`                       |

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install mkcert CA and generate certificates:
```bash
mkcert -install
npm run dev:certs
```

This generates the TLS certificate in `certificates/` for `mac-perso-ora.test`.

3. Copy and configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Keycloak client secret
```

4. Start infrastructure (PostgreSQL + Keycloak):
```bash
docker compose -f env-local/docker-compose.yml up -d
```

5. Configure Keycloak:
   - Open `http://keycloak.test:8080`
   - Login with `admin` / `admin`
   - Create a realm `homeledger`
   - Create a client `homeledger-client` (OpenID Connect, confidential)
   - Set valid redirect URIs: `https://mac-perso-ora.test:3000/*`
   - Copy the client secret to `.env.local` (`AUTH_KEYCLOAK_SECRET`)

6. Run database migrations:
```bash
npm run db:migrate
```

7. Start development server:
```bash
npm run dev
```

Open [https://mac-perso-ora.test:3000](https://mac-perso-ora.test:3000)

## 🛠 Development Commands

### Database
- `npm run db:generate` — Generate SQL migrations
- `npm run db:migrate` — Apply migrations
- `npm run db:studio` — Open Drizzle Studio

### Code Quality
- `npm run format` — Format with Prettier
- `npm run type-check` — TypeScript validation
- `npm run lint` — ESLint

### Testing
- `npm test` — Run tests
- `npm run test:coverage` — Coverage report

### Certificates
- `npm run dev:certs` — Regenerate local TLS certificates

## 📁 Project Structure

```
homeledger/
├── app/[locale]/         # Next.js App Router (i18n)
│   ├── (public)/         # Public pages (landing)
│   ├── (app)/app/        # Protected pages (dashboard, accounts, etc.)
│   └── auth/             # Login page
├── components/           # React components
│   ├── ui/               # shadcn/ui primitives
│   └── app-shell.tsx     # Main layout (sidebar + header)
├── db/                   # Database schema & migrations
├── lib/
│   ├── actions/          # Server Actions (+ safe-* wrappers)
│   ├── validations/      # Zod schemas
│   ├── auth.ts           # Auth.js config
│   └── auth.config.ts    # Edge-compatible auth config
├── messages/             # i18n translations (en.json, fr.json)
├── certificates/         # Local TLS certs (gitignored)
├── env-local/            # Docker Compose (Postgres + Keycloak)
└── .amazonq/rules/       # AI coding standards
```

## 🔐 Security

- All Server Actions require authentication via `requireAuth()`
- Zod validation on all inputs
- Parameterized database queries (Drizzle ORM)
- HTTPS in local development (mkcert)
- Environment variables for secrets

## 📝 License

ISC
