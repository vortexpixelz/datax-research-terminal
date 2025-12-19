import React from "react"
import "@testing-library/jest-dom"
import { toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

;(globalThis as any).confirm = jest.fn(() => true)

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn(),
    setLineDash: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    clip: jest.fn(),
    rect: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    putImageData: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    createPattern: jest.fn(),
    createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  }))
}

if (!HTMLCanvasElement.prototype.toDataURL) {
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => "")
}

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // @ts-expect-error - assign mock implementation
  window.ResizeObserver = ResizeObserver
  // @ts-expect-error - assign mock implementation
  global.ResizeObserver = ResizeObserver
}

jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: React.forwardRef(function Link(
      props: React.AnchorHTMLAttributes<HTMLAnchorElement>,
      ref: React.ForwardedRef<HTMLAnchorElement>,
    ) {
      const { children, ...rest } = props
      return React.createElement("a", { ...rest, ref }, children)
    }),
  }
})

jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    sendMessage: jest.fn(),
    status: "idle",
  }),
}))

jest.mock("ai", () => ({
  DefaultChatTransport: class {
    constructor() {}
  },
}))
