import type { Metadata } from "next"

import { APP_DESCRIPTION, APP_NAME, APP_URL } from "./site-config"

export const metadataBase = new URL(APP_URL)

export type CreatePageMetadataOptions = {
  title: string
  description: string
  path?: string
  keywords?: string[]
}

const resolveCanonical = (path?: string) => {
  if (!path || path === "/") {
    return APP_URL
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${APP_URL}${normalizedPath}`
}

export const createPageMetadata = ({
  title,
  description,
  path,
  keywords,
}: CreatePageMetadataOptions): Metadata => {
  const canonicalUrl = resolveCanonical(path)

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: APP_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export const getCanonicalUrl = (path?: string) => resolveCanonical(path)

export const defaultMetadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
}
