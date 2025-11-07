# Rallies.ai - Phase 1 Implementation Specification

## Overview
This document outlines the detailed implementation plan for moving the DataX Market Research Terminal from a prototype to a production-ready application following the Rallies.ai PRD.

## Phase 1: MVP Stability (Database + Auth + Persistence)

### 1. Database Setup (Supabase PostgreSQL)

#### Architecture
- Use Supabase (hosted PostgreSQL) for simplicity and scalability
- Connection via Prisma ORM for type-safe database access
- Environment variables for connection strings

#### Database Schema

```sql
-- Users table
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notes table
CREATE TABLE "Note" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, title)
);

-- Note links (WikiLinks)
CREATE TABLE "NoteLink" (
  id SERIAL PRIMARY KEY,
  source_note_id INTEGER NOT NULL REFERENCES "Note"(id) ON DELETE CASCADE,
  target_note_id INTEGER REFERENCES "Note"(id) ON DELETE SET NULL,
  target_title VARCHAR(255), -- For stub links
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio positions
CREATE TABLE "PortfolioPosition" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(10) NOT NULL, -- 'stock' or 'crypto'
  quantity NUMERIC(15,8) NOT NULL,
  avg_cost NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Watchlist items
CREATE TABLE "WatchlistItem" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(10) NOT NULL, -- 'stock' or 'crypto'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Chat history
CREATE TABLE "ChatMessage" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Screener saves (future)
CREATE TABLE "SavedScreen" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Authentication System (NextAuth.js v5)

#### Implementation Details
- Use NextAuth.js with Credentials provider (email/password)
- Optional: Add GitHub OAuth provider later
- JWT-based sessions
- Secure password hashing with bcrypt
- Protected API routes and pages

#### File Structure
```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
└── middleware.ts
```

#### Key Files
1. `app/api/auth/[...nextauth]/route.ts` - Auth configuration
2. `lib/auth/auth-utils.ts` - Password hashing/verification
3. `app/middleware.ts` - Route protection
4. `components/auth/login-form.tsx` - Login UI
5. `components/auth/signup-form.tsx` - Signup UI

### 3. Data Persistence Layer

#### Architecture
- Create `lib/db/` directory with database utilities
- Implement services for each data model
- Use Prisma Client for queries
- Cache layer for frequently accessed data

#### Services to Implement
1. `lib/db/services/notes.service.ts` - CRUD for notes
2. `lib/db/services/portfolio.service.ts` - Holdings & watchlist
3. `lib/db/services/chat.service.ts` - Save chat history
4. `lib/db/services/screener.service.ts` - Save screens
5. `lib/db/cache.ts` - Simple in-memory cache

#### API Route Updates
- Update existing `/api/market/*` routes to use new auth
- Create new data persistence routes:
  - `POST /api/notes` - Create note
  - `PUT /api/notes/[id]` - Update note
  - `GET /api/notes` - List user's notes
  - `DELETE /api/notes/[id]` - Delete note
  - Similar for portfolio, chat, etc.

### 4. Note Linking Enhancement

#### Features
1. **Backlinks Display**
   - Show all notes that link to current note
   - Quick navigation to backlinks

2. **Improved Graph View**
   - Properly visualize all connections
   - Bidirectional relationships
   - Filter by tag/type

3. **Link Validation**
   - Check if linked notes exist
   - Create stub notes for missing links
   - Auto-suggest existing notes when typing `[[`

#### Components
1. `components/notes/backlinks-panel.tsx` - Display backlinks
2. `components/notes/graph-view-enhanced.tsx` - Improved visualization
3. `lib/notes/link-parser.ts` - Parse and extract WikiLinks

### 5. Chart Technical Indicators

#### Indicators to Add
1. **Moving Averages** - 20, 50, 200 day SMA
2. **RSI (Relative Strength Index)** - 14 period
3. **MACD** - Moving Average Convergence Divergence
4. **Bollinger Bands** - 20 period, 2 std dev
5. **Volume** - Display on separate chart

#### Implementation
- Use TradingView Lightweight Charts or Chart.js with custom plugins
- Update chart component to accept indicator selection
- Cache historical data with technical calculations
- Add indicator selector to market/portfolio chart views

#### Files
1. `lib/charts/indicators.ts` - Calculation functions
2. `components/charts/indicator-selector.tsx` - UI for toggles
3. Update `components/stock-chart.tsx` - Integrate indicators

### 6. AI-Assisted Screener

#### Features
1. **Natural Language Interpretation**
   - Accept queries like "Find me mid-cap healthcare stocks with P/E < 20"
   - Convert to screener filters
   - Return results

2. **Integration with Existing Screener**
   - Use Groq LLM with a new tool: `createScreenerFilter`
   - Map natural language to filter criteria
   - Execute screening logic

3. **Conversation Context**
   - Maintain screening conversation history
   - Support refinements: "Now filter to P/E < 15"

#### Files
1. `lib/screener/nl-interpreter.ts` - Parse queries to filters
2. Update `app/api/chat/route.ts` - Add screener tool
3. `components/screener/ai-query-input.tsx` - Input component

### 7. Live Data Embedding in Notes

#### Features
1. **Shortcodes in Notes**
   - `{{AAPL}}` - Display current price
   - `{{AAPL chart 1M}}` - Embed 1-month chart
   - `{{AAPL metrics}}` - Display key metrics

2. **Dynamic Content Rendering**
   - Parse note content for shortcodes
   - Fetch live data
   - Render with proper styling
   - Update at regular intervals

#### Implementation
1. `lib/notes/shortcode-parser.ts` - Extract shortcodes
2. `lib/notes/shortcode-renderer.ts` - Generate components
3. `components/notes/note-renderer.tsx` - Enhanced note display
4. Create shortcode components:
   - `components/notes/shortcodes/ticker-price.tsx`
   - `components/notes/shortcodes/ticker-chart.tsx`
   - `components/notes/shortcodes/ticker-metrics.tsx`

### 8. Kalshi WebSocket Enhancement

#### Current State
- Using mock data in `/lib/api/kalshi.ts`
- Structure ready for WebSocket

#### Implementation
1. Create WebSocket client in `lib/api/kalshi-ws.ts`
2. Real-time market feed using Kalshi API
3. Update `components/kalshi-markets.tsx` for live updates
4. Handle connection state (connected/disconnected)
5. Auto-reconnect on disconnect

#### Files
1. `lib/api/kalshi-ws.ts` - WebSocket client
2. `hooks/use-kalshi-stream.ts` - React hook for streaming
3. Update `components/kalshi-markets.tsx` - Use hook

---

## Implementation Timeline

### Week 1-2: Database & Auth
- Set up Supabase project
- Implement Prisma schema
- Add NextAuth.js
- Create login/signup pages
- Protect routes

### Week 2-3: Data Persistence
- Implement database services
- Update API routes for auth
- Migrate existing in-memory state to database
- Update components to use new persistence

### Week 3-4: Note Linking & Charts
- Enhance note linking system
- Add backlinks display
- Implement technical indicators
- Update charting components

### Week 4-5: AI & Advanced Features
- Add AI-assisted screener
- Implement note shortcodes
- Enhance Kalshi WebSocket
- Testing and refinement

---

## Technology Stack Additions

### New Dependencies
```json
{
  "next-auth": "5.0.0",
  "prisma": "latest",
  "@prisma/client": "latest",
  "bcryptjs": "latest",
  "@supabase/supabase-js": "latest",
  "ta": "latest" // Technical analysis library for indicators
}
```

### New Dev Dependencies
```json
{
  "prisma": "latest"
}
```

---

## Environment Variables Required

```
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Direct connection for migrations

# NextAuth
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Existing
GROQ_API_KEY="..."
POLYGON_API_KEY="..."
```

---

## Testing Strategy

1. **Unit Tests**
   - Database services
   - Indicator calculations
   - Link parser

2. **Integration Tests**
   - Auth flow
   - CRUD operations
   - Data persistence

3. **E2E Tests**
   - User registration
   - Note creation with links
   - Portfolio management
   - Chat with saved history

---

## Success Criteria

- [x] Database schema designed
- [ ] Supabase project created
- [ ] NextAuth.js implemented
- [ ] All user data persists across sessions
- [ ] Notes with WikiLinks working
- [ ] Chart indicators displayed
- [ ] AI screener functional
- [ ] Note shortcodes rendering
- [ ] Kalshi WebSocket streaming
- [ ] All tests passing
- [ ] Zero data loss on refresh

---

## Future Considerations

1. **Caching Strategy** - Redis for session/quote cache
2. **Rate Limiting** - Protect API routes
3. **Data Backups** - Regular database backups
4. **Audit Logging** - Track user actions
5. **Search Optimization** - Full-text search on notes
6. **Mobile App** - React Native wrapper
