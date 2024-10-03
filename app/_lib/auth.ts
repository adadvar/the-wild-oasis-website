import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createGuest, getGuest } from "./data-service"

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  callbacks: {
    //@ts-ignore
    authorized({ auth, request }) {
      return !!auth?.user
    },
    //@ts-ignore
    async signIn({ user, account, profile }) {
      try {
        const existingGuest = await getGuest(user.email);

        if (!existingGuest) await createGuest({ email: user.email, fullName: user.name })
        return true;
      } catch {
        return false;
      }
    },
    //@ts-ignore
    async session({ session, user }) {
      const guest = await getGuest(session.user.email);
      session.user.guestId = guest.id;
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
};

//@ts-ignore
export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth(authConfig)