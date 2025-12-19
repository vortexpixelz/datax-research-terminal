import { render, screen, waitFor } from "@testing-library/react"
import { axe } from "jest-axe"
import ScreenerPage from "@/app/screener/page"

describe("/screener page accessibility", () => {
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ScreenerPage />)

    await waitFor(() => expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument())

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
