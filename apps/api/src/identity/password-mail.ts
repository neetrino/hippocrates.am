import { Logger } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { mailConfigured, sendMail } from "../infrastructure/send-mail";
import { resetLink, type ResetLocale } from "./password-link";

const RESET_MINUTES = 30;
const logger = new Logger("PasswordReset");

const copy: Record<ResetLocale, { subject: string; intro: string; expiry: string }> = {
  hy: {
    subject: "Գաղտնաբառի վերականգնում",
    intro: "Գաղտնաբառը փոխելու համար բացեք այս հղումը։",
    expiry: `Հղումը գործում է ${RESET_MINUTES} րոպե և մեկ անգամ։`,
  },
  en: {
    subject: "Reset your password",
    intro: "Open this link to choose a new password.",
    expiry: `The link works for ${RESET_MINUTES} minutes and only once.`,
  },
  ru: {
    subject: "Восстановление пароля",
    intro: "Откройте эту ссылку, чтобы выбрать новый пароль.",
    expiry: `Ссылка действует ${RESET_MINUTES} минут и только один раз.`,
  },
};

export { resetLocale } from "./password-link";

/** Letters leave only when Resend is configured. Local development records the link in the API log. */
export function assertResetMail(): void {
  if (mailConfigured() || process.env.NODE_ENV !== "production") return;
  throw new AppError("MAIL_UNAVAILABLE", 503, "Նամակ ուղարկելը այս պահին հնարավոր չէ");
}

export async function deliverResetLink(email: string, token: string, locale: ResetLocale): Promise<boolean> {
  const url = resetLink(token, locale);
  const letter = copy[locale];
  if (!mailConfigured()) {
    logger.log(`Password reset link for ${email}: ${url}`);
    return true;
  }
  try {
    const sent = await sendMail({ to: email, subject: letter.subject, text: resetText(letter, url) });
    if (!sent) logger.error("Password reset mail was not accepted");
    return sent;
  } catch (error) {
    logger.error("Password reset mail failed", error instanceof Error ? error.stack : undefined);
    return false;
  }
}

function resetText(letter: { intro: string; expiry: string }, url: string): string {
  return `${letter.intro}\n\n${url}\n\n${letter.expiry}`;
}
