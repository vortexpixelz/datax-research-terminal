import { prisma } from "@/lib/prisma"
import { PortfolioPosition, WatchlistItem } from "@/lib/types"
import { Decimal } from "@prisma/client/runtime/library"

export class PortfolioService {
  // Portfolio Positions
  static async addPosition(
    userId: number,
    symbol: string,
    assetType: "stock" | "crypto",
    quantity: number | string,
    avgCost: number | string
  ): Promise<PortfolioPosition> {
    return prisma.portfolioPosition.create({
      data: {
        userId,
        symbol,
        assetType,
        quantity: new Decimal(quantity.toString()),
        avgCost: new Decimal(avgCost.toString()),
      },
    }) as Promise<PortfolioPosition>
  }

  static async updatePosition(
    positionId: number,
    userId: number,
    data: {
      quantity?: number | string
      avgCost?: number | string
    }
  ): Promise<PortfolioPosition> {
    const updateData: any = {}
    if (data.quantity !== undefined) {
      updateData.quantity = new Decimal(data.quantity.toString())
    }
    if (data.avgCost !== undefined) {
      updateData.avgCost = new Decimal(data.avgCost.toString())
    }

    return prisma.portfolioPosition.update({
      where: { id: positionId },
      data: updateData,
    }) as Promise<PortfolioPosition>
  }

  static async deletePosition(positionId: number, userId: number): Promise<void> {
    await prisma.portfolioPosition.delete({
      where: { id: positionId },
    })
  }

  static async getPositions(userId: number): Promise<PortfolioPosition[]> {
    return prisma.portfolioPosition.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }) as Promise<PortfolioPosition[]>
  }

  static async getPosition(
    userId: number,
    symbol: string
  ): Promise<PortfolioPosition | null> {
    return prisma.portfolioPosition.findFirst({
      where: { userId, symbol },
    }) as Promise<PortfolioPosition | null>
  }

  // Watchlist Items
  static async addWatchlistItem(
    userId: number,
    symbol: string,
    assetType: "stock" | "crypto"
  ): Promise<WatchlistItem> {
    return prisma.watchlistItem.create({
      data: {
        userId,
        symbol,
        assetType,
      },
    }) as Promise<WatchlistItem>
  }

  static async removeWatchlistItem(itemId: number, userId: number): Promise<void> {
    await prisma.watchlistItem.delete({
      where: { id: itemId },
    })
  }

  static async getWatchlist(userId: number): Promise<WatchlistItem[]> {
    return prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }) as Promise<WatchlistItem[]>
  }

  static async getWatchlistItem(
    userId: number,
    symbol: string
  ): Promise<WatchlistItem | null> {
    return prisma.watchlistItem.findFirst({
      where: { userId, symbol },
    }) as Promise<WatchlistItem | null>
  }
}
