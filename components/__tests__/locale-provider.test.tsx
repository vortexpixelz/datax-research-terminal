import React from "react"
import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest"
import { LocaleProvider, useLocaleFormatter, LOCALE_STORAGE_KEY } from "@/components/locale-provider"

const wrapper = ({ children }: { children: React.ReactNode }) => <LocaleProvider>{children}</LocaleProvider>

const originalNavigatorLanguageDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "language")

describe("LocaleProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    if (!originalNavigatorLanguageDescriptor?.configurable) {
      return
    }
    Object.defineProperty(window.navigator, "language", {
      value: "en-US",
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    if (originalNavigatorLanguageDescriptor) {
      Object.defineProperty(window.navigator, "language", originalNavigatorLanguageDescriptor)
    }
  })

  it("formats dates using Intl.DateTimeFormat with a locale override", () => {
    const formatted = "formatted-date"
    const formatMock = vi.fn().mockReturnValue(formatted)
    const dateTimeSpy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(() => ({ format: formatMock } as unknown as Intl.DateTimeFormat))

    const { result } = renderHook(() => useLocaleFormatter(), { wrapper })

    act(() => {
      result.current.setLocaleOverride("de-DE")
    })

    const options: Intl.DateTimeFormatOptions = { dateStyle: "full" }
    const value = result.current.formatDateTime(new Date("2024-01-01"), options)

    expect(dateTimeSpy).toHaveBeenLastCalledWith("de-DE", options)
    expect(formatMock).toHaveBeenCalled()
    expect(value).toBe(formatted)
  })

  it("persists locale overrides to localStorage", () => {
    const { result } = renderHook(() => useLocaleFormatter(), { wrapper })

    act(() => {
      result.current.setLocaleOverride("ja-JP")
    })

    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ja-JP")
  })

  it("loads locale overrides from localStorage", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "fr-FR")

    const { result } = renderHook(() => useLocaleFormatter(), { wrapper })

    await waitFor(() => {
      expect(result.current.locale).toBe("fr-FR")
    })
  })
})
