import { convertToModelMessages, streamText, tool, type UIMessage, stepCountIs } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import { AI_CONFIG } from "@/lib/config/ai-model"

export const maxDuration = 30

const apiKey = process.env.GROQ_API_KEY || process.env.API_KEY_GROQ_API_KEY

if (!apiKey) {
  console.error("[v0] GROQ_API_KEY is missing. Please add it in the Vars section of the sidebar.")
}

export async function POST(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  const clientApiKey = req.headers.get("x-groq-api-key")
  const effectiveApiKey = clientApiKey || apiKey

  if (!effectiveApiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Groq API key is not configured. Please add your API key in Settings or set GROQ_API_KEY environment variable.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const groqInstance = createGroq({
    apiKey: effectiveApiKey,
  })

  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: groqInstance(AI_CONFIG.model),
    system: `You are a financial research assistant helping investors analyze stocks and cryptocurrencies. 
    
Your capabilities:
- Provide market data analysis using real-time quotes and company information
- Answer questions about stock fundamentals, technicals, and market trends
- Help with portfolio analysis and risk assessment
- Suggest stocks based on investment criteria
- Explain financial concepts clearly

Always cite data sources and be transparent about limitations. Use tools to fetch current market data when needed.`,
    prompt,
    stopWhen: stepCountIs(5),
    tools: {
      getStockQuote: tool({
        description: "Get current stock price and quote data for a ticker symbol",
        inputSchema: z.object({
          ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
        }),
        execute: async ({ ticker }) => {
          console.log("[v0] Fetching quote for:", ticker)
          try {
            const response = await fetch(`${baseUrl}/api/market/quote?symbol=${ticker}`)
            const data = await response.json()
            console.log("[v0] Quote data:", data)
            return data
          } catch (error) {
            console.error("[v0] Error fetching quote:", error)
            return { error: "Failed to fetch quote data" }
          }
        },
      }),
      getStockDetails: tool({
        description: "Get detailed company information for a stock ticker",
        inputSchema: z.object({
          ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
        }),
        execute: async ({ ticker }) => {
          console.log("[v0] Fetching details for:", ticker)
          try {
            const response = await fetch(`${baseUrl}/api/market/details?symbol=${ticker}`)
            const data = await response.json()
            console.log("[v0] Details data:", data)
            return data
          } catch (error) {
            console.error("[v0] Error fetching details:", error)
            return { error: "Failed to fetch company details" }
          }
        },
      }),
      getHistoricalData: tool({
        description: "Get historical price data for technical analysis",
        inputSchema: z.object({
          ticker: z.string().describe("Stock ticker symbol"),
          from: z.string().describe("Start date (YYYY-MM-DD)"),
          to: z.string().describe("End date (YYYY-MM-DD)"),
        }),
        execute: async ({ ticker, from, to }) => {
          console.log("[v0] Fetching history for:", ticker, from, to)
          try {
            const response = await fetch(`${baseUrl}/api/market/history?symbol=${ticker}&from=${from}&to=${to}`)
            const data = await response.json()
            console.log("[v0] History data:", data)
            return data
          } catch (error) {
            console.error("[v0] Error fetching history:", error)
            return { error: "Failed to fetch historical data" }
          }
        },
      }),
    },
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
