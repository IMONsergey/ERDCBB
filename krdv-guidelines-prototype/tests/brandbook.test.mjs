import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { pagesData, pagesById, resolvePageId, routeAliases } from "../src/data/pages.js";
import { downloadResources, logoVariants, subsidiaryLogos, regimeSignLogos, madeSignVariants, madeFarEastVariants, fontFamilies } from "../src/data/resources.js";
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
    ["assets/made-signs/", madeFarEastVariants],
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
      for (const image of section.merchGallery || []) {
        asset("assets/brandbook/raster/" + image.file);
        asset("assets/brandbook/raster/" + image.preview);
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

test("regional logo SVG sources remain byte-identical to the four supplied files", () => {
  const originals = {
    "made-dvia-en-purple": "27db903767444f604331b046eef7288e623e7474",
    "made-dvia-ru-purple": "adc683614f714c699d853b46d7a454a7f920d63c",
    "made-dvia-en-black": "13321a1188f5b1699e889934e5555b35520778c6",
    "made-dvia-ru-black": "6f9fe124eaca2fcfd00d6a4cb5e33345dca18445",
  };
  assert.equal(madeFarEastVariants.length, 4);
  for (const item of madeFarEastVariants) {
    const svg = readFileSync(path.join(publicRoot, "assets/made-signs", item.preview));
    const blobHash = createHash("sha1").update("blob " + svg.length + "\0").update(svg).digest("hex");
    assert.equal(blobHash, originals[item.slug], "Original SVG changed: " + item.slug);
    assert.deepEqual(Object.keys(item.files), ["svg"]);
    assert.match(svg.toString("utf8"), /viewBox="0 0 159\.45 231\.04"/);
  }
  assert.equal(pagesById.made.sections.find((s) => s.id === "made-far-east")?.madeFarEastSigns, true);
  assert.equal(downloadResources.madeFarEastSigns.url, "https://disk.yandex.ru/d/w1QaGJWiVcbf7Q");
});



test("updated leaflet gallery preserves all ten current originals byte for byte", () => {
  const leaflets = pagesById.advertising.sections.find((section) => section.id === "leaflets");
  const expected = {
    "leaflet-tor-2026.png": "b21310b04d1f04d89ea2f67cfd22953f4e2eec78081540608398add420d92a93",
    "leaflet-azrf-2026.png": "4e825a6cb54dd2fcac82a761fd3ca9134320c811d4367d29da477e0853a650eb",
    "leaflet-sar-2026.png": "e7e3e51fb94902c141a4702a8bbc5403e184e47d3241506a5dea9781296129d8",
    "leaflet-kurils-2026.png": "0efde8bd6fcface21583c3d7da7b4468945c8e6b1355023fd34842e67c0aed6f",
    "leaflet-hectare-2026.png": "b5f1d3ab376c2768650daf78d1c1dd3651945a3adb22b11c98b0a720d71a1555",
    "leaflet-mortgage-2026.png": "8ab8eafc05dab77c70565bfcfe919abc5e8388105389666f4d3ef47a7f147e8d",
    "leaflet-work-dfo-2026.png": "5698998a648921d04b0011d92756778cb3ab126375d957d5462607d036fc2fef",
    "leaflet-work-arctic-2026.png": "54a5cd841599f3bd2ef9ad3ea8ed896dcf9cc9f263a72ac0e1752924f95129e4",
    "leaflet-primorye-2026.png": "ebc44f74ba2a1385a55b73ead2671607b5f0ff1082bdbabdb268b4b41c951d61",
    "leaflet-khabarovsk-eao-2026.png": "147f6dbd85f69ae96b77b4595d0907775f435be46cd0ed89d280186b98c1f69d"
};
  assert.equal(leaflets.assetImageMode, "leaflets");
  assert.equal(leaflets.assetImages.length, 10);
  assert.deepEqual(
    new Set(leaflets.assetImages.map((item) => item.file)),
    new Set(Object.keys(expected))
  );
  for (const item of leaflets.assetImages) {
    const file = path.join(publicRoot, "assets/brandbook/raster", item.file);
    const data = readFileSync(file);
    assert.equal(createHash("sha256").update(data).digest("hex"), expected[item.file], "Unexpected alteration of " + item.file);
  }
  assert.ok(!leaflets.assetImages.some((item) => /leaflets-layout-/.test(item.file)));
});

test("current merch is a working reference gallery, not a fixed catalog", () => {
  const merch = pagesById.merch;
  assert.equal(merch.sections.length, 1);
  const examples = merch.sections[0];
  assert.equal(examples.id, "examples");
  assert.equal(examples.merchBoard, undefined);
  assert.ok(examples.paragraphs.some((text) => text.includes("актуализируется ДВК")));
  assert.ok(examples.paragraphs.some((text) => text.includes("пожелания")));
  assert.equal(examples.merchGallery.length, 12);
  const originals = {
    "merch-slide-03.jpg": "b87899e4561e4b9fbe4c650b3010460141ea5d4d4f389672d4113e298dde9150",
    "merch-slide-05.jpg": "39d98b6bc855dcbd8d93e0368f1a625f1a87aa849ba5887aede00d6d2b8b982c",
    "merch-slide-08.jpg": "4ccd354c655cad835508b9ba02199270383e45006831595e73b0e4074bd197b1",
    "merch-slide-10.jpg": "2e2d0be7f5df64d2a379748996fed8913dd02fbeb433bded0f674efb2f1dccd3",
    "merch-slide-12.jpg": "06a919b584feef8e6250fd8d1791f5579503196f83dd956e9a9d67514c7597cb",
    "merch-slide-15.jpg": "fab332a9541d09a303f87ca4c620db1db37ba52ace0c2b477408e3e45466bf8d",
    "merch-slide-16.jpg": "4444b83e96821ec706c0570bf5606faae4c11603ba38699c7c9d14204f6c0787",
    "merch-slide-19.jpg": "f7eda38004cf70374ccef84e7f5134fb60407190b40823bc9dc775fa0d6e3a2b",
    "merch-slide-23.jpg": "6fae769c9a6f9cf382ca3b0f4ded8964c95d604408ac780027fe7708a76bd25d",
    "merch-slide-34.jpg": "df20703e0f40a4ebd2da85ddb9b2a0a80c0440e7f8d086704ab4e161d5bb4dde",
    "merch-slide-37.jpg": "7527946f91a1e56b4c185dea9b73c9bcfcb16d82b86d8eb7fea6ccc93e379c20",
    "merch-slide-42.jpg": "4f0f0838069a61d59414efb5203195a654686b40cf2226fbe961f7afec884893"
};
  assert.deepEqual(new Set(examples.merchGallery.map((item) => item.file)), new Set(Object.keys(originals)));
  for (const item of examples.merchGallery) {
    const original = readFileSync(path.join(publicRoot, "assets/brandbook/raster", item.file));
    assert.equal(createHash("sha256").update(original).digest("hex"), originals[item.file]);
    assert.equal(item.preview, item.file.replace(".jpg", ".webp"));
  }
});
