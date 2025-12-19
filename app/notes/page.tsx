import type { Metadata } from "next"

import NotesPageClient from "@/components/pages/notes-page"
import { createPageMetadata } from "@/lib/metadata"

export type { Note } from "@/components/pages/notes-page"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "Research Notes Workspace | Datax Terminal",
    description:
      "Capture investment theses, link ideas together, and visualize relationships between notes in the Datax workspace.",
    path: "/notes",
    keywords: [
      "investment notes",
      "research knowledge base",
      "market analysis notes",
      "linked note taking",
    ],
  })

export default function NotesPage() {
  return <NotesPageClient />
}
