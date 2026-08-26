import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const githubEnabled = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

const fallbackHandlers = {
  GET: async () => Response.redirect(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/`),
  POST: async () => Response.redirect(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/`),
};

const authHandler = githubEnabled
  ? NextAuth({
      session: {
        strategy: "jwt",
      },
      pages: {
        signIn: "/",
      },
      providers: [
        GitHub({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
        }),
      ],
      callbacks: {
        async jwt({ token, profile, account }: any) {
          if (account && profile) {
            token.githubUsername = profile.login;
            token.githubId = String(profile.id);
          }
          return token;
        },
        async session({ session, token }: any) {
          if (session.user) {
            (session.user as any).id = typeof token.sub === "string" ? token.sub : "guest-user";
            (session.user as any).githubUsername = typeof token.githubUsername === "string" ? token.githubUsername : undefined;
          }
          return session;
        },
      },
    })
  : undefined;

export const handlers = authHandler
  ? {
      GET: authHandler,
      POST: authHandler,
    }
  : fallbackHandlers;

export const auth = async () => null;
export const signIn = async () => null;
export const signOut = async () => null;
