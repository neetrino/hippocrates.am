import { Logger } from "@nestjs/common";
import { mailConfigured, sendMail } from "../infrastructure/send-mail";
import { verificationLink, type VerifyLocale } from "./email-verify-link";

const VERIFY_HOURS = 24;
const logger = new Logger("EmailVerification");

const copy: Record<VerifyLocale, { subject: string; intro: string; expiry: string }> = {
  hy: {
    subject: "Հաստատեք էլ. փոստը",
    intro: "Հաշիվը բացելու համար բացեք այս հղումը։",
    expiry: `Հղումը գործում է ${VERIFY_HOURS} ժամ և մեկ անգամ։`,
  },
  en: {
    subject: "Confirm your email",
    intro: "Open this link to confirm your email and open the account.",
    expiry: `The link works for ${VERIFY_HOURS} hours and only once.`,
  },
  ru: {
    subject: "Подтвердите почту",
    intro: "Откройте эту ссылку, чтобы подтвердить почту и открыть аккаунт.",
    expiry: `Ссылка действует ${VERIFY_HOURS} часов и только один раз.`,
  },
};

/** Letters leave only when Resend is configured. Local development records the link in the API log. */
export async function deliverVerificationLink(email: string, token: string, locale: VerifyLocale): Promise<void> {
  const url = verificationLink(token, locale);
  const letter = copy[locale];
  if (!mailConfigured()) {
    logger.log(`Email verification link for ${email}: ${url}`);
    return;
  }
  try {
    const sent = await sendMail({ to: email, subject: letter.subject, text: verificationText(letter, url) });
    if (!sent) logger.error("Email verification mail was not accepted");
  } catch (error) {
    logger.error("Email verification mail failed", error instanceof Error ? error.stack : undefined);
  }
}

function verificationText(letter: { intro: string; expiry: string }, url: string): string {
  return `${letter.intro}\n\n${url}\n\n${letter.expiry}`;
}
