import { useMemo, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import type { Note } from "@/app/notes/page"
import { NoteEditor } from "@/components/note-editor"

const initialNotes: Note[] = [
  {
    id: "1",
    title: "AAPL Analysis",
    content:
      "Apple Inc. shows strong fundamentals. Link to [[Market Overview]].\n\nP/E Ratio: 28.5\nMarket Cap: $2.8T",
    createdAt: new Date("2024-01-15T12:00:00Z"),
    updatedAt: new Date("2024-01-16T08:30:00Z"),
    tags: ["tech", "analysis"],
  },
  {
    id: "2",
    title: "Market Overview",
    content: "Current market conditions favor [[AAPL Analysis]] and tech sector.\n\nS&P 500: 4,800\nNASDAQ: 15,000",
    createdAt: new Date("2024-01-14T12:00:00Z"),
    updatedAt: new Date("2024-01-15T14:45:00Z"),
    tags: ["markets"],
  },
]

const meta: Meta<typeof NoteEditor> = {
  title: "Components/NoteEditor",
  component: NoteEditor,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj<typeof NoteEditor>

export const Default: Story = {
  render: () => {
    const [notes, setNotes] = useState(initialNotes)
    const [selectedId, setSelectedId] = useState(initialNotes[0].id)

    const selectedNote = useMemo(() => notes.find((note) => note.id === selectedId) ?? notes[0], [
      notes,
      selectedId,
    ])

    const handleUpdate = (id: string, updates: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note)),
      )
    }

    const handleDelete = (id: string) => {
      setNotes((prev) => {
        const updated = prev.filter((note) => note.id !== id)
        setSelectedId((prevId) => {
          if (prevId !== id) return prevId
          return updated[0]?.id ?? ""
        })
        return updated
      })
    }

    if (!selectedNote) {
      return (
        <div className="min-h-screen bg-background text-foreground grid place-items-center text-sm text-muted-foreground">
          All notes have been deleted.
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background text-foreground">
        <NoteEditor
          note={selectedNote}
          notes={notes}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onNavigate={setSelectedId}
        />
      </div>
    )
  },
}
