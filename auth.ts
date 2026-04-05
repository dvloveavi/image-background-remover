import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { upsertUser } from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    session({ session, token }) {
      // Expose user id (from JWT sub) to the session object
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user }) {
      // Store or update user in D1 when they sign in
      if (user.email && user.id) {
        try {
          await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });
        } catch (error) {
          console.error('Failed to save user to D1:', error);
        }
      }
    },
  },
});
