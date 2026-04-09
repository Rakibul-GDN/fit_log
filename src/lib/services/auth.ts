import NextAuth from 'next-auth';

/** Shared NextAuth instance without providers — used by middleware and auth utilities */
export const { auth, signIn, signOut } = NextAuth({
  providers: [],
  session: {
    strategy: 'jwt',
  },
});
