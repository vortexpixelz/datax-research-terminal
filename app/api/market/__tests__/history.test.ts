import type { NextRequest } from "next/server"

jest.mock("@/lib/api/polygon", () => ({
  getHistoricalData: jest.fn(),
}))

import { GET } from "../history/route"
import { getHistoricalData } from "@/lib/api/polygon"

const createRequest = (url: string) => ({
  nextUrl: new URL(url),
} as unknown as NextRequest)

const mockedGetHistoricalData = getHistoricalData as jest.MockedFunction<typeof getHistoricalData>

describe("GET /api/market/history", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    jest.clearAllMocks()
  })

  it("returns historical data when parameters are provided", async () => {
    const mockHistory = [
      { timestamp: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 1000 },
    ]
    mockedGetHistoricalData.mockResolvedValueOnce(mockHistory)

    const request = createRequest(
      "http://localhost/api/market/history?symbol=AAPL&from=2024-01-01&to=2024-01-31&timespan=week",
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockHistory)
    expect(mockedGetHistoricalData).toHaveBeenCalledWith("AAPL", "2024-01-01", "2024-01-31", "week")
  })

  it("returns 400 when required parameters are missing", async () => {
    const request = createRequest("http://localhost/api/market/history?symbol=AAPL&from=2024-01-01")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: "Symbol, from, and to parameters are required" })
    expect(mockedGetHistoricalData).not.toHaveBeenCalled()
  })

  it("returns 500 when polygon client throws", async () => {
    mockedGetHistoricalData.mockRejectedValueOnce(new Error("Polygon down"))

    const request = createRequest(
      "http://localhost/api/market/history?symbol=AAPL&from=2024-01-01&to=2024-01-31",
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: "Failed to fetch historical data" })
  })
})
