export const APP_NAME = "Datax Market Research Terminal"

export const APP_DESCRIPTION =
  "AI-assisted investment research platform with real-time market intelligence, portfolio tracking, and collaborative notes."

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

const normalizedAppUrl = rawAppUrl?.replace(/\/$/, "")

export const APP_URL = normalizedAppUrl && normalizedAppUrl.length > 0 ? normalizedAppUrl : "http://localhost:3000"
