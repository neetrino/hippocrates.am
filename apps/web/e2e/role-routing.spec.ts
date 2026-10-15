import { expect, test, type BrowserContext } from "@playwright/test";

test("anonymous platform access redirects to login", async ({ page }) => {
  await page.goto("/hy/platform");
  await expect(page).toHaveURL(/\/hy\/login$/);
});

test("clinic admin cannot enter the Super Admin area", async ({ context, page }) => {
  await setRole(context, "ADMIN");
  await page.goto("/hy/super-admin");
  await expect(page).toHaveURL(/\/hy\/clinic$/);
});

test("patient cannot enter the clinic area", async ({ context, page }) => {
  await setRole(context, "PATIENT");
  await page.goto("/hy/clinic");
  await expect(page).toHaveURL(/\/hy\/me$/);
});

test("Super Admin cannot enter a clinic tenant area", async ({ context, page }) => {
  await setRole(context, "SUPER_ADMIN");
  await page.goto("/hy/clinic");
  await expect(page).toHaveURL(/\/hy\/super-admin$/);
});

async function setRole(
  context: BrowserContext,
  role: "SUPER_ADMIN" | "ADMIN" | "PATIENT",
): Promise<void> {
  await context.addCookies([
    {
      name: "e2e_role",
      value: role,
      url: "http://127.0.0.1:3100",
      sameSite: "Lax",
    },
  ]);
}
