import { auth } from "@/lib/auth/auth"

export const config = {
  matcher: ["/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)"],
}

export const middleware = auth
