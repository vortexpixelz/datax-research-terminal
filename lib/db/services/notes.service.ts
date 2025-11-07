import { prisma } from "@/lib/prisma"
import { Note } from "@/lib/types"

export class NotesService {
  static async createNote(
    userId: number,
    title: string,
    content: string = "",
    tags: string[] = []
  ): Promise<Note> {
    return prisma.note.create({
      data: {
        userId,
        title,
        content,
        tags,
      },
    }) as Promise<Note>
  }

  static async updateNote(
    noteId: number,
    userId: number,
    data: { title?: string; content?: string; tags?: string[] }
  ): Promise<Note> {
    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...data,
      },
    }) as Promise<Note>
  }

  static async deleteNote(noteId: number, userId: number): Promise<void> {
    await prisma.note.delete({
      where: { id: noteId },
    })
  }

  static async getNoteById(noteId: number, userId: number): Promise<Note | null> {
    return prisma.note.findFirst({
      where: { id: noteId, userId },
    }) as Promise<Note | null>
  }

  static async getUserNotes(userId: number): Promise<Note[]> {
    return prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }) as Promise<Note[]>
  }

  static async searchNotes(
    userId: number,
    query: string
  ): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    }) as Promise<Note[]>
  }

  static async getNotesByTag(userId: number, tag: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        userId,
        tags: { has: tag },
      },
      orderBy: { updatedAt: "desc" },
    }) as Promise<Note[]>
  }

  static async addNoteLink(
    sourceNoteId: number,
    targetTitle: string,
    targetNoteId?: number
  ): Promise<void> {
    await prisma.noteLink.create({
      data: {
        sourceNoteId,
        targetNoteId,
        targetTitle,
      },
    })
  }

  static async getBacklinks(noteId: number): Promise<any[]> {
    return prisma.noteLink.findMany({
      where: {
        OR: [
          { targetNoteId: noteId },
          { targetTitle: (await prisma.note.findUnique({
            where: { id: noteId },
            select: { title: true },
          }))?.title },
        ],
      },
      include: {
        sourceNote: true,
      },
    })
  }

  static async getForwardLinks(noteId: number): Promise<any[]> {
    return prisma.noteLink.findMany({
      where: { sourceNoteId: noteId },
      include: {
        targetNote: true,
      },
    })
  }
}
