import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

const githubEnabled = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

const fallbackHandlers = {
  GET: async () => Response.redirect(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/`),
  POST: async () => Response.redirect(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/`),
};

export const authOptions: NextAuthOptions | undefined = githubEnabled
  ? {
      session: {
        strategy: "jwt",
      },
      // Temporary: use NextAuth's default sign-in page so the OAuth flow can complete without
      // masking the underlying GitHub error state.
      providers: [
        GitHub({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
          authorization: {
            params: {
              scope: "read:user user:email repo",
            },
          },
        }),
      ],
      debug: true,
      callbacks: {
        async jwt({ token, profile, account }: any) {
          if (account && profile) {
            token.githubUsername = profile.login;
            token.githubId = String(profile.id);
          }

          if (account?.access_token) {
            token.accessToken = account.access_token;
          }

          return token;
        },
        async session({ session, token }: any) {
          if (session.user) {
            (session.user as any).id = typeof token.sub === "string" ? token.sub : "guest-user";
            (session.user as any).githubUsername =
              typeof token.githubUsername === "string" ? token.githubUsername : undefined;
          }

          (session as any).accessToken = token.accessToken ?? null;
          return session;
        },
      },
    }
  : undefined;

export const handlers = authOptions
  ? {
      GET: NextAuth(authOptions),
      POST: NextAuth(authOptions),
    }
  : fallbackHandlers;

export const auth = async () => {
  if (!authOptions) {
    return null;
  }

  return getServerSession(authOptions);
};

export const signIn = async () => null;
export const signOut = async () => null;
