import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).trim().toLowerCase() },
        })
        if (!user) return null
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Never trust stale role/access claims in an existing JWT.
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, name: true, email: true, role: true, approved: true, blocked: true, accessExpiresAt: true, maxPlayers: true },
        })
        if (!current) return { ...session, user: undefined } as any
        session.user.id = current.id
        session.user.name = current.name
        session.user.email = current.email
        session.user.role = current.role
        session.user.approved = current.approved
        session.user.blocked = current.blocked
        session.user.maxPlayers = current.maxPlayers
        session.user.accessExpiresAt = current.accessExpiresAt?.toISOString() ?? null
        session.user.accessAllowed = current.approved && !current.blocked &&
          (!current.accessExpiresAt || current.accessExpiresAt.getTime() > Date.now())
      }
      return session
    },
  },
})
