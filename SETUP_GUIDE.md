# Datax Market Research Terminal - Setup Guide

## Overview

This guide covers the setup and deployment of the Datax Market Research Terminal with database persistence, user authentication, and real-time market data integration.

## Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for PostgreSQL database)
- API keys for:
  - Groq (for AI chat)
  - Polygon.io (for market data)

## Phase 1: Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd datax-research-terminal

# Install dependencies
npm install

# Install Prisma CLI
npm install -D prisma
```

### 2. Set Up Supabase Database

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name and password
4. Wait for project initialization
5. Go to Settings → Database → Connection pooling
6. Note your connection string

#### Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API Keys
GROQ_API_KEY="your-groq-api-key"
POLYGON_API_KEY="your-polygon-api-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database Schema

```bash
# Push Prisma schema to database
npx prisma db push

# Optional: Generate Prisma Client
npx prisma generate

# Optional: Open Prisma Studio to view database
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/auth/signup` to create your first account.

## API Keys Setup

### Groq API Key

1. Go to [console.groq.com](https://console.groq.com/keys)
2. Create or copy your API key
3. Add to `.env.local` as `GROQ_API_KEY`

**Cost**: Free tier available with rate limits

### Polygon.io API Key

1. Go to [polygon.io/dashboard](https://polygon.io/dashboard)
2. Sign up or log in
3. Copy your API key
4. Add to `.env.local` as `POLYGON_API_KEY`

**Cost**: Free tier includes real-time stock data with limitations

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts          # Auth endpoints
│   │   └── signup/route.ts                 # Registration endpoint
│   ├── notes/                              # Notes CRUD API
│   ├── portfolio/                          # Portfolio API
│   ├── chat/history/route.ts               # Chat history
│   └── market/                             # Market data (existing)
│
├── auth/
│   ├── login/page.tsx                      # Login page
│   ├── signup/page.tsx                     # Signup page
│   └── layout.tsx                          # Auth layout
│
└── [other pages remain unchanged]

components/
├── auth/
│   ├── login-form.tsx                      # Login form
│   └── signup-form.tsx                     # Signup form
├── charts/
│   └── indicator-selector.tsx              # Technical indicator selector
└── [other components]

lib/
├── auth/
│   ├── auth.ts                             # NextAuth configuration
│   └── password.ts                         # Password hashing utilities
├── db/
│   ├── services/
│   │   ├── notes.service.ts                # Notes database operations
│   │   ├── portfolio.service.ts            # Portfolio operations
│   │   ├── chat.service.ts                 # Chat history operations
│   │   └── screener.service.ts             # Screener operations
│   └── cache.ts                            # Caching layer
├── charts/
│   └── indicators.ts                       # Technical indicators calculations
├── notes/
│   └── link-parser.ts                      # WikiLink parsing
├── prisma.ts                               # Prisma client instance
└── types.ts                                # Updated TypeScript interfaces

prisma/
└── schema.prisma                           # Database schema

middleware.ts                               # Route protection
.env.example                                # Example environment variables
IMPLEMENTATION_SPEC.md                      # Phase 1-3 implementation plan
SETUP_GUIDE.md                              # This file
```

## Database Schema

### Core Tables

**User**
- id: Integer (PK)
- email: String (unique)
- password_hash: String
- created_at, updated_at: Timestamps

**Note**
- id: Integer (PK)
- userId: Integer (FK)
- title: String
- content: Text
- tags: String[] (array)
- created_at, updated_at: Timestamps

**NoteLink**
- id: Integer (PK)
- sourceNoteId: Integer (FK)
- targetNoteId: Integer (FK, nullable)
- targetTitle: String (for stub links)
- created_at: Timestamp

**PortfolioPosition**
- id: Integer (PK)
- userId: Integer (FK)
- symbol: String
- assetType: String ('stock' | 'crypto')
- quantity: Decimal
- avgCost: Decimal
- created_at, updated_at: Timestamps

**WatchlistItem**
- id: Integer (PK)
- userId: Integer (FK)
- symbol: String
- assetType: String
- created_at: Timestamp

