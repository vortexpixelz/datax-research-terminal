# Datax Market Research Terminal - Quick Start Guide

## 5-Minute Setup

### 1. Environment Setup
```bash
# Create .env.local file
cp .env.example .env.local

# Generate NextAuth secret
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET in .env.local
```

### 2. Get API Keys
- **Groq API**: https://console.groq.com/keys (free tier available)
- **Polygon.io**: https://polygon.io/dashboard (free tier for stocks)
- **Supabase**: https://supabase.com (create project, copy connection string)

### 3. Configure .env.local
```env
DATABASE_URL="postgresql://user:password@host:5432/postgres?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/postgres?schema=public"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_..."
POLYGON_API_KEY="pk_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Install & Run
```bash
npm install
npx prisma db push
npm run dev
```

### 5. Access App
- Sign up: http://localhost:3000/auth/signup
- Main app: http://localhost:3000

## Common Commands

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Push schema changes
npx prisma db push

# Reset database (dev only!)
npx prisma db push --force-reset

# Create migration
npx prisma migrate dev --name description
```

### Development
```bash
# Start dev server
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

### Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Quick Reference

### Authentication
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Sign in (handled by NextAuth)
# POST to /api/auth/callback/credentials with email & password
```

### Notes
```bash
# Get all notes
curl http://localhost:3000/api/notes

# Create note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Content here","tags":["tag1"]}'

# Update note
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","content":"New content"}'

# Delete note
curl -X DELETE http://localhost:3000/api/notes/1

# Search notes
curl "http://localhost:3000/api/notes?q=search+term"
```

### Portfolio
```bash
# Get positions
curl http://localhost:3000/api/portfolio/positions

# Add position
curl -X POST http://localhost:3000/api/portfolio/positions \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","assetType":"stock","quantity":10,"avgCost":150.25}'

# Update position
curl -X PUT http://localhost:3000/api/portfolio/positions/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity":15,"avgCost":145.50}'

# Delete position
curl -X DELETE http://localhost:3000/api/portfolio/positions/1
```

### Watchlist
```bash
# Get watchlist
curl http://localhost:3000/api/portfolio/watchlist

# Add to watchlist
curl -X POST http://localhost:3000/api/portfolio/watchlist \
  -H "Content-Type: application/json" \
  -d '{"symbol":"MSFT","assetType":"stock"}'

# Remove from watchlist
curl -X DELETE http://localhost:3000/api/portfolio/watchlist/1
```

### Chat History
```bash
# Get conversation history
curl http://localhost:3000/api/chat/history

# Clear history
curl -X DELETE http://localhost:3000/api/chat/history
```

## Feature Quick Start

### Using WikiLinks in Notes
```
In your note, write:
"[[Apple Inc.]] is a great company to compare with [[Microsoft]]"

This creates links to other notes. Click to navigate.
```

### Using Shortcodes in Notes
```
In your note, write:
"Current price: {{AAPL}}"
"1-month chart: {{AAPL chart 1M}}"
"Key metrics: {{AAPL metrics}}"

These render live data from your market data API.
```

### Natural Language Screener
Ask the AI chatbot:
- "Find me mid-cap tech stocks with P/E < 20"
- "Show healthcare stocks under $50 with revenue growth > 15%"
- "Large cap profitable financials"

### Technical Indicators
1. Go to Markets page
2. Click "Indicators" button
3. Select indicators (SMA, RSI, MACD, Bollinger Bands, etc.)
4. View on chart

### Kalshi Markets
1. Go to Markets page
2. See real-time prediction markets
3. Filter by category (Economics, Crypto, Markets)
4. View probabilities and volume

## File Organization

### Key Directories
```
app/           → Next.js pages and API routes
components/    → React components
lib/           → Utilities, services, types
  └─ auth/     → Authentication utilities
  └─ db/       → Database services
  └─ charts/   → Indicator calculations
  └─ notes/    → Note utilities
  └─ screener/ → NL screener utilities
  └─ api/      → API client wrappers
hooks/         → React custom hooks
prisma/        → Database schema
```

### Important Files
- `lib/types.ts` - Core TypeScript interfaces
- `lib/prisma.ts` - Prisma client setup
- `lib/auth/auth.ts` - NextAuth configuration
- `middleware.ts` - Route protection

## Troubleshooting

### "Database connection failed"
1. Verify DATABASE_URL in .env.local
2. Check Supabase IP allowlist
3. Test connection: `npx prisma db execute --stdin < /dev/null`

### "Missing NEXTAUTH_SECRET"
```bash
openssl rand -base64 32
# Copy to .env.local as NEXTAUTH_SECRET
```

### "Prisma Client not found"
```bash
npx prisma generate
npm install @prisma/client
```

### "Can't sign up"
1. Check email format is valid
2. Verify database is connected
3. Check browser console for errors
4. Try different email address

### "API keys not working"
1. Verify keys are in .env.local (not .env)
2. Restart dev server after changing .env
3. Check keys have correct permissions
4. Verify API keys are active on provider dashboard

## Environment Variables Explained

| Variable | Purpose | Required |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | Yes |
| DIRECT_URL | Direct DB connection (migrations) | Yes |
| NEXTAUTH_SECRET | JWT signing secret | Yes |
| NEXTAUTH_URL | App URL for auth callbacks | Yes |
| GROQ_API_KEY | AI model access | Yes |
| POLYGON_API_KEY | Market data access | No (fallback to mock) |
| NEXT_PUBLIC_APP_URL | Public app URL | No (defaults to NEXTAUTH_URL) |

## Performance Tips

### Development
- Use Prisma Studio to inspect data: `npx prisma studio`
- Enable slow query logging in Supabase dashboard
- Monitor API response times in browser DevTools

### Production
- Enable database query caching
- Set up Redis for session store
- Implement API rate limiting
- Use CDN for static assets
- Monitor with Vercel Analytics

## Next Steps

After setup, try:

1. **Create a test note** with WikiLinks
2. **Add portfolio position** and verify it saves
3. **Ask AI a question** about a stock
4. **Test screener** with a natural language query
5. **Add shortcodes** to a note to see live data

## Resources

### Documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup
- [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) - Technical design
- [PHASE_1_COMPLETION.md](./PHASE_1_COMPLETION.md) - Feature summary

### External Docs
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth Docs](https://next-auth.js.org/)
- [Next.js Docs](https://nextjs.org/docs/)
- [Supabase Docs](https://supabase.com/docs/)
- [Groq API Docs](https://console.groq.com/docs/speech-text)
- [Polygon.io Docs](https://polygon.io/docs/)

## Getting Help

1. Check the troubleshooting section above
2. Review documentation files
3. Check browser console for errors
4. Review Vercel/Next.js error logs
5. Check Supabase dashboard for database issues

---

**Happy coding!** 🚀
