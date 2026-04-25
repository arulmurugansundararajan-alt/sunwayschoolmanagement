import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import { checkRateLimit, resetRateLimit } from "./rateLimit";

// Fail fast if the secret is not configured
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET environment variable is not set. " +
      "Add it to .env.local (development) or your deployment secrets (production)."
  );
}

// Import User model dynamically to avoid issues with Next.js module loading
async function getUserModel() {
  const { default: User } = await import("@/models/User");
  return User;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
        // The client sends the IP so we can rate-limit per originating address.
        // It is passed as a hidden field and never displayed in the UI.
        _clientIp: { label: "", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ── Rate limiting ───────────────────────────────────────────────────
        // Use the submitted email as the rate-limit key so an attacker cannot
        // bypass the lockout by rotating IP addresses, and vice-versa.
        const rateLimitKey = credentials.email.toLowerCase().trim();
        const rl = checkRateLimit(rateLimitKey);

        if (!rl.allowed) {
          throw new Error(
            `Too many login attempts. Please try again in ${Math.ceil((rl.retryAfter ?? 900) / 60)} minute(s).`
          );
        }

        // ── Verify against MongoDB ──────────────────────────────────────────
        try {
          await connectDB();
          const User = await getUserModel();
          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          }).select("+password");

          if (!user || !user.isActive) {
            // Don't leak whether the email exists
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Successful login — clear the rate-limit counter
          resetRateLimit(rateLimitKey);

          return {
            id:        user._id.toString(),
            name:      user.name,
            email:     user.email,
            role:      user.role,
            staffRole: user.staffRole ?? undefined,
          };
        } catch (err) {
          // Surface rate-limit errors from the throw above
          if (err instanceof Error && err.message.startsWith("Too many")) {
            throw err;
          }
          // All other DB errors: fail silently (log server-side)
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role      = (user as { role?: string }).role;
        token.id        = user.id;
        token.staffRole = (user as { staffRole?: string }).staffRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role           = token.role as string;
        (session.user as { id?: string }).id               = token.id  as string;
        (session.user as { staffRole?: string }).staffRole = token.staffRole as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:   60 * 60, // 1 hour (per requirements)
  },

  // Secret is guaranteed to be set by the check above
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;

