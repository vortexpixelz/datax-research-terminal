import { withAuth } from "next-auth/middleware"
import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user) {
          return null
        }

        const passwordMatch = await verifyPassword(
          parsed.data.password,
          user.password_hash
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
} satisfies NextAuthConfig

export const auth = withAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
})
