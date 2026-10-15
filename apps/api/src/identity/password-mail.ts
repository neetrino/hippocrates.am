import { Logger } from "@nestjs/common";
import { AppError } from "../common/app-error";
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
  if (mailReady() || process.env.NODE_ENV !== "production") return;
  throw new AppError("MAIL_UNAVAILABLE", 503, "Նամակ ուղարկելը այս պահին հնարավոր չէ");
}

export async function deliverResetLink(email: string, token: string, locale: ResetLocale): Promise<void> {
  const url = resetLink(token, locale);
  if (!mailReady()) {
    logger.log(`Password reset link for ${email}: ${url}`);
    return;
  }
  try {
    const sent = await postResend(email, copy[locale], url);
    if (!sent) logger.error("Password reset mail was not accepted");
  } catch (error) {
    logger.error("Password reset mail failed", error instanceof Error ? error.stack : undefined);
  }
}

function mailReady(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim());
}

async function postResend(
  email: string,
  letter: { subject: string; intro: string; expiry: string },
  url: string,
): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY?.trim() ?? ""}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM?.trim(),
      to: [email],
      subject: letter.subject,
      text: `${letter.intro}\n\n${url}\n\n${letter.expiry}`,
    }),
  });
  return response.ok;
}
