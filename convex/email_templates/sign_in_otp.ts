/**
 * Professional HTML email template for Ascent sign-in OTP.
 * Uses inline CSS for broad email client support.
 */

export type SignInOtpOptions = {
  /** Expiry time in minutes (e.g. 15). Shown in the email. */
  expiresInMinutes?: number;
};

export function getSignInOtpHtml(
  token: string,
  options: SignInOtpOptions = {}
): string {
  const { expiresInMinutes = 15 } = options;
  const code = token.replace(/./g, (d) => `<span style="letter-spacing: 0.2em; font-variant-numeric: tabular-nums;">${d}</span>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sign in to Ascent</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 440px; margin: 0 auto;">
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); padding: 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 600; color: #18181b; letter-spacing: -0.02em;">Ascent</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #18181b; letter-spacing: -0.02em;">Sign in to your account</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 15px; color: #71717a;">Use the verification code below to complete sign in. This code expires in ${expiresInMinutes} minutes.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td style="background-color: #f4f4f5; border-radius: 8px; padding: 16px 28px;">
                          <span style="font-size: 28px; font-weight: 700; color: #18181b;">${code}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; border-top: 1px solid #e4e4e7;">
                    <p style="margin: 0; font-size: 13px; color: #a1a1aa;">If you didn't request this code, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">© ${new Date().getFullYear()} Ascent. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text fallback for the same content (for clients that don't support HTML).
 */
export function getSignInOtpText(token: string, options: SignInOtpOptions = {}): string {
  const { expiresInMinutes = 15 } = options;
  return [
    "Sign in to Ascent",
    "",
    `Your verification code is: ${token}`,
    "",
    `This code expires in ${expiresInMinutes} minutes.`,
    "",
    "If you didn't request this code, you can safely ignore this email.",
  ].join("\n");
}
