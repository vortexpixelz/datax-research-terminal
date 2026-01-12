import type { NextRequest } from "next/server"

jest.mock("@/lib/api/polygon", () => ({
  getStockDetails: jest.fn(),
}))

import { GET } from "../details/route"
import { getStockDetails } from "@/lib/api/polygon"

const createRequest = (url: string) => ({
  nextUrl: new URL(url),
} as unknown as NextRequest)

const mockedGetStockDetails = getStockDetails as jest.MockedFunction<typeof getStockDetails>

describe("GET /api/market/details", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    jest.clearAllMocks()
  })

  it("returns stock details when symbol is provided", async () => {
    const mockDetails = {
      symbol: "AAPL",
      name: "Apple Inc.",
      description: "Tech company",
      marketCap: 1000,
      sector: "Tech",
      industry: "Hardware",
      employees: 100,
      ceo: "Tim Cook",
      website: "https://apple.com",
    }
    mockedGetStockDetails.mockResolvedValueOnce(mockDetails)

    const request = createRequest("http://localhost/api/market/details?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockDetails)
    expect(mockedGetStockDetails).toHaveBeenCalledWith("AAPL")
  })

  it("returns 400 when symbol is missing", async () => {
    const request = createRequest("http://localhost/api/market/details")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: "Symbol parameter is required" })
    expect(mockedGetStockDetails).not.toHaveBeenCalled()
  })

  it("returns 404 when no details are found", async () => {
    mockedGetStockDetails.mockResolvedValueOnce(null)

    const request = createRequest("http://localhost/api/market/details?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({ error: "Stock details not found" })
  })

  it("returns 500 when polygon client throws", async () => {
    mockedGetStockDetails.mockRejectedValueOnce(new Error("Polygon down"))

    const request = createRequest("http://localhost/api/market/details?symbol=AAPL")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: "Failed to fetch stock details" })
  })
})
