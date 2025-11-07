import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/db/services/portfolio.service"
import { z } from "zod"

const updatePositionSchema = z.object({
  quantity: z.coerce.number().positive().optional(),
  avgCost: z.coerce.number().positive().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const body = updatePositionSchema.parse(json)

    const position = await PortfolioService.updatePosition(
      parseInt(params.id),
      parseInt(session.user.id),
      body
    )

    return NextResponse.json(position)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await PortfolioService.deletePosition(
      parseInt(params.id),
      parseInt(session.user.id)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
