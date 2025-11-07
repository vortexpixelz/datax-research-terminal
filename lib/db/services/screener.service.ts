import { prisma } from "@/lib/prisma"
import { ScreenerCriteria } from "@/lib/types"

export interface SavedScreen {
  id: number
  userId: number
  name: string
  criteria: ScreenerCriteria
  createdAt: Date
  updatedAt: Date
}

export class ScreenerService {
  static async saveScreen(
    userId: number,
    name: string,
    criteria: ScreenerCriteria
  ): Promise<SavedScreen> {
    return prisma.savedScreen.create({
      data: {
        userId,
        name,
        criteria,
      },
    }) as Promise<SavedScreen>
  }

  static async updateScreen(
    screenId: number,
    userId: number,
    data: {
      name?: string
      criteria?: ScreenerCriteria
    }
  ): Promise<SavedScreen> {
    return prisma.savedScreen.update({
      where: { id: screenId },
      data,
    }) as Promise<SavedScreen>
  }

  static async deleteScreen(screenId: number, userId: number): Promise<void> {
    await prisma.savedScreen.delete({
      where: { id: screenId },
    })
  }

  static async getSavedScreens(userId: number): Promise<SavedScreen[]> {
    return prisma.savedScreen.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }) as Promise<SavedScreen[]>
  }

  static async getScreen(screenId: number, userId: number): Promise<SavedScreen | null> {
    return prisma.savedScreen.findFirst({
      where: { id: screenId, userId },
    }) as Promise<SavedScreen | null>
  }
}
