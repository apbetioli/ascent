import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      // Magic link: only the token is needed; don't require email in params when verifying
      authorize: undefined,
      sendVerificationRequest: async ({ url, token }) => {
        // In production, send the email with a real provider (Resend, SendGrid, etc.)
        // For now we log the magic link; set CONVEX_SITE_URL for correct redirects
        console.log("Magic link:", url);
        if (process.env.NODE_ENV !== "production") {
          console.log("Token (dev only):", token);
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});
