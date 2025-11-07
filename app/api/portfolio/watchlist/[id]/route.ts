import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/db/services/portfolio.service"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await PortfolioService.removeWatchlistItem(
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
