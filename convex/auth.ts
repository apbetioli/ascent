import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      // Magic link: only the token is needed; don't require email in params when verifying
      authorize: undefined,
      sendVerificationRequest: async (
        params: { url: string; token: string; identifier: string },
        ...rest: unknown[]
      ) => {
        const { url, token, identifier } = params;
        // Store URL so payment-success can redirect the user and log them in directly (dynamic import avoids circular dep)
        const ctx = rest[0] as
          | {
              runMutation: (
                fn: unknown,
                args: { email: string; url: string }
              ) => Promise<unknown>;
            }
          | undefined;
        if (ctx?.runMutation) {
          try {
            const { api } = await import("./_generated/api");
            await ctx.runMutation(api.magic_links.storeForEmail as never, {
              email: identifier,
              url,
            });
          } catch (e) {
            console.error("Failed to store magic link URL:", e);
          }
        }
        // In production, send the email with a real provider (Resend, SendGrid, etc.)
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
