import type { Metadata } from "next"

import MarketsPageClient from "@/components/pages/markets-page"
import { createPageMetadata } from "@/lib/metadata"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "Live Markets Dashboard | Datax Terminal",
    description:
      "Track indices, price action, top movers, and Kalshi prediction markets with real-time updates inside Datax.",
    path: "/markets",
    keywords: [
      "market dashboard",
      "real-time market data",
      "stock market overview",
      "prediction markets",
    ],
  })

export default function MarketsPage() {
  return <MarketsPageClient />
}
