import { expect, test } from "@playwright/test";

test("answers an unknown URL with the not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "This page doesn’t exist" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to the landing page" }),
  ).toHaveAttribute("href", "/");
  await expect(page).toHaveTitle("Page not found · Feedback Board");
});
