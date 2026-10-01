import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { LOGIN_EMAIL_LIMIT, LOGIN_IP_LIMIT, clientIp, hit } from "@/lib/rate-limit";

/** Thrown when too many sign-in attempts come from one IP or target one account. */
export class LoginRateLimited extends CredentialsSignin {
  code = "rate_limited";
}

const credentialsSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(200),
});

// Compared against when the email is unknown, so a miss takes as long as a wrong password
// and response timing doesn't reveal which admin emails exist.
const DUMMY_HASH = "$2b$12$0cGpfPc4yo.IAghaEdX9ouTIblVyDYCfTxMBj1UrzQL.E5gCBnIMK";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // one working day
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Limited here (not only in the login form) so direct calls to the auth endpoint count too.
        const ipOk = await hit(clientIp(request.headers), [LOGIN_IP_LIMIT]);
        const emailOk = await hit(email, [LOGIN_EMAIL_LIMIT]);
        if (!ipOk || !emailOk) throw new LoginRateLimited();

        const user = await prisma.user.findUnique({ where: { email } });
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !user.isActive || !ok) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
