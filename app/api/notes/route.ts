import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { NotesService } from "@/lib/db/services/notes.service"
import { z } from "zod"

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q")

    let notes
    if (q) {
      notes = await NotesService.searchNotes(parseInt(session.user.id), q)
    } else {
      notes = await NotesService.getUserNotes(parseInt(session.user.id))
    }

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const body = createNoteSchema.parse(json)

    const note = await NotesService.createNote(
      parseInt(session.user.id),
      body.title,
      body.content,
      body.tags
    )

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
