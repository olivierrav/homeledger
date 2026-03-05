# HomeLedger

Modern personal finance manager built with Next.js 15, React Server Components, and PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: Server Components + React Compiler
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Auth.js v5 + Keycloak
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest + Testing Library

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Start infrastructure (PostgreSQL + Keycloak):
```bash
cd env-local
docker-compose up -d
```

4. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠 Development Commands

### Database
- `npm run db:generate` - Generate SQL migrations
- `npm run db:migrate` - Apply migrations
- `npm run db:studio` - Open Drizzle Studio

### Code Quality
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint

### Testing
- `npm test` - Run tests
- `npm run test:coverage` - Coverage report

## 📁 Project Structure

```
homeledger/
├── app/              # Next.js App Router
├── components/       # React components
│   └── ui/          # shadcn/ui primitives
├── db/              # Database schema & client
├── lib/             # Utilities & business logic
│   ├── actions/     # Server Actions
│   └── validations/ # Zod schemas
├── env-local/       # Docker infrastructure
└── .amazonq/rules/  # AI coding standards
```

## 🔐 Security

- All Server Actions require authentication
- Zod validation on all inputs
- Parameterized database queries
- Environment variables for secrets

## 📝 License

ISC
