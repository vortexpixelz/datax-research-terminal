"use client"

import { useState, useEffect } from "react"
import { Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/app/notes/page"

type NoteEditorProps = {
  note: Note
  notes: Note[]
  onUpdate: (id: string, updates: Partial<Note>) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
}

export function NoteEditor({ note, notes, onUpdate, onDelete, onNavigate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id, note.title, note.content])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onUpdate(note.id, { title: newTitle })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onUpdate(note.id, { content: newContent })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !note.tags.includes(tagInput.trim())) {
      onUpdate(note.id, { tags: [...note.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) })
  }

  const renderContentWithLinks = (text: string) => {
    const wikiLinkRegex = /\[\[(.*?)\]\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = wikiLinkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      const linkedTitle = match[1]
      const linkedNote = notes.find((n) => n.title === linkedTitle)

      parts.push(
        <button
          key={match.index}
          onClick={() => linkedNote && onNavigate(linkedNote.id)}
          className="text-primary underline hover:text-primary/80 cursor-pointer"
          type="button"
          aria-label={linkedNote ? `Open linked note ${linkedTitle}` : `Linked note ${linkedTitle} not found`}
        >
          {linkedTitle}
        </button>,
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-semibold border-0 px-0 focus-visible:ring-0"
            placeholder="Note title..."
            aria-label="Note title"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this note?")) {
                onDelete(note.id)
              }
            }}
            type="button"
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Delete note</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleRemoveTag(tag)}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
                type="button"
                aria-label={`Remove tag ${tag}`}
              >
                {tag} ×
              </button>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddTag()
              }}
              className="flex items-center"
            >
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="h-6 text-xs w-24"
                aria-label="Add a tag"
              />
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Editor</h3>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Write your note... Use [[Note Title]] to link to other notes."
              aria-label="Note content"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use [[Note Title]] syntax to create bidirectional links
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="border rounded-md p-4 min-h-[500px] prose prose-sm max-w-none">
              {content.split("\n").map((line, i) => (
                <p key={i} className="mb-2 whitespace-pre-wrap">
                  {renderContentWithLinks(line)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Last updated: {note.updatedAt.toLocaleString()}</div>
      </div>
    </div>
  )
}
