import type { NextRequest } from "next/server"
import { GET as quoteHandler } from "../quote/route"
import { GET as detailsHandler } from "../details/route"
import { GET as historyHandler } from "../history/route"
import { getQuote, getStockDetails, getHistoricalData } from "@/lib/api/polygon"

type PolygonModule = typeof import("@/lib/api/polygon")

jest.mock("@/lib/api/polygon", () => ({
  getQuote: jest.fn(),
  getStockDetails: jest.fn(),
  getHistoricalData: jest.fn(),
}))

describe("Market API routes", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/market/quote", () => {
    const createRequest = (params: Record<string, string | undefined>): NextRequest =>
      ({
        nextUrl: {
          searchParams: new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
          ),
        },
      }) as unknown as NextRequest

    it("returns 400 when symbol is missing", async () => {
      const response = await quoteHandler(createRequest({}))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({ error: "Symbol parameter is required" })
    })

    it("returns the quote payload when available", async () => {
      const mockQuote = {
        symbol: "AAPL",
        price: 100,
        change: 1,
        changePercent: 1,
        volume: 1000,
        high: 101,
        low: 99,
        open: 99,
        previousClose: 98,
        timestamp: 123,
      }

      ;(getQuote as jest.MockedFunction<PolygonModule["getQuote"]>).mockResolvedValue(mockQuote)

      const response = await quoteHandler(createRequest({ symbol: "aapl" }))

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual(mockQuote)
      expect(getQuote).toHaveBeenCalledWith("AAPL")
    })

    it("returns 404 when the quote is not found", async () => {
      ;(getQuote as jest.MockedFunction<PolygonModule["getQuote"]>).mockResolvedValue(null)

      const response = await quoteHandler(createRequest({ symbol: "AAPL" }))

      expect(response.status).toBe(404)
      await expect(response.json()).resolves.toEqual({ error: "Quote not found" })
    })

    it("returns 500 when the quote request fails", async () => {
      ;(getQuote as jest.MockedFunction<PolygonModule["getQuote"]>).mockRejectedValue(new Error("fail"))

      const response = await quoteHandler(createRequest({ symbol: "AAPL" }))

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({ error: "Failed to fetch quote" })
    })
  })

  describe("GET /api/market/details", () => {
    const createRequest = (params: Record<string, string | undefined>): NextRequest =>
      ({
        nextUrl: {
          searchParams: new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
          ),
        },
      }) as unknown as NextRequest

    it("returns 400 when symbol is missing", async () => {
      const response = await detailsHandler(createRequest({}))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({ error: "Symbol parameter is required" })
    })

    it("returns the stock details payload when available", async () => {
      const mockDetails = {
        symbol: "AAPL",
        name: "Apple Inc.",
        description: "Tech company",
        marketCap: 100,
        sector: "Technology",
        industry: "Software",
        employees: 10,
        ceo: "CEO",
        website: "https://apple.com",
      }

      ;(getStockDetails as jest.MockedFunction<PolygonModule["getStockDetails"]>).mockResolvedValue(mockDetails)

      const response = await detailsHandler(createRequest({ symbol: "AAPL" }))

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual(mockDetails)
    })

    it("returns 404 when stock details are not found", async () => {
      ;(getStockDetails as jest.MockedFunction<PolygonModule["getStockDetails"]>).mockResolvedValue(null)

      const response = await detailsHandler(createRequest({ symbol: "AAPL" }))

      expect(response.status).toBe(404)
      await expect(response.json()).resolves.toEqual({ error: "Stock details not found" })
    })

    it("returns 500 when the stock details request fails", async () => {
      ;(getStockDetails as jest.MockedFunction<PolygonModule["getStockDetails"]>).mockRejectedValue(
        new Error("fail"),
      )

      const response = await detailsHandler(createRequest({ symbol: "AAPL" }))

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({ error: "Failed to fetch stock details" })
    })
  })

  describe("GET /api/market/history", () => {
    const createRequest = (params: Record<string, string | undefined>): NextRequest =>
      ({
        nextUrl: {
          searchParams: new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
          ),
        },
      }) as unknown as NextRequest

    it("returns 400 when required parameters are missing", async () => {
      const response = await historyHandler(createRequest({ symbol: "AAPL", from: "2024-01-01" }))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: "Symbol, from, and to parameters are required",
      })
    })

    it("returns historical data when available", async () => {
      const mockHistory = [
        {
          timestamp: 1,
          open: 1,
          high: 2,
          low: 0,
          close: 1.5,
          volume: 100,
        },
      ]

      ;(getHistoricalData as jest.MockedFunction<PolygonModule["getHistoricalData"]>).mockResolvedValue(mockHistory)

      const response = await historyHandler(
        createRequest({ symbol: "AAPL", from: "2024-01-01", to: "2024-01-31", timespan: "week" }),
      )

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual(mockHistory)
      expect(getHistoricalData).toHaveBeenCalledWith("AAPL", "2024-01-01", "2024-01-31", "week")
    })

    it("returns 500 when the historical data request fails", async () => {
      ;(getHistoricalData as jest.MockedFunction<PolygonModule["getHistoricalData"]>).mockRejectedValue(
        new Error("fail"),
      )

      const response = await historyHandler(
        createRequest({ symbol: "AAPL", from: "2024-01-01", to: "2024-01-31" }),
      )

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({ error: "Failed to fetch historical data" })
    })
  })
})
