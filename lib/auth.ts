import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Demo users (no password). In real app, use Email provider or proper db.
export const demoUsers = [
  { id: "demo-1", email: "agent@example.com", name: "Agent" },
  { id: "demo-2", email: "admin@example.com", name: "Admin", role: "admin" as const },
];

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Demo Login",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().toLowerCase();
        const user = demoUsers.find((u) => u.email.toLowerCase() === email);
        if (user) return user as any;
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = token.id as string;
      (session as any).user.role = (token as any).role ?? "user";
      return session;
    },
  },
  pages: { signIn: "/signin" },
};

// NextAuth v4 style: build route handlers and a server-side session helper
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
export const auth = () => getServerSession(authOptions);


