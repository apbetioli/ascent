import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { Resend as ResendAPI } from "resend";
import {
  getSignInOtpHtml,
  getSignInOtpText,
} from "./email_templates/sign_in_otp";

const OTP_EXPIRES_MINUTES = 15;

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * OTP_EXPIRES_MINUTES,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
    return generateRandomString(random, "0123456789", 6);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: `Ascent <ascent@apbetioli.dev>`,
      to: [email],
      subject: "One-time passcode",
      html: getSignInOtpHtml(token, { expiresInMinutes: OTP_EXPIRES_MINUTES }),
      text: getSignInOtpText(token, { expiresInMinutes: OTP_EXPIRES_MINUTES }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
