import type { Metadata } from "next"

import ChatPage from "@/components/pages/chat-page"
import { createPageMetadata } from "@/lib/metadata"

export const generateMetadata = (): Metadata =>
  createPageMetadata({
    title: "AI Market Research Chat | Datax Terminal",
    description:
      "Converse with an AI analyst, surface live market events, and research equities faster inside the Datax Terminal.",
    path: "/",
    keywords: [
      "ai market research",
      "investment research assistant",
      "stock market chat",
      "market intelligence platform",
    ],
  })

export default function Page() {
  return <ChatPage />
}
