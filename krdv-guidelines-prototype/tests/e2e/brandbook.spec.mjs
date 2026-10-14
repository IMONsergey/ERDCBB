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

test("color swatches only report copy success after clipboard write", async ({ page, context, browserName }) => {
  if (browserName === "chromium") {
    // Verify the native clipboard implementation on Chromium.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  } else {
    // Firefox/WebKit handle clipboard permissions differently. Exercise the same
    // app write/read contract with a deterministic browser-side clipboard.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => { window.__qaCopiedText = String(text); },
          readText: async () => window.__qaCopiedText || "",
        },
      });
    });
  }
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

test("requested editorial cleanup is reflected on all affected pages", async ({ page }) => {
  await page.goto("/#/overview");
  await ready(page);
  await expect(page.locator(".intro-panel")).toContainText("Руководство по визуальной системе");
  await expect(page.locator("#guide .keyword-wall")).toHaveCount(0);
  await expect(page.locator("#contents .lead-copy")).toContainText("Руководство по использованию фирменного стиля");
  await expect(page.locator("#contents .directory-copy h3")).toContainText(["Обзор", "Позиционирование", "Логотип", "Дочерние общества", "Преференциальные режимы"]);
  // Snapshot all summaries atomically; positional locators can drift during layout transitions.
  const summaries = await page.locator("#contents .directory-copy p").evaluateAll(nodes =>
    nodes.map(node => ({
      text: node.textContent,
      width: node.clientWidth,
      scrollWidth: node.scrollWidth,
    }))
  );
  expect(summaries).toHaveLength(14);
  for (const summary of summaries) {
    expect(summary.text).not.toContain("...");
    expect(summary.scrollWidth).toBeLessThanOrEqual(summary.width + 1);
  }

  await page.goto("/#/positioning");
  await ready(page);
  await expect(page.locator(".positioning-principles, #principles .info-card")).toHaveCount(0);

  await page.goto("/#/logo");
  await ready(page);
  await expect(page.locator(".intro-panel")).toContainText("Правила работы с логотипом");
  await expect(page.locator("#full .logo-card")).toHaveCount(2);
  await expect(page.locator("#full .logo-card").first().locator(".logo-card-copy > span")).toHaveText("Дополнительная версия");
  await expect(page.locator("#full .logo-card").nth(1).locator(".logo-card-copy > span")).toHaveText("Основная версия");
  await expect(page.locator("#versions .logo-card")).toHaveCount(4);
  await expect(page.locator("#versions .logo-card").nth(2).locator(".logo-card-copy > span")).toContainText("Дополнительная");
  await expect(page.locator("#versions .logo-card").nth(3).locator(".logo-card-copy > span")).toContainText("Основная");

  await page.goto("/#/typography");
  await ready(page);
  await expect(page.locator("#font-files, .font-current-file, .font-download-library")).toHaveCount(0);

  await page.goto("/#/advertising");
  await ready(page);
  await expect(page.locator("#presswall")).toHaveCount(0);

  await page.goto("/#/photostyle");
  await ready(page);
  await expect(page.locator("#events .asset-image-card")).toHaveCount(2);
  await expect(page.locator("#events .photo-credit")).toContainText("Автор фото:");
  await expect(page.locator("#events .photo-credit")).toContainText("Максим Блинов");
  await expect(page.locator("#events .photo-credit")).toContainText("Фотохост-агентство РИА Новости");

  await page.goto("/#/appendix");
  await ready(page);
  await expect(page.locator(".intro-panel")).toContainText("Гайд по оформлению публикаций в соцсетях");
  await expect(page.locator("#social .asset-image-grid")).toHaveCount(0);
  await expect(page.locator("#contacts .contact-block")).toContainText("erdc.ru");
  await expect(page.locator("#contacts .contact-block time")).toHaveAttribute("datetime", "2026-11-01");
  await expect(page.locator("#contacts .contact-block time")).toHaveText("01.11.2026");
});

test("clipboard write denial never reports a successful copy", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("Clipboard permission denied"); } },
    });
  });
  await page.goto("/#/color");
  await ready(page);
  const first = page.locator(".palette-grid button").first();
  await first.click();
  await expect(first.locator(".copy-action")).toContainText("Ошибка копирования");
  await expect(first.locator(".copy-action")).not.toContainText("Скопировано");
});

test("overview shader falls back cleanly when browser WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const realGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
      return realGetContext.call(this, type, ...args);
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/#/overview");
  await ready(page);
  await expect(page.locator(".hero-band .library-shader-fallback")).toHaveCount(1);
  await expect(page.locator(".hero-band .library-shader")).toHaveCount(0);
  await expect(page.locator(".hero-title")).toHaveText("Обзор");
  expect(errors).toEqual([]);
});

