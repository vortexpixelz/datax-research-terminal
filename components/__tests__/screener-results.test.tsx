import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ScreenerResults } from "../screener-results"
import type { StockResult } from "@/app/screener/page"

describe("ScreenerResults sorting", () => {
  const sampleStocks: StockResult[] = [
    {
      ticker: "MSFT",
      name: "Microsoft",
      price: 330.25,
      change: 1.2,
      changePercent: 0.36,
      marketCap: 2500000000000,
      pe: 30.5,
      volume: 35000000,
      sector: "Technology",
    },
    {
      ticker: "AAPL",
      name: "Apple",
      price: 190.1,
      change: -0.5,
      changePercent: -0.26,
      marketCap: 2700000000000,
      pe: 28.1,
      volume: 41000000,
      sector: "Technology",
    },
    {
      ticker: "GOOGL",
      name: "Alphabet",
      price: 140.75,
      change: 0.8,
      changePercent: 0.57,
      marketCap: 1800000000000,
      pe: 27.2,
      volume: 28000000,
      sector: "Communication Services",
    },
  ]

  const getRenderedTickers = () =>
    screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => {
        const firstCell = row.querySelector("td")
        if (!firstCell) {
          throw new Error("Expected row to contain at least one cell")
        }
        return firstCell.textContent ?? ""
      })

  test("renders in ascending ticker order by default", () => {
    render(<ScreenerResults stocks={sampleStocks} />)

    expect(getRenderedTickers()).toEqual(["AAPL", "GOOGL", "MSFT"])
  })

  test("toggles sorting direction when clicking the same column header", async () => {
    const user = userEvent.setup()
    render(<ScreenerResults stocks={sampleStocks} />)

    const priceButton = screen.getByRole("button", { name: /^Price/ })

    await user.click(priceButton)
    expect(getRenderedTickers()).toEqual(["GOOGL", "AAPL", "MSFT"])

    await user.click(priceButton)
    expect(getRenderedTickers()).toEqual(["MSFT", "AAPL", "GOOGL"])
  })
})
