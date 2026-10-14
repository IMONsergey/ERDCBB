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
  assert.equal(pagesData.length, 15);
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
  assert.equal(resolvePageId("#/appendix/contacts"), "contacts");
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
  assert.equal(pagesById.overview.sections.some((s) => s.id === "guide"), false);
  assert.equal(pagesById.made.title, "Товарный знак");
  assert.equal(pagesById.appendix.title, "Дизайн соцсетей");
  assert.equal(pagesById.appendix.sections.length, 1);
  assert.equal(pagesById.appendix.sections[0].assetImages, undefined);
  assert.equal(pagesById.contacts.title, "Контакты");
  assert.equal(pagesById.contacts.sections[0].contacts.updatedAt, "2026-11-01");
  assert.equal(pagesById.photostyle.sections.find((s) => s.id === "events").photoCredit.author, "Максим Блинов");
  assert.deepEqual(pagesById.photostyle.sections.find((s) => s.id === "events").assetImages.map((item) => item.file), ["photostyle-composition-7.webp"]);
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

test("all fifteen chapters have intentional covers without changing original logo assets", () => {
  const illustrated = ["positioning","regimes","typography","text","corporate","advertising","merch","made","appendix"];
  assert.deepEqual(pagesData.filter(p => p.heroImage).map(p => p.id), illustrated);
  for (const page of pagesData) {
    assert.ok(page.heroVideo || page.heroImage || page.heroAnimation || page.heroLibrary || page.heroSolid, "Missing cover: " + page.id);
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

test("full merchandise archive is shown without omitting any of the 41 original slides", () => {
  const merch = pagesById.merch;
  assert.equal(merch.sections.length, 1);
  const examples = merch.sections[0];
  assert.equal(examples.id, "examples");
  assert.equal(examples.merchBoard, undefined);
  assert.ok(examples.paragraphs.some((text) => text.includes("актуализируется ДВК")));
  assert.ok(examples.paragraphs.some((text) => text.includes("пожелания")));
  assert.equal(examples.merchGallery.length, 41);
  assert.deepEqual(examples.merchGallery.map((item) => item.slide), Array.from({ length: 41 }, (_, i) => i + 2));
  const originals = {
    "merch-slide-02.jpg": "dcf6ecc7ccc14bff1671d9899bcb5c9076d0aa736015aeeb77943a6f5def1901",
    "merch-slide-03.jpg": "b87899e4561e4b9fbe4c650b3010460141ea5d4d4f389672d4113e298dde9150",
    "merch-slide-04.jpg": "dd890ddc5543bdccd4b6edfd9e95457b0736cf75d5ec5bccb08bfc02e6e2d029",
    "merch-slide-05.jpg": "39d98b6bc855dcbd8d93e0368f1a625f1a87aa849ba5887aede00d6d2b8b982c",
    "merch-slide-06.jpg": "8a3f639c618ce51b8b986e8d26aa4c3bd6c9a52508a374a4a928d9375eca6ded",
    "merch-slide-07.jpg": "045b27cb5882ce0642161c3d14123893af8aff578cc28b5f686968dd89936508",
    "merch-slide-08.jpg": "4ccd354c655cad835508b9ba02199270383e45006831595e73b0e4074bd197b1",
    "merch-slide-09.jpg": "c706daa9f4e2cf321b5ef73adc3927c8caabb77c70ac8ecc68de95f947be4662",
    "merch-slide-10.jpg": "2e2d0be7f5df64d2a379748996fed8913dd02fbeb433bded0f674efb2f1dccd3",
    "merch-slide-11.jpg": "0239edf8867712aa43e3e83f940679974601890d4aef9ea64b5a408016600cf0",
    "merch-slide-12.jpg": "06a919b584feef8e6250fd8d1791f5579503196f83dd956e9a9d67514c7597cb",
    "merch-slide-13.jpg": "fbbc4ca0478a0ff5b7a0b9d04f747d905ec8723f9f1cdd4f19062bfd48f915ec",
    "merch-slide-14.jpg": "9df2b3df13701f361813b7f9298b98cefc35d7d71d53acfb7fbc6775d1a96534",
    "merch-slide-15.jpg": "fab332a9541d09a303f87ca4c620db1db37ba52ace0c2b477408e3e45466bf8d",
    "merch-slide-16.jpg": "4444b83e96821ec706c0570bf5606faae4c11603ba38699c7c9d14204f6c0787",
    "merch-slide-17.jpg": "e505bb15ba3012176663a9b72b38ee70a508519796bd9844627923ce0ccecf6b",
    "merch-slide-18.jpg": "c29225cacb2d126530f01c3415c274041232a337600ec809fe36311558f16b22",
    "merch-slide-19.jpg": "f7eda38004cf70374ccef84e7f5134fb60407190b40823bc9dc775fa0d6e3a2b",
    "merch-slide-20.jpg": "3058c80aeea8f715e0cdb2a7c7f6f330801d5ebf1a97fe6c7907075c81fd4bf5",
    "merch-slide-21.jpg": "c3e263e2a624d7ef6fa9191ec8e716da6e4f3ccd78f863ec3a6c81788f709b6a",
    "merch-slide-22.jpg": "8187f17eef35eae74580f7d008397096071dbbb7aac0a6835e02edb0bcc6dbfd",
    "merch-slide-23.jpg": "6fae769c9a6f9cf382ca3b0f4ded8964c95d604408ac780027fe7708a76bd25d",
    "merch-slide-24.jpg": "632862f9549f08047a9a455ee981b4965ac018f0e901808c57adede986d8376c",
    "merch-slide-25.jpg": "85f208dadb5e5e52a53afe4c89ab7ea6d16e1a2ce26938bc5cc7a65296b291ac",
    "merch-slide-26.jpg": "c706daa9f4e2cf321b5ef73adc3927c8caabb77c70ac8ecc68de95f947be4662",
    "merch-slide-27.jpg": "622489826fd86b440d7377f37dcb436904d8676c458738bcc45d1bbeb7ed3d52",
    "merch-slide-28.jpg": "56148532ff796240d9092b8dd3433a59f2775ba3cb85b9952fb205149505b0ea",
    "merch-slide-29.jpg": "2d7399f857e27548e67059e5433afecbfb73eeaceca8e56665e0bd46c6a029c2",
    "merch-slide-30.jpg": "9ae7489b088544f5044434ee2965c137af76dc6e22a683513f0a5a120d6d9eb6",
    "merch-slide-31.jpg": "3081596da6fbb06dbbd985837d555db3bc1f4ddcee7c96612b4d6012f0a870b8",
    "merch-slide-32.jpg": "6f9555a249bed96270bd11c54425c1add20b68a2ab6db7ee41534f68fd4769be",
    "merch-slide-33.jpg": "4faefc78ca01381948784532af4c2580da683c8d8cdd2cd015fab403d902833b",
    "merch-slide-34.jpg": "df20703e0f40a4ebd2da85ddb9b2a0a80c0440e7f8d086704ab4e161d5bb4dde",
    "merch-slide-35.jpg": "0469ab6d69f94423f7b5798e4b0f41671427be6a64724edfe53a71c90a325d0c",
    "merch-slide-36.jpg": "67f333b6ff7b4ef0667931128ce691d0251589430f3afcc5a83792746863423f",
    "merch-slide-37.jpg": "7527946f91a1e56b4c185dea9b73c9bcfcb16d82b86d8eb7fea6ccc93e379c20",
    "merch-slide-38.jpg": "838080448f81772f713c4745357b739cdfb10bef756af38023a59f6a9813e4d8",
    "merch-slide-39.jpg": "3ceb98572a858ae2ef7b9350fffe2cb596b038df53f8ebe8269ef7f6217f9164",
    "merch-slide-40.jpg": "abbfc558008823e522f3583c7c74da605298cc71aed62008206ebf65e5460069",
    "merch-slide-41.jpg": "ad1c45f23d7045e954f7815c29df51b29d80d8a0765ed116e73cb97b9d977bce",
    "merch-slide-42.jpg": "4f0f0838069a61d59414efb5203195a654686b40cf2226fbe961f7afec884893"
};
  assert.deepEqual(new Set(examples.merchGallery.map((item) => item.file)), new Set(Object.keys(originals)));
  for (const item of examples.merchGallery) {
    const original = readFileSync(path.join(publicRoot, "assets/brandbook/raster", item.file));
    assert.equal(createHash("sha256").update(original).digest("hex"), originals[item.file], "Original slide modified: " + item.file);
    assert.equal(item.file, "merch-slide-" + String(item.slide).padStart(2, "0") + ".jpg");
    assert.equal(item.preview, item.file.replace(".jpg", ".webp"));
    const preview = readFileSync(path.join(publicRoot, "assets/brandbook/raster", item.preview));
    assert.equal(preview.toString("ascii", 0, 4), "RIFF");
    assert.equal(preview.toString("ascii", 8, 12), "WEBP");
  }
  // Two original title slides are identical; both source positions must survive.
  assert.equal(originals["merch-slide-09.jpg"], originals["merch-slide-26.jpg"]);
});