**ChatMessage**
- id: Integer (PK)
- userId: Integer (FK)
- role: String ('user' | 'assistant')
- content: Text
- created_at: Timestamp

**SavedScreen**
- id: Integer (PK)
- userId: Integer (FK)
- name: String
- criteria: JSON
- created_at, updated_at: Timestamps

## Key Features Implemented

### ✅ Authentication
- Email/password signup and login
- NextAuth.js v5 with Credentials provider
- JWT-based sessions
- Route protection via middleware
- Secure password hashing with bcryptjs

### ✅ Data Persistence
- All user data stored in PostgreSQL
- Service layer for database operations
- Type-safe queries with Prisma ORM
- User isolation (each user sees only their data)

### ✅ Notes System
- Create, read, update, delete notes
- Tag support for organization
- Full-text search capabilities
- WikiLink parsing for bidirectional links
- Backlinks display (backend ready)

### ✅ Portfolio Management
- Add/update/delete portfolio positions
- Watchlist creation and management
- P&L calculations
- Sector allocation tracking

### ✅ Chat History
- Persistent conversation storage
- Retrieve conversation history
- Clear history option

### ✅ Technical Indicators
- SMA (20, 50, 200 period)
- EMA (12, 26 period)
- RSI (14 period)
- MACD with signal line
- Bollinger Bands (20 period, 2 std dev)
- ATR (14 period)
- Indicator selector UI

## Common Tasks

### Create a New User

```bash
# Via signup page at http://localhost:3000/auth/signup
# Or use API directly:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### View Database in Prisma Studio

```bash
npx prisma studio
```

### Update Database Schema

```bash
# Edit prisma/schema.prisma
# Then push changes:
npx prisma db push

# Create migration (for production):
npx prisma migrate dev --name description_of_change
```

### Reset Database (Development Only)

```bash
npx prisma db push --force-reset
```

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Add database persistence and authentication"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select GitHub repository
4. Configure environment variables:
   - DATABASE_URL
   - DIRECT_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to your production domain)
   - GROQ_API_KEY
   - POLYGON_API_KEY
   - NEXT_PUBLIC_APP_URL
5. Deploy

### 3. Run Database Migrations

```bash
# After deployment, run migrations in Vercel
vercel env pull .env.local
npx prisma db push
```

## Troubleshooting

### Issue: "Error: Missing NEXTAUTH_SECRET"
**Solution**: Generate a secret and add to `.env.local`
```bash
openssl rand -base64 32
```

### Issue: "Database connection failed"
**Solution**: Check your DATABASE_URL in Supabase settings and verify IP allowlist

### Issue: "Prisma Client not found"
**Solution**: Run `npx prisma generate`

### Issue: "Email already in use"
**Solution**: Use a different email or reset the database

## Next Steps

1. **Test the flow**: Sign up, create notes, add portfolio items
2. **Integrate AI screener**: See `IMPLEMENTATION_SPEC.md` Phase 2
3. **Add data embeddings**: Implement shortcode rendering in notes
4. **Enhance Kalshi**: Set up WebSocket streaming
5. **Mobile optimization**: Make the app PWA-ready

## Security Considerations

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ API keys stored in environment variables (not in code)
- ✅ User data isolated by userId
- ✅ HTTPS enforced in production
- ✅ CSRF protection via NextAuth
- ⚠️ TODO: Rate limiting on API routes
- ⚠️ TODO: Audit logging for sensitive operations
- ⚠️ TODO: Data encryption for sensitive fields

## Performance Notes

- Database queries use indexes on userId and timestamps
- Caching layer available for frequently accessed data
- API routes are optimized with proper pagination
- Consider Redis for session store if scaling to many users

## Support

For issues or questions:
1. Check the IMPLEMENTATION_SPEC.md for architecture details
2. Review Prisma docs: https://www.prisma.io/docs/
3. Check NextAuth docs: https://next-auth.js.org/
4. Review Next.js API route docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
