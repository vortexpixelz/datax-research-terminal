"use client"

import { useEffect, useRef } from "react"
import type { Note } from "@/app/notes/page"

type GraphViewProps = {
  notes: Note[]
  onSelectNote: (id: string) => void
}

export function GraphView({ notes, onSelectNote }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.fillStyle = "hsl(var(--background))"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const links: Array<{ source: string; target: string }> = []
    notes.forEach((note) => {
      const wikiLinkRegex = /\[\[(.*?)\]\]/g
      let match
      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const targetNote = notes.find((n) => n.title === match[1])
        if (targetNote) {
          links.push({ source: note.id, target: targetNote.id })
        }
      }
    })

    const nodePositions = new Map<string, { x: number; y: number }>()
    notes.forEach((note, i) => {
      const angle = (i / notes.length) * 2 * Math.PI
      const radius = Math.min(canvas.width, canvas.height) * 0.3
      const x = canvas.width / 2 + Math.cos(angle) * radius
      const y = canvas.height / 2 + Math.sin(angle) * radius
      nodePositions.set(note.id, { x, y })
    })

    ctx.strokeStyle = "hsl(var(--muted-foreground))"
    ctx.lineWidth = 1
    links.forEach((link) => {
      const source = nodePositions.get(link.source)
      const target = nodePositions.get(link.target)
      if (source && target) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }
    })

    ctx.fillStyle = "hsl(var(--primary))"
    ctx.strokeStyle = "hsl(var(--background))"
    ctx.lineWidth = 2
    notes.forEach((note) => {
      const pos = nodePositions.get(note.id)
      if (pos) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "hsl(var(--foreground))"
        ctx.font = "12px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(note.title, pos.x, pos.y + 20)
        ctx.fillStyle = "hsl(var(--primary))"
      }
    })
  }, [notes])

  return (
    <div className="flex-1 relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      <div className="absolute top-4 left-4 bg-background border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Knowledge Graph</h3>
        <p className="text-sm text-muted-foreground">{notes.length} notes with bidirectional links</p>
      </div>
    </div>
  )
}