test("keyboard skip control and route titles remain accessible", async ({ page }) => {
  await page.goto("/#/overview");
  await ready(page);
  await expect(page).toHaveTitle("Руководство по фирменному стилю — КРДВ");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-to-content")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#page")).toBeFocused();
  await page.getByRole("button", { name: "Открыть раздел Логотип", exact: true }).click();
  await expect(page.locator(".hero-title")).toHaveText("Логотип");
  await expect(page).toHaveTitle("Логотип — брендбук КРДВ");
  await expect(page.locator("#page")).toBeFocused();
});

test("subnavigation expands and adapts without fixed pixel heights", async ({ page, isMobile }) => {
  await page.goto("/#/logo");
  await ready(page);
  if (isMobile) await page.locator(".mobile-menu-button").click();
  const submenu = page.locator(".nav-group.is-open .nav-children-shell");
  await expect(submenu).toBeVisible();
  await expect.poll(() => submenu.evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThan(80);
  await page.setViewportSize({ width: isMobile ? 320 : 1024, height: 700 });
  await expect.poll(() => submenu.evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThan(80);
});

test("typographer keeps explicit paragraph breaks", async ({ page }) => {
  await page.goto("/#/text");
  await ready(page);
  await page.locator(".typograf-demo textarea").fill("АО КРДВ\n10 кг");
  const result = await page.locator(".typograf-demo p").textContent();
  expect(result).toBe("АО\u00a0КРДВ\n10\u00a0кг");
});

test("small mobile, tablet, desktop layouts have no horizontal overflow", async ({ page }) => {
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 760 });
    await page.goto("/#/logo");
    await ready(page);
    const sizes = await page.locator("#page").evaluate(el => ({
      content: el.scrollWidth,
      viewport: el.clientWidth,
    }));
    expect(sizes.content, "Overflow at " + width + "px").toBeLessThanOrEqual(sizes.viewport + 2);
  }
});

test("print layout exposes hidden-by-scroll sections", async ({ page }) => {
  await page.goto("/#/logo");
  await ready(page);
  await page.emulateMedia({ media: "print" });
  const metrics = await page.locator("#page").evaluate(el => ({
    overflow: getComputedStyle(el).overflow,
    opacity: getComputedStyle(el.querySelector(".content-section")).opacity,
    sidebar: getComputedStyle(document.querySelector(".sidebar")).display,
  }));
  expect(metrics.overflow).toBe("visible");
  expect(metrics.opacity).toBe("1");
  expect(metrics.sidebar).toBe("none");
});

test("font-size workbench reflects the chosen size on all screen widths", async ({ page }) => {
  await page.goto("/#/typography");
  await ready(page);
  const slider = page.locator(".font-size-control input");
  await slider.focus();
  await slider.press("End");
  await expect(page.locator(".font-size-control strong")).toHaveText("104px");
  const size = await page.locator(".font-preview-sample").evaluate(node => getComputedStyle(node).fontSize);
  expect(size).toBe("104px");
});

test("logo format downloads point to present files", async ({ page }) => {
  await page.goto("/#/logo");
  await ready(page);
  const link = page.locator("#full .logo-downloads a").first();
  await expect(link).toHaveAttribute("download", /\.svg$/);
  const href = await link.getAttribute("href");
  const response = await page.request.get(href);
  expect(response.ok()).toBeTruthy();
  expect((await response.body()).length).toBeGreaterThan(100);
});

test("subsection URLs are shareable and browser Back restores the page", async ({ page, isMobile }) => {
  await page.goto("/#/logo");
  await ready(page);
  if (isMobile) await page.locator(".mobile-menu-button").click();
  await page.locator(".nav-group.is-open .nav-children button")
    .filter({ hasText: "Охранное поле" }).click();
  await expect(page).toHaveURL(/#\/logo\/clearspace$/);
  await expect.poll(() => page.locator("#page").evaluate(el => el.scrollTop)).toBeGreaterThan(100);
  await page.goBack();
  await expect(page).toHaveURL(/#\/logo$/);
  await page.goto("/#/logo/clearspace");
  await ready(page);
  await expect.poll(() => page.locator("#page").evaluate(el => el.scrollTop)).toBeGreaterThan(100);
});

test("older clipboard completion cannot overwrite a newer swatch", async ({ page }) => {
  await page.addInitScript(() => {
    window.__pendingCopies = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text) => new Promise((resolve) => {
          window.__pendingCopies.push({ text, resolve });
        }),
      },
    });
  });
  await page.goto("/#/color");
  await ready(page);
  const buttons = page.locator(".palette-grid button");
  await buttons.nth(0).click();
  await buttons.nth(1).click();
  await expect.poll(() => page.evaluate(() => window.__pendingCopies.length)).toBe(2);
  await page.evaluate(() => {
    window.__pendingCopies[1].resolve();
    window.__pendingCopies[0].resolve();
  });
  await expect(buttons.nth(1).locator(".copy-action")).toContainText("Скопировано");
  await expect(buttons.nth(0).locator(".copy-action")).not.toContainText("Скопировано");
});

