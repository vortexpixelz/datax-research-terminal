import { render, screen, waitFor } from "@testing-library/react"
import { axe } from "jest-axe"
import PortfolioPage from "@/app/portfolio/page"

describe("/portfolio page accessibility", () => {
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<PortfolioPage />)

    await waitFor(() => expect(screen.getByRole("heading", { name: /portfolio/i })).toBeInTheDocument())

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
