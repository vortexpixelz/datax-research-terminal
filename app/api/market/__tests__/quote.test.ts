import type { NextRequest } from "next/server"

jest.mock("@/lib/api/polygon", () => ({
  getQuote: jest.fn(),
}))

import { GET } from "../quote/route"
import { getQuote } from "@/lib/api/polygon"

const createRequest = (url: string) => ({
  nextUrl: new URL(url),
} as unknown as NextRequest)

const mockedGetQuote = getQuote as jest.MockedFunction<typeof getQuote>

describe("GET /api/market/quote", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    jest.clearAllMocks()
  })

  it("returns quote data when symbol is provided", async () => {
    const mockQuote = {
      symbol: "AAPL",
      price: 150,
      change: 1,
      changePercent: 0.5,
      volume: 1000,
      high: 155,
      low: 145,
      open: 149,
      previousClose: 149,
      timestamp: 123456,
    }
    mockedGetQuote.mockResolvedValueOnce(mockQuote)

    const request = createRequest("http://localhost/api/market/quote?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockQuote)
    expect(mockedGetQuote).toHaveBeenCalledWith("AAPL")
  })

  it("returns 400 when symbol is missing", async () => {
    const request = createRequest("http://localhost/api/market/quote")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: "Symbol parameter is required" })
    expect(mockedGetQuote).not.toHaveBeenCalled()
  })

  it("returns 404 when quote is not found", async () => {
    mockedGetQuote.mockResolvedValueOnce(null)

    const request = createRequest("http://localhost/api/market/quote?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({ error: "Quote not found" })
  })

  it("returns 500 when polygon client throws", async () => {
    mockedGetQuote.mockRejectedValueOnce(new Error("Polygon down"))

    const request = createRequest("http://localhost/api/market/quote?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: "Failed to fetch quote" })
  })
})
