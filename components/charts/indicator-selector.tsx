"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export interface SelectedIndicators {
  sma20: boolean
  sma50: boolean
  sma200: boolean
  ema12: boolean
  ema26: boolean
  rsi14: boolean
  macd: boolean
  bollingerBands: boolean
  atr14: boolean
}

interface IndicatorSelectorProps {
  selected: SelectedIndicators
  onToggle: (indicator: keyof SelectedIndicators) => void
}

export function IndicatorSelector({
  selected,
  onToggle,
}: IndicatorSelectorProps) {
  const [open, setOpen] = useState(false)

  const indicators = [
    { key: "sma20" as const, label: "SMA 20", category: "Moving Averages" },
    { key: "sma50" as const, label: "SMA 50", category: "Moving Averages" },
    { key: "sma200" as const, label: "SMA 200", category: "Moving Averages" },
    { key: "ema12" as const, label: "EMA 12", category: "Moving Averages" },
    { key: "ema26" as const, label: "EMA 26", category: "Moving Averages" },
    { key: "rsi14" as const, label: "RSI 14", category: "Oscillators" },
    { key: "macd" as const, label: "MACD", category: "Oscillators" },
    {
      key: "bollingerBands" as const,
      label: "Bollinger Bands",
      category: "Volatility",
    },
    { key: "atr14" as const, label: "ATR 14", category: "Volatility" },
  ]

  const categories = ["Moving Averages", "Oscillators", "Volatility"]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          Indicators
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="space-y-3 p-3">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                {category}
              </p>
              {indicators
                .filter((ind) => ind.category === category)
                .map((indicator) => (
                  <div key={indicator.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={indicator.key}
                      checked={selected[indicator.key]}
                      onCheckedChange={() => onToggle(indicator.key)}
                    />
                    <Label
                      htmlFor={indicator.key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {indicator.label}
                    </Label>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
