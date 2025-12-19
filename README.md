# Datax Market Research

A Bloomberg Terminal-inspired investment research platform with AI assistance.

## Features

- **AI Research Chat** - Ask questions about stocks using Groq's llama-3.3-70b model
- **Real-Time Market Data** - Live ticker search and market events feed
- **Note-Taking System** - Linked notes with graph visualization
- **Portfolio Tracking** - Manual portfolio entry with P/L tracking
- **Stock Screener** - Filter stocks by fundamentals and technicals
- **Market Overview** - Charts, indices, and top movers
- **Kalshi Integration** - Real-time prediction market data

## Setup

### ⚠️ Required: Add Your Groq API Key

The AI chat requires a Groq API key to function. Add it in the **Vars** section of the v0 sidebar:

1. Click **Vars** in the left sidebar of v0
2. Add a new variable:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key (get it free at https://console.groq.com/keys)

### Optional: Add Polygon API Key

For real-time market data, add your Polygon.io API key:

1. Click **Vars** in the left sidebar
2. Add a new variable:
   - Name: `POLYGON_API_KEY`
   - Value: Your Polygon.io API key

Without this key, the app will use mock data for development.

### Environment Variables (if running locally)

Add these to your Vercel project or `.env.local`:

\`\`\`env
# Groq (for AI chat)
GROQ_API_KEY=your_groq_api_key

# Polygon.io (for market data)
POLYGON_API_KEY=your_polygon_api_key

# App URL (for API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Sentry (error monitoring)
SENTRY_DSN=your_server_dsn
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=your_browser_dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to start using Datax Market Research.

## Configuration

### Updating the AI Model

To change the AI model used for chat:

1. Open `lib/config/ai-model.ts`
2. Update the `model` field in `AI_CONFIG`
3. Available Groq models: `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `llama-3.1-70b-versatile`

### Getting API Keys

**Groq API Key:**
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add it to environment variables as `GROQ_API_KEY`

**Polygon.io API Key:**
1. Sign up at [polygon.io](https://polygon.io/)
2. Get your API key from the dashboard
3. Add it to your environment variables as `POLYGON_API_KEY`

## Architecture

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with custom Bloomberg-inspired theme
- **AI**: Groq API with llama-3.3-70b-versatile model
- **Market Data**: Polygon.io REST API and WebSocket
- **Prediction Markets**: Kalshi WebSocket API
- **Charts**: Recharts for data visualization

## Support

For issues or questions, check the documentation or create an issue. Monitoring guidance and sample Sentry dashboards are
available in [`docs/monitoring.md`](docs/monitoring.md).
