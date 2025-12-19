import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AnchorHTMLAttributes, PropsWithChildren } from "react"
import PortfolioPage from "@/app/portfolio/page"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/components/allocation-chart", () => ({
  AllocationChart: () => <div data-testid="allocation-chart" />,
}))

describe("PortfolioPage", () => {
  it("allows adding and removing a holding", async () => {
    const user = userEvent.setup()

    render(<PortfolioPage />)

    const openDialogButton = screen.getByRole("button", { name: /add holding/i })
    await user.click(openDialogButton)

    const dialog = await screen.findByRole("dialog", { name: /add holding/i })

    await user.type(within(dialog).getByPlaceholderText("AAPL"), "goog")
    await user.type(within(dialog).getByPlaceholderText("Apple Inc"), "Google Inc")
    await user.type(within(dialog).getByPlaceholderText("100"), "5")
    await user.type(within(dialog).getByPlaceholderText("150.00"), "120")
    await user.type(within(dialog).getByPlaceholderText("175.00"), "135")
    await user.type(within(dialog).getByPlaceholderText("Technology"), "Communication Services")

    await user.click(within(dialog).getByRole("button", { name: /add holding/i }))

    const newTickerCell = await screen.findByText("GOOG")
    const newRow = newTickerCell.closest("tr")

    expect(newRow).not.toBeNull()

    if (!newRow) {
      throw new Error("New holding row should exist")
    }

    const removeButton = within(newRow).getByRole("button")
    await user.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText("GOOG")).not.toBeInTheDocument()
    })
  })
})
