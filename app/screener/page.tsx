import type { Metadata } from "next"

import ScreenerPageClient from "@/components/pages/screener-page"
import { createPageMetadata } from "@/lib/metadata"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "Advanced Stock Screener | Datax Terminal",
    description:
      "Build fundamental and technical filters to discover equities that match your strategy with the Datax screener.",
    path: "/screener",
    keywords: [
      "stock screener",
      "equity filters",
      "investment screening",
      "fundamental analysis tools",
    ],
  })

export default function ScreenerPage() {
  return <ScreenerPageClient />
}
