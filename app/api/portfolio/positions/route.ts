import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/db/services/portfolio.service"
import { z } from "zod"

const createPositionSchema = z.object({
  symbol: z.string().min(1),
  assetType: z.enum(["stock", "crypto"]),
  quantity: z.coerce.number().positive(),
  avgCost: z.coerce.number().positive(),
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const positions = await PortfolioService.getPositions(
      parseInt(session.user.id)
    )
    return NextResponse.json(positions)
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
    const body = createPositionSchema.parse(json)

    const position = await PortfolioService.addPosition(
      parseInt(session.user.id),
      body.symbol,
      body.assetType,
      body.quantity,
      body.avgCost
    )

    return NextResponse.json(position, { status: 201 })
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
