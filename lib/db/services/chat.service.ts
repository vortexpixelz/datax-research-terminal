import { prisma } from "@/lib/prisma"
import { ChatMessage } from "@/lib/types"

export class ChatService {
  static async saveMessage(
    userId: number,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        userId,
        role,
        content,
      },
    }) as Promise<ChatMessage>
  }

  static async getConversationHistory(
    userId: number,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }) as Promise<ChatMessage[]>
  }

  static async clearHistory(userId: number): Promise<void> {
    await prisma.chatMessage.deleteMany({
      where: { userId },
    })
  }

  static async deleteMessage(messageId: number, userId: number): Promise<void> {
    await prisma.chatMessage.delete({
      where: { id: messageId },
    })
  }
}
