import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { pagesData, pagesById, resolvePageId, routeAliases } from "../src/data/pages.js";
import { downloadResources, logoVariants, subsidiaryLogos, regimeSignLogos, madeSignVariants, fontFamilies } from "../src/data/resources.js";
import { typograf } from "../src/lib/typograf.js";
const publicRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
function asset(relativeFile) {
  const full = path.resolve(publicRoot, relativeFile);
  assert.ok(full.startsWith(publicRoot + path.sep), "Unsafe path: " + relativeFile);
  assert.ok(existsSync(full), "Missing: " + relativeFile);
  assert.ok(statSync(full).size > 0, "Empty: " + relativeFile);
}
test("pages and sections have unique stable identities", () => {
  assert.equal(pagesData.length, 14);
  assert.equal(new Set(pagesData.map((p) => p.id)).size, pagesData.length);
  pagesData.forEach((page, index) => {
    assert.equal(page.number, String(index).padStart(2, "0"));
    assert.equal(pagesById[page.id], page);
    assert.ok(page.title && page.intro && page.sections?.length);
    assert.equal(new Set(page.sections.map((s) => s.id)).size, page.sections.length);
  });
});
test("canonical and historic routes resolve to real pages", () => {
  for (const page of pagesData) {
    assert.equal(resolvePageId("#/" + page.id), page.id);
    assert.equal(resolvePageId("#/" + page.id + "/section"), page.id);
  }
  for (const [alias, target] of Object.entries(routeAliases)) {
    assert.ok(pagesById[target], "Broken alias: " + alias);
    assert.equal(resolvePageId("#/" + alias), target);
  }
  assert.equal(resolvePageId("#/invalid"), "overview");
});
test("all downloadable logos, marks, fonts, imagery and videos exist", () => {
  const collections = [
    ["assets/logos/", Object.values(logoVariants)],
    ["assets/subsidiaries/", subsidiaryLogos],
    ["assets/regime-signs/", regimeSignLogos],
    ["assets/made-signs/", madeSignVariants],
  ];
  for (const [prefix, items] of collections) for (const item of items) {
    asset(prefix + item.preview);
    for (const file of Object.values(item.files)) asset(prefix + file);
  }
  for (const family of fontFamilies) for (const file of family.files) asset("fonts/" + file.file);
  for (const page of pagesData) {
    if (page.heroVideo) {
      asset("assets/hero/" + page.heroVideo);
      asset("assets/hero/" + page.heroVideo.replace(".mp4", ".webp"));
    }
    if (page.heroImage) asset("assets/hero/" + page.heroImage);
    if (page.heroLogo) asset("assets/logos/" + page.heroLogo);
    for (const section of page.sections) {
      for (const group of ["assetImages", "preAssetImages"]) {
        for (const image of section[group] || []) asset("assets/brandbook/raster/" + image.file);
      }
      for (const key of section.resourceLinks || []) assert.ok(downloadResources[key], "Missing resource " + key);
    }
  }
});
test("external resource links have unique HTTPS URLs", () => {
  const urls = Object.values(downloadResources).map((item) => {
    const u = new URL(item.url);
    assert.equal(u.protocol, "https:");
    assert.ok(item.title && item.description);
    return u.href;
  });
  assert.equal(urls.length, new Set(urls).size);
});
test("approved editorial changes are represented in the page data", () => {
  assert.equal(pagesById.regimes.directoryTitle, "Преференциальные режимы");
  assert.equal(pagesById.logo.sections.find((s) => s.id === "full").logos.includes("mark"), false);
  assert.equal(logoVariants["ru-square"].role, "Основная версия");
  assert.equal(logoVariants["ru-horizontal"].role, "Дополнительная версия");
  assert.equal(logoVariants["en-square"].role, "Основная международная версия");
  assert.equal(logoVariants["en-horizontal"].role, "Дополнительная международная версия");
  assert.equal(pagesById.positioning.sections.find((s) => s.id === "principles").cards, undefined);
  assert.equal(pagesById.typography.sections.some((s) => s.id === "font-files"), false);
  assert.equal(pagesById.advertising.sections.some((s) => s.id === "presswall"), false);
  assert.equal(pagesById.appendix.sections.find((s) => s.id === "social").assetImages, undefined);
  assert.equal(pagesById.appendix.sections.find((s) => s.id === "contacts").contacts.updatedAt, "2026-11-01");
  assert.equal(pagesById.photostyle.sections.find((s) => s.id === "events").photoCredit.author, "Максим Блинов");
  for (const page of pagesData) {
    assert.ok(page.directoryDescription?.length > 15 && page.directoryDescription.length < 100);
  }
});

test("Russian typographic rules preserve meaning", () => {
  assert.equal(typograf("АО КРДВ"), "АО\u00a0КРДВ");
  assert.equal(typograf("10 кг"), "10\u00a0кг");
  assert.equal(typograf("2 x 3"), "2×3");
  assert.equal(typograf(null), null);
  assert.equal(typograf("АО КРДВ\n10 кг"), "АО\u00a0КРДВ\n10\u00a0кг");
  assert.equal(typograf("АО КРДВ\r\n10 кг"), "АО\u00a0КРДВ\n10\u00a0кг");
});
test("primary artwork SVG is not raster content in disguise", () => {
  for (const file of ["krdv-logo-full.svg", "krdv-mark.svg", "logo-master.svg", "logo-versions.svg"]) {
    const svg = readFileSync(path.join(publicRoot, "assets/brandbook/vector", file), "utf8");
    assert.ok(svg.includes("<svg"), file);
    assert.ok(!/<image\b|data:image\//i.test(svg), file);
  }
});

test("GitHub Pages production output keeps the /ERDCBB/ asset base", () => {
  if (process.env.GITHUB_PAGES !== "true") return;
  const dist = path.resolve(publicRoot, "../dist/client");
  const html = readFileSync(path.join(dist, "index.html"), "utf8");
  assert.match(html, /\/ERDCBB\/assets\/index-[^"']+\.js/);
  const stylesheet = readdirSync(path.join(dist, "assets")).find((entry) => /^index-.*\.css$/.test(entry));
  assert.ok(stylesheet, "Missing production stylesheet");
  const css = readFileSync(path.join(dist, "assets", stylesheet), "utf8");
  assert.ok(css.includes("/ERDCBB/fonts/"), "Brand fonts must resolve under the GitHub Pages prefix");
});

// Inaccessible internal Yandex Disk folders must never appear as public downloads.
test("public download resources are accessible share links, not internal login folders", () => {
  for (const resource of Object.values(downloadResources)) {
    assert.doesNotMatch(resource.url, /\/client\/aa\//);
  }
  assert.equal(downloadResources.logos, undefined);
  assert.equal(downloadResources.businessCards, undefined);
  const logoVersions = pagesById.logo.sections.find((section) => section.id === "versions");
  const businessCard = pagesById.corporate.sections.find((section) => section.id === "business-card");
  assert.equal(logoVersions.resourceLinks, undefined);
  assert.equal(businessCard.resourceLinks, undefined);
});

test("all fourteen sections have an intentional cover; nine editorial JPEGs keep original logo assets untouched", () => {
  const illustrated = ["positioning","regimes","typography","text","corporate","advertising","merch","made","appendix"];
  assert.deepEqual(pagesData.filter(p => p.heroImage).map(p => p.id), illustrated);
  for (const page of pagesData) {
    assert.ok(page.heroVideo || page.heroImage || page.heroAnimation || page.heroLibrary, "Missing cover: " + page.id);
    if (page.heroImage) assert.match(page.heroImage, /^cover-[a-z-]+\.jpg$/);
  }
});
