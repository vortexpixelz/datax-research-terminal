"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export const LOCALE_STORAGE_KEY = "datax_user_locale"
const FALLBACK_LOCALE = "en-US"

const DEFAULT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
}

const DEFAULT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

type LocaleContextValue = {
  locale: string
  localeOverride: string | null
  setLocaleOverride: (locale: string | null) => void
  formatDateTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [browserLocale, setBrowserLocale] = useState(FALLBACK_LOCALE)
  const [localeOverride, setLocaleOverrideState] = useState<string | null>(null)

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      setBrowserLocale(navigator.language)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (storedLocale) {
      setLocaleOverrideState(storedLocale)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY) {
        setLocaleOverrideState(event.newValue)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const locale = localeOverride && localeOverride.trim() ? localeOverride : browserLocale

  const setLocaleOverride = useCallback((value: string | null) => {
    const normalized = value && value.trim() ? value.trim() : null
    setLocaleOverrideState(normalized)

    if (typeof window === "undefined") {
      return
    }

    if (normalized) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    } else {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY)
    }
  }, [])

  const formatDateTime = useCallback(
    (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const date = value instanceof Date ? value : new Date(value)
      if (Number.isNaN(date.getTime())) {
        return ""
      }

      const formatOptions = options ?? DEFAULT_DATE_TIME_OPTIONS
      return new Intl.DateTimeFormat(locale, formatOptions).format(date)
    },
    [locale],
  )

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      const formatOptions = options ?? DEFAULT_NUMBER_OPTIONS
      return new Intl.NumberFormat(locale, formatOptions).format(value)
    },
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      localeOverride,
      setLocaleOverride,
      formatDateTime,
      formatNumber,
    }),
    [locale, localeOverride, setLocaleOverride, formatDateTime, formatNumber],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocaleFormatter() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error("useLocaleFormatter must be used within a LocaleProvider")
  }

  return context
}
