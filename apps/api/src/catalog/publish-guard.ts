import { AppError } from "../common/app-error";

/** Marketplace visibility can turn on only after platform approval. */
export function assertCanPublish(status: string, published: boolean | undefined): void {
  if (published === true && status !== "APPROVED") {
    throw new AppError("FORBIDDEN", 403, "Հրապարակել կարելի է միայն հաստատումից հետո");
  }
}