test("clipboard fallback restores keyboard focus to the clicked control", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    document.execCommand = (command) => command === "copy";
  });
  await page.goto("/#/color");
  await ready(page);
  const swatch = page.locator(".palette-grid button").first();
  await swatch.click();
  await expect(swatch.locator(".copy-action")).toContainText("Скопировано");
  await expect(swatch).toBeFocused();
});

test("mobile menu targets retain comfortable touch sizes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Applies to mobile drawer controls");
  await page.goto("/#/logo");
  await ready(page);
  await page.locator(".mobile-menu-button").click();
  const size = await page.locator(".nav-group.is-open").evaluate(group => {
    const parent = group.querySelector(".nav-parent");
    const child = group.querySelector(".nav-children button");
    return { parent: parent.getBoundingClientRect().height, child: child.getBoundingClientRect().height };
  });
  expect(size.parent).toBeGreaterThanOrEqual(44);
  expect(size.child).toBeGreaterThanOrEqual(44);
});

test("nine neutral image covers render correctly in hero and directory", async ({ page }) => {
  const illustrated = ["positioning","regimes","typography","text","corporate","advertising","merch","made","appendix"];
  await page.goto("/#/overview");
  await ready(page);
  await expect(page.locator(".directory-visual.has-still-cover")).toHaveCount(9);
  for (const card of await page.locator(".directory-visual.has-still-cover").all()) {
    const image = card.locator(".directory-still-image");
    await expect(image).toHaveAttribute("src", /\/ERDCBB\/assets\/hero\/cover-|\/assets\/hero\/cover-/);
  }
  for (const id of illustrated) {
    await page.goto("/#/" + id);
    await ready(page);
    const hero = page.locator(".hero-band.is-still-cover");
    await expect(hero).toBeVisible();
    const image = hero.locator(".hero-still-image");
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 1000)).toBeTruthy();
    await expect(hero.locator(".hero-title")).toBeVisible();
  }
});

test("new light-cover headings preserve readable dark ink", async ({ page }) => {
  await page.goto("/#/typography");
  await ready(page);
  const metrics = await page.locator(".hero-band.is-still-cover").evaluate(hero => ({
    color: getComputedStyle(hero).color,
    numberVisible: hero.querySelector(".hero-number").getBoundingClientRect().width > 0,
    titleVisible: hero.querySelector(".hero-title").getBoundingClientRect().height > 0,
  }));
  expect(metrics.color).toBe("rgb(0, 29, 55)");
  expect(metrics.numberVisible).toBe(true);
  expect(metrics.titleVisible).toBe(true);
});

test("regional Far East and Arctic marks render, link and download", async ({ page }) => {
  await page.goto("/#/made");
  await ready(page);
  const section = page.locator("#made-far-east");
  await expect(section).toHaveCount(1);
  await expect(section.locator(".made-sign-card")).toHaveCount(4);
  await expect(section.getByRole("link", { name: /Открыть архив/ })).toHaveAttribute("href", "https://disk.yandex.ru/d/w1QaGJWiVcbf7Q");
  await expect(page.locator("#sign .made-sign-card")).toHaveCount(7);
  for (const card of await section.locator(".made-sign-card").all()) {
    await card.scrollIntoViewIfNeeded();
    const img = card.locator(".made-sign-preview img");
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBeTruthy();
    const links = card.locator(".logo-downloads a");
    await expect(links).toHaveCount(1);
    const href = await links.first().getAttribute("href");
    expect(href).toMatch(/made-dvia-(?:ru|en)-(?:purple|black)\.svg$/);
    const response = await page.request.get(href);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain("<svg");
  }
  for (const card of await section.locator('.made-sign-card[data-tone="black"]').all()) {
    const preview = card.locator(".made-sign-preview");
    await expect(preview).toHaveCSS("background-color", "rgb(66, 66, 66)");
    await expect(preview.locator("img")).toHaveCSS("outline-style", "solid");
  }
});


test("ten current leaflet covers display uncropped and open full-size PNG", async ({ page, isMobile }) => {
  await page.goto("/#/advertising");
  await ready(page);
  const gallery = page.locator("#leaflets .asset-image-grid.is-leaflets");
  await expect(gallery).toHaveCount(1);
  const covers = gallery.locator(".asset-image-card");
  await expect(covers).toHaveCount(10);
  await expect(page.locator("#leaflets .asset-image-grid.is-stack")).toHaveCount(0);
  const links = gallery.locator("a.leaflet-cover-link");
  await expect(links).toHaveCount(10);
  const first = links.first();
  await expect(first).toHaveAttribute("target", "_blank");
  const image = first.locator("img");
  await first.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 500)).toBe(true);
  await expect(image).toHaveCSS("object-fit", "contain");
  const response = await page.request.get(await first.getAttribute("href"));
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("image/png");
  const cols = await gallery.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(cols).toBe(isMobile ? 2 : 5);
});
