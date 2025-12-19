import type { Metadata } from "next"

import PortfolioPageClient from "@/components/pages/portfolio-page"
import { createPageMetadata } from "@/lib/metadata"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "Portfolio Tracker & Analytics | Datax Terminal",
    description:
      "Analyze performance, diversification, and watchlists with interactive charts inside the Datax portfolio tracker.",
    path: "/portfolio",
    keywords: [
      "portfolio tracker",
      "investment analytics",
      "position monitoring",
      "portfolio allocation",
    ],
  })

export default function PortfolioPage() {
  return <PortfolioPageClient />
}
