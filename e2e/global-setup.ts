import { runApiScript } from "./run-api";

export default async function globalSetup(): Promise<void> {
  await runApiScript("src/e2e/prepare.ts");
}
