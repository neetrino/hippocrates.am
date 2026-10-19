import { randomBytes } from "node:crypto";
import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { e2eAdminEmail, e2eDoctorEmail, e2eDoctorName } from "../apps/api/src/e2e/fixture-ids";
import { upcomingWeekdays } from "../apps/api/src/e2e/open-day";
import { runApiScript } from "./run-api";

test("patient books, clinic confirms, patient reschedules, doctor completes", async ({ browser }) => {
  const password = requiredSeedPassword();
  const patient = newPatient();
  const [bookDay, moveDay] = upcomingWeekdays(2);
  if (!bookDay || !moveDay) throw new Error("E2E refused: no open weekday.");
  const patientContext = await browser.newContext();
  const adminContext = await browser.newContext();
  const doctorContext = await browser.newContext();
  try {
    const patientPage = await patientContext.newPage();
    await register(patientPage, patient);
    await bookVisit(patientPage, bookDay);
    await confirmVisit(await openVisits(adminContext, e2eAdminEmail, password, "/en/clinic/visits"), patient.name);
    await reschedule(patientPage, moveDay);
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/en/clinic/visits");
    await confirmVisit(adminPage, patient.name);
    await runApiScript("src/e2e/shift-visit.ts", [patient.email]);
    const doctorPage = await openVisits(doctorContext, e2eDoctorEmail, password, "/en/me/visits");
    const complete = doctorPage.getByRole("button", { name: "Complete", exact: true });
    const completed = await clickUntilAccepted(doctorPage, complete, "/complete");
    if (!completed.ok()) throw new Error(`E2E refused: complete returned ${completed.status()}.`);
    await expect(doctorPage.getByText("Completed", { exact: true }).first()).toBeVisible();
  } finally {
    await closeQuietly(patientContext);
    await closeQuietly(adminContext);
    await closeQuietly(doctorContext);
  }
});

async function closeQuietly(context: BrowserContext): Promise<void> {
  await context.close().catch(() => undefined);
}

function requiredSeedPassword(): string {
  const password = process.env.SEED_PASSWORD?.trim() ?? "";
  if (password.length < 8) throw new Error("E2E refused: SEED_PASSWORD must be at least 8 characters.");
  return password;
}

function newPatient(): { email: string; password: string; phone: string; name: string; given: string; surname: string } {
  const stamp = `${Date.now()}${randomBytes(2).toString("hex")}`;
  const tail = String(Date.now() % 1_000_000).padStart(6, "0");
  const surname = `P${[...tail].map((digit) => "abcdefghij"[Number(digit)] ?? "a").join("")}`;
  return {
    email: `e2e.${stamp}@hippocrates.test`,
    password: `E2e-${randomBytes(18).toString("base64url")}`,
    phone: `91${tail}`,
    given: "Etwo",
    surname,
    name: `Etwo ${surname}`,
  };
}

async function register(
  page: Page,
  patient: { email: string; password: string; phone: string; given: string; surname: string },
): Promise<void> {
  await page.goto("/en/register");
  await page.getByLabel("Name", { exact: true }).fill(patient.given);
  await page.getByLabel("Surname", { exact: true }).fill(patient.surname);
  await page.locator('input[name="phoneLocal"]').fill(patient.phone);
  await page.getByLabel("Email", { exact: true }).fill(patient.email);
  await page.getByLabel("Password", { exact: true }).fill(patient.password);
  await page.getByLabel("Confirm password", { exact: true }).fill(patient.password);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL(/\/en\/me$/);
}

async function bookVisit(page: Page, day: string): Promise<void> {
  await page.goto("/en/doctors");
  await page.getByRole("link", { name: new RegExp(e2eDoctorName) }).click();
  const panel = page.getByRole("heading", { name: "Book a visit" }).locator("..");
  await pickDay(panel.getByLabel("Day", { exact: true }), day);
  const slot = panel.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first();
  await expect(slot).toBeVisible();
  await slot.click();
  await panel.getByRole("button", { name: "Book" }).click();
  await expect(panel.getByText("Visit booked", { exact: true })).toBeVisible();
}

async function openVisits(context: BrowserContext, email: string, password: string, path: string): Promise<Page> {
  const page = await context.newPage();
  await signIn(page, email, password);
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 5_000 }).catch(() => undefined);
  await openPath(page, path);
  return page;
}

async function openPath(page: Page, path: string): Promise<void> {
  try {
    await page.goto(path, { waitUntil: "domcontentloaded" });
  } catch (error) {
    const aborted = error instanceof Error && error.message.includes("ERR_ABORTED");
    if (!aborted) throw error;
    await page.goto(path, { waitUntil: "domcontentloaded" });
  }
}

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/en/login");
  const emailField = page.getByLabel("Email", { exact: true });
  await emailField.click();
  await emailField.fill(email);
  const passwordField = page.getByLabel("Password", { exact: true });
  await expect(passwordField).toBeEditable();
  await passwordField.fill(password);
  const signedIn = page.waitForResponse(
    (response) => response.url().endsWith("/api/v1/auth/login") && response.ok(),
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await signedIn;
}

async function pickDay(input: Locator, day: string): Promise<void> {
  await input.evaluate((element, value) => {
    if (!(element instanceof HTMLInputElement)) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, day);
  await expect(input).toHaveValue(day);
}

async function confirmVisit(page: Page, patientName: string): Promise<void> {
  const visit = page
    .locator("article")
    .filter({ hasText: patientName })
    .filter({ hasNot: page.locator("article") });
  const confirm = visit.getByRole("button", { name: "Confirm", exact: true });
  await expect(confirm).toBeVisible();
  const response = await clickUntilAccepted(page, confirm, "/confirm");
  if (!response.ok()) throw new Error(`E2E refused: confirm returned ${response.status()}.`);
  await expect(confirm).toHaveCount(0);
}

async function clickUntilAccepted(page: Page, button: Locator, path: string): Promise<{ ok: () => boolean; status: () => number }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const pending = page
      .waitForResponse((response) => response.url().includes(path) && response.request().method() === "POST", {
        timeout: 5_000,
      })
      .catch(() => null);
    await button.click();
    const response = await pending;
    if (response) return response;
  }
  throw new Error("E2E refused: the visit action did not reach the API.");
}

async function reschedule(page: Page, day: string): Promise<void> {
  await page.goto("/en/me/visits");
  await page.getByRole("button", { name: "Reschedule" }).click();
  await pickDay(page.getByLabel("Date", { exact: true }), day);
  const slot = page.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first();
  await expect(slot).toBeVisible();
  await slot.click();
  await expect(page.getByText("Waiting", { exact: true })).toBeVisible();
}
