"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AddWatchlistDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: { ticker: string; name: string }) => void
}

export function AddWatchlistDialog({ open, onOpenChange, onAdd }: AddWatchlistDialogProps) {
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ticker: formData.ticker.toUpperCase(),
      name: formData.name,
    })
    setFormData({ ticker: "", name: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Ticker</Label>
            <Input
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              placeholder="NVDA"
              required
            />
          </div>
          <div>
            <Label>Company Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="NVIDIA Corp"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to Watchlist</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
