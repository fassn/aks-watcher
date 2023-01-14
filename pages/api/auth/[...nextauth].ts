import NextAuth, { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h),
    }),
  ],
  callbacks: {
    async session ({ session, user }) {
      session.user.id = user.id;
      return Promise.resolve(session);
    }
  },
  pages: {
    // signIn: '/login',
    // error: '/login', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
}
}

export default NextAuth(authOptions)