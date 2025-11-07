"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Holding } from "@/app/portfolio/page"

type AddHoldingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (holding: Omit<Holding, "id">) => void
}

export function AddHoldingDialog({ open, onOpenChange, onAdd }: AddHoldingDialogProps) {
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    shares: "",
    avgCost: "",
    currentPrice: "",
    sector: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ticker: formData.ticker.toUpperCase(),
      name: formData.name,
      shares: Number.parseFloat(formData.shares),
      avgCost: Number.parseFloat(formData.avgCost),
      currentPrice: Number.parseFloat(formData.currentPrice),
      sector: formData.sector,
    })
    setFormData({ ticker: "", name: "", shares: "", avgCost: "", currentPrice: "", sector: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Ticker</Label>
            <Input
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              placeholder="AAPL"
              required
            />
          </div>
          <div>
            <Label>Company Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Apple Inc"
              required
            />
          </div>
          <div>
            <Label>Shares</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              placeholder="100"
              required
            />
          </div>
          <div>
            <Label>Average Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.avgCost}
              onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
              placeholder="150.00"
              required
            />
          </div>
          <div>
            <Label>Current Price</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              placeholder="175.00"
              required
            />
          </div>
          <div>
            <Label>Sector</Label>
            <Input
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="Technology"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Holding</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
