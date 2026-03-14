import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------
// 1. TYPE DEFINITIONS (Module Augmentation)
// ---------------------------------------------------------
// We must tell TypeScript that our User, Session, and JWT 
// objects have an 'id' and a 'role'.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      stage: string;
      photoUrl?: string | null;
      idCardUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    stage: string;
    photoUrl?: string | null;
    idCardUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    stage: string;
    photoUrl?: string | null;
    idCardUrl?: string | null;
  }
}

// ---------------------------------------------------------
// 2. RATE LIMITING LOGIC
// ---------------------------------------------------------
const attemptTracker = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function rateLimit(ip: string) {
  const now = Date.now();
  const record = attemptTracker.get(ip) || { count: 0, lastAttempt: now };

  if (now - record.lastAttempt > WINDOW_MS) {
    record.count = 0;
  }

  record.lastAttempt = now;
  record.count += 1;
  attemptTracker.set(ip, record);

  return record.count > MAX_ATTEMPTS;
}

// ---------------------------------------------------------
// 3. AUTH OPTIONS
// ---------------------------------------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          // Robust IP detection
          const ip = req?.headers?.["x-forwarded-for"] || "unknown";

          if (rateLimit(String(ip))) {
            console.warn("Rate limit triggered for:", ip);
            return null;
          }

          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) return null;

          // ✅ RETURN OBJECT: Explicitly cast 'role' to string
          // This fixes the mismatch if Prisma thinks role is an "Enum"
          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role as string,
            stage: user.stage as string,
            photoUrl: user.photoUrl,
            idCardUrl: user.idCardUrl,
          };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // 1. Save data from User (DB) to Token (Cookie)
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.photoUrl = (user as any).photoUrl;
        token.idCardUrl = (user as any).idCardUrl;
      }
      if (trigger === "update" && session) {
        if (session.photoUrl) token.photoUrl = session.photoUrl;
        if (session.name) token.name = session.name;
        if (session.idCardUrl) token.idCardUrl = session.idCardUrl;
      }
      return token;
    },

    // 2. Save data from Token (Cookie) to Session (Client)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        (session.user as any).photoUrl = token.photoUrl;
        (session.user as any).idCardUrl = token.idCardUrl;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// // Basic in-memory rate limiter (serverless compat)
// const attemptTracker = new Map<string, { count: number; lastAttempt: number }>();
// const MAX_ATTEMPTS = 10;
// const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// function rateLimit(ip: string) {
//   const now = Date.now();
//   const record = attemptTracker.get(ip) || { count: 0, lastAttempt: now };

//   if (now - record.lastAttempt > WINDOW_MS) {
//     record.count = 0;
//   }

//   record.lastAttempt = now;
//   record.count += 1;

//   attemptTracker.set(ip, record);

//   return record.count > MAX_ATTEMPTS;
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials, req) {
//         try {
//           const ip =
//             req?.headers?.["x-forwarded-for"] ||
//             req?.socket?.remoteAddress ||
//             "unknown";

//           // Rate limit brute-force attacks
//           if (rateLimit(String(ip))) {
//             console.warn("Rate limit triggered for:", ip);
//             return null;
//           }

//           if (!credentials?.email || !credentials?.password) {
//             return null;
//           }

//           const user = await prisma.user.findUnique({
//             where: { email: credentials.email },
//           });

//           if (!user) return null;

//           const isValid = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (!isValid) return null;

//           // Return only safe user data
//           return {
//             id: user.id,
//             email: user.email,
//             name: user.name,
//             role: user.role,
//           };
//         } catch (error) {
//           console.error("Auth Error:", error);
//           return null;
//         }
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   callbacks: {
//     // JWT token creation
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.name = user.name;
//         token.email = user.email;
//       }
//       return token;
//     },

//     // Session object sent to client
//     async session({ session, token }: any) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//         session.user.email = token.email;
//         session.user.name = token.name;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/auth/signin",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };