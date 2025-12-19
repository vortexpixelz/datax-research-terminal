import { render, screen, waitFor } from "@testing-library/react"
import { axe } from "jest-axe"
import Home from "@/app/page"
import MarketsPage from "@/app/markets/page"

jest.mock("@/hooks/use-ticker-search", () => ({
  useTickerSearch: () => ({ results: [], loading: false }),
}))

jest.mock("@/lib/api/kalshi", () => ({
  getKalshiMarkets: async () => [
    {
      ticker: "TEST-1",
      title: "Test market",
      category: "Economics",
      yes_price: 0.6,
      no_price: 0.4,
      volume: 1000,
      open_interest: 500,
      close_date: new Date().toISOString(),
      status: "active" as const,
    },
  ],
  formatProbability: (value: number) => `${(value * 100).toFixed(1)}%`,
  formatVolume: (value: number) => value.toString(),
}))

describe("/ page accessibility", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      }) as unknown as Promise<Response>,
    )
  })

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<Home />)

    await waitFor(() => expect(screen.getByRole("textbox", { name: /message/i })).toBeInTheDocument())

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("renders markets page without accessibility violations", async () => {
    const { container } = render(<MarketsPage />)

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /market overview/i })).toBeInTheDocument(),
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
