export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
};

/** Resend is ready when both the key and the from-address are set. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim());
}

/** Sends one plain-text letter. Callers decide what a false result means. */
export async function sendMail(letter: OutboundMail): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY?.trim() ?? ""}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM?.trim(),
      to: [letter.to],
      subject: letter.subject,
      text: letter.text,
    }),
  });
  return response.ok;
}
