import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { ChatService } from "@/lib/db/services/chat.service"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")

    const messages = await ChatService.getConversationHistory(
      parseInt(session.user.id),
      limit
    )

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ChatService.clearHistory(parseInt(session.user.id))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
