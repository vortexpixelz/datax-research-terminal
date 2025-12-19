import { render, screen, waitFor } from "@testing-library/react"
import { axe } from "jest-axe"
import NotesPage from "@/app/notes/page"

describe("/notes page accessibility", () => {
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<NotesPage />)

    await waitFor(() => expect(screen.getByRole("heading", { name: /notes/i })).toBeInTheDocument())

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
