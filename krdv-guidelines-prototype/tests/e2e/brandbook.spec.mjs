import { expect, test } from "@playwright/test";

const titles = [
  ["overview", "Обзор"],
  ["positioning", "Позиционирование"],
  ["logo", "Логотип"],
  ["subsidiaries", "Дочерние общества"],
  ["regimes", "Режимы"],
  ["color", "Цвет"],
  ["typography", "Типографика"],
  ["text", "Оформление текста"],
  ["corporate", "Корпоративные материалы"],
  ["advertising", "Рекламные материалы"],
  ["merch", "Мерч"],
  ["made", "Сделано в ТОР СПВ"],
  ["photostyle", "Фотостиль"],
  ["appendix", "Приложение"],
];

async function ready(page) {
  await expect(page.locator(".brand-preloader")).toHaveCount(0);
}

test("all sections load with page titles and without horizontal overflow", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/#/overview");
  await ready(page);

  for (const [route, title] of titles) {
    await page.goto("/#/" + route);
    await ready(page);
    await expect(page.locator(".hero-title")).toContainText(title);
    const metrics = await page.locator("#page").evaluate((node) => ({
      width: node.clientWidth,
      scrollWidth: node.scrollWidth,
      loadedBrokenImages: [...node.querySelectorAll("img")]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.src),
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 2);
    expect(metrics.loadedBrokenImages).toEqual([]);
  }
  expect(runtimeErrors).toEqual([]);
});

test("navigation and browser history preserve routes", async ({ page, isMobile }) => {
  await page.goto("/#/");
  await ready(page);
  await expect(page.locator(".directory-card")).toHaveCount(14);
  if (isMobile) await page.locator(".mobile-menu-button").click();
  await page.locator(".nav-parent").filter({ hasText: "Логотип" }).click();
  await expect(page).toHaveURL(/#\/logo$/);
  await expect(page.locator(".hero-title")).toHaveText("Логотип");
  await page.goBack();
  await expect(page.locator(".hero-title")).toHaveText("Обзор");
});

test("mobile navigation is keyboard-operable and focus returns on Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile drawer only");
  await page.goto("/#/overview");
  await ready(page);
  const toggle = page.locator(".mobile-menu-button");
  await toggle.click();
  await expect(page.locator(".guideline-shell")).toHaveClass(/nav-open/);
  await expect(page.locator("#page")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.locator(".guideline-shell")).not.toHaveClass(/nav-open/);
  await expect(toggle).toBeFocused();
});

test("color swatches only report copy success after clipboard write", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/color");
  await ready(page);
  const first = page.locator(".palette-grid button").first();
  await first.scrollIntoViewIfNeeded();
  await first.evaluate((node) => {
    window.__copyConfirmationObserved = false;
    new MutationObserver(() => {
      if (node.textContent.includes("Скопировано")) window.__copyConfirmationObserved = true;
    }).observe(node, { subtree: true, childList: true, characterData: true });
  });
  await first.click();
  const copied = await page.evaluate(async () => {
    try { return await navigator.clipboard.readText(); }
    catch (error) { return "Clipboard error: " + error.message; }
  });
  expect(copied).toMatch(/^#[0-9a-f]{6}$/i);
  await expect.poll(() => page.evaluate(() => window.__copyConfirmationObserved)).toBe(true);
});

test("reduced motion disables decorative video playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/logo");
  await ready(page);
  const video = page.locator("video.hero-video");
  await expect(video).toHaveCount(1);
  await expect.poll(() => video.evaluate((el) => el.paused)).toBe(true);
  expect(await video.getAttribute("poster")).toMatch(/logo-cover\.webp$/);
});

test("decorative hero playback resumes with motion permitted", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/logo");
  await ready(page);
  const video = page.locator("video.hero-video");
  await expect(video).toHaveCount(1);
  await page.waitForTimeout(900);
  await expect.poll(() => video.evaluate((el) => !el.paused), { timeout: 7_000 }).toBe(true);
});
