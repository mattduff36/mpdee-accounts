# Development Guide

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run typecheck` | Run TypeScript type checking |

## Database

### Local Development (SQLite)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

### Production (PostgreSQL)

Uses Neon PostgreSQL. Database URL should be set in environment variables.

## Environment Variables

Copy `env.example.md` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Key variables:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Login credentials
- `NEXTAUTH_SECRET` - JWT secret (32+ characters)
- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - For sending emails

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── clients/      # Client management
│   ├── invoices/     # Invoice management
│   ├── expenses/     # Expense tracking
│   └── login/        # Authentication
├── components/       # React components
├── lib/              # Utilities (auth, db, email, pdf)
└── test/             # Test setup

prisma/
├── schema.prisma     # Database schema
├── seed.js          # Seed data
└── clear-data.js    # Clear database
```

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Deployment

Deployed to Vercel at `https://accounts.mpdee.info/`. Push to main branch triggers automatic deployment.
