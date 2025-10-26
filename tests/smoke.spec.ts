import { expect, test } from "@playwright/test";

const routes = ["/login", "/dashboard", "/habits", "/analytics"];

for (const route of routes) {
  test(`visit ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  });
}
