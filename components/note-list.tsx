"use client"

import { FileText, Calendar } from "lucide-react"
import type { Note } from "@/app/notes/page"

type NoteListProps = {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
}

export function NoteList({ notes, selectedNoteId, onSelectNote }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
        <p className="text-sm">No notes found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`w-full text-left p-4 border-b hover:bg-muted transition-colors ${
            selectedNoteId === note.id ? "bg-muted" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content.substring(0, 100)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{note.updatedAt.toLocaleDateString()}</span>
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
