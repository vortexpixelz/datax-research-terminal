import type { Metadata } from "next"

import SettingsPageClient from "@/components/pages/settings-page"
import { createPageMetadata } from "@/lib/metadata"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "API & Security Settings | Datax Terminal",
    description:
      "Securely add Groq and Polygon API credentials, toggle visibility, and review how Datax stores your keys.",
    path: "/settings",
    keywords: [
      "api settings",
      "groq api key",
      "polygon api key",
      "datax configuration",
    ],
  })

export default function SettingsPage() {
  return <SettingsPageClient />
}
