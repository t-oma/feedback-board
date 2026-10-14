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

// A board page has started streaming by the time it knows the slug is
// unknown, so the status stays 200 and the page asks not to be indexed.
for (const { name, slug } of [
  { name: "a slug no board has", slug: crypto.randomUUID() },
  { name: "a value that is not a slug", slug: "Orbit-CLI" },
]) {
  test(`answers ${name} with the not-found page`, async ({ page }) => {
    await page.goto(`/p/${slug}`);

    await expect(
      page.getByRole("heading", { level: 1, name: "This page doesn’t exist" }),
    ).toBeVisible();
    await expect(
      page.locator('meta[name="robots"][content="noindex"]').first(),
    ).toBeAttached();
    await expect(page).toHaveTitle("Page not found · Feedback Board");
  });
}
