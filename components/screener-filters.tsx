"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScreenCriteria } from "@/app/screener/page"

type ScreenerFiltersProps = {
  criteria: ScreenCriteria
  onCriteriaChange: (criteria: ScreenCriteria) => void
}

export function ScreenerFilters({ criteria, onCriteriaChange }: ScreenerFiltersProps) {
  const updateCriteria = (key: keyof ScreenCriteria, value: any) => {
    onCriteriaChange({ ...criteria, [key]: value === "" ? undefined : value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Market Cap</h3>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Minimum ($B)</Label>
            <Input
              type="number"
              placeholder="0"
              value={criteria.marketCapMin ? criteria.marketCapMin / 1000000000 : ""}
              onChange={(e) =>
                updateCriteria("marketCapMin", e.target.value ? Number.parseFloat(e.target.value) * 1000000000 : "")
              }
            />
          </div>
          <div>
            <Label className="text-xs">Maximum ($B)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={criteria.marketCapMax ? criteria.marketCapMax / 1000000000 : ""}
              onChange={(e) =>
                updateCriteria("marketCapMax", e.target.value ? Number.parseFloat(e.target.value) * 1000000000 : "")
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Price</h3>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Minimum ($)</Label>
            <Input
              type="number"
              placeholder="0"
              value={criteria.priceMin ?? ""}
              onChange={(e) => updateCriteria("priceMin", e.target.value ? Number.parseFloat(e.target.value) : "")}
            />
          </div>
          <div>
            <Label className="text-xs">Maximum ($)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={criteria.priceMax ?? ""}
              onChange={(e) => updateCriteria("priceMax", e.target.value ? Number.parseFloat(e.target.value) : "")}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">P/E Ratio</h3>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Minimum</Label>
            <Input
              type="number"
              placeholder="0"
              value={criteria.peMin ?? ""}
              onChange={(e) => updateCriteria("peMin", e.target.value ? Number.parseFloat(e.target.value) : "")}
            />
          </div>
          <div>
            <Label className="text-xs">Maximum</Label>
            <Input
              type="number"
              placeholder="Any"
              value={criteria.peMax ?? ""}
              onChange={(e) => updateCriteria("peMax", e.target.value ? Number.parseFloat(e.target.value) : "")}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Sector</Label>
        <Select
          value={criteria.sector ?? "all"}
          onValueChange={(value) => updateCriteria("sector", value === "all" ? "" : value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Financials">Financials</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Consumer">Consumer</SelectItem>
            <SelectItem value="Energy">Energy</SelectItem>
            <SelectItem value="Industrials">Industrials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-medium mb-3">Volume</h3>
        <div>
          <Label className="text-xs">Minimum (M)</Label>
          <Input
            type="number"
            placeholder="0"
            value={criteria.volumeMin ? criteria.volumeMin / 1000000 : ""}
            onChange={(e) =>
              updateCriteria("volumeMin", e.target.value ? Number.parseFloat(e.target.value) * 1000000 : "")
            }
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Change % (Today)</h3>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Minimum (%)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={criteria.changePercentMin ?? ""}
              onChange={(e) =>
                updateCriteria("changePercentMin", e.target.value ? Number.parseFloat(e.target.value) : "")
              }
            />
          </div>
          <div>
            <Label className="text-xs">Maximum (%)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={criteria.changePercentMax ?? ""}
              onChange={(e) =>
                updateCriteria("changePercentMax", e.target.value ? Number.parseFloat(e.target.value) : "")
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
