"use client"

import { useState, useMemo } from "react"
import { Plus, Search, FileText, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { NoteEditor } from "@/components/note-editor"
import { NoteList } from "@/components/note-list"
import { GraphView } from "@/components/graph-view"

export type Note = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "AAPL Analysis",
      content:
        "Apple Inc. shows strong fundamentals. Link to [[Market Overview]].\n\nP/E Ratio: 28.5\nMarket Cap: $2.8T",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      tags: ["tech", "analysis"],
    },
    {
      id: "2",
      title: "Market Overview",
      content: "Current market conditions favor [[AAPL Analysis]] and tech sector.\n\nS&P 500: 4,800\nNASDAQ: 15,000",
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-14"),
      tags: ["markets"],
    },
  ])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"editor" | "graph">("editor")

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }, [notes, searchQuery])

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note)))
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    if (selectedNoteId === id) {
      setSelectedNoteId(notes[0]?.id || null)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Notes List */}
      <aside className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Notes</h2>
            <Button size="sm" onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <NoteList notes={filteredNotes} selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "editor" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("editor")}
            >
              <FileText className="h-4 w-4 mr-1" />
              Editor
            </Button>
            <Button variant={viewMode === "graph" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("graph")}>
              <Network className="h-4 w-4 mr-1" />
              Graph
            </Button>
          </div>
        </div>

        {viewMode === "editor" ? (
          selectedNote ? (
            <NoteEditor
              note={selectedNote}
              notes={notes}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onNavigate={setSelectedNoteId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No note selected</p>
                <Button className="mt-4" onClick={handleCreateNote}>
                  Create your first note
                </Button>
              </div>
            </div>
          )
        ) : (
          <GraphView notes={notes} onSelectNote={setSelectedNoteId} />
        )}
      </div>

      {/* Right Sidebar Navigation */}
      <aside className="w-64 border-l bg-background p-6 flex flex-col gap-6">
        <div className="font-bold text-lg">Datax Market Research</div>

        <nav className="flex flex-col gap-2">
          <Link href="/" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            AI Chat
          </Link>
          <Link href="/notes" className="px-3 py-2 text-sm font-medium rounded bg-muted">
            Notes
          </Link>
          <Link href="/portfolio" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Portfolio
          </Link>
          <Link href="/screener" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Screener
          </Link>
          <Link href="/markets" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Markets
          </Link>
        </nav>

        <div className="mt-auto space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Sign In
          </Button>
          <Button className="w-full">Get Started</Button>
        </div>
      </aside>
    </div>
  )
}
