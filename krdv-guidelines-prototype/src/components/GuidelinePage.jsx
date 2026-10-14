import { SmartVideo } from "./SmartVideo.jsx";
import { motion } from "motion/react";
import { ICONS, t, pagesData, heroAsset } from "../data/brandbook.js";
import { HeroLogoLockup, ColorHeroAnimation, SubsidiaryHeroAnimation, LibraryHeroBackground } from "./Hero.jsx";
import { UiIcon } from "./UiIcon.jsx";
import { MerchGallery } from "./MerchGallery.jsx";
import { LogoLibrary, SubsidiaryLogoLibrary, RegimeSignLibrary, MadeSignLibrary, ResourceLinks, AssetImageGrid } from "./AssetLibraries.jsx";
import { RuleList, SpecGrid, PaletteGrid, TypeSpecimens, FontWorkbench, RegimePalette, TypografDemo, ContactBlock, ContactCta, EndLinks } from "./ContentBlocks.jsx";

function GuidelinePage({ page, activePageId, navigate }) {
  const hasMediaHero = Boolean(page.heroVideo);
  const hasStillHero = Boolean(page.heroImage);
  const hasAnimatedHero = Boolean(page.heroAnimation);
  const hasSubsidiaryHero = page.heroAnimation === "subsidiaryRegions";
  const hasLibraryHero = Boolean(page.heroLibrary);

  return (
    <article className="guideline-page">
      <header className={`hero-band ${hasMediaHero ? "is-media" : ""} ${hasAnimatedHero ? "is-animated" : ""} ${hasSubsidiaryHero ? "is-subsidiary" : ""} ${hasLibraryHero ? "is-library" : ""} ${hasStillHero ? "is-still-cover" : ""}`} aria-label={t(page.title)}>
        {page.heroImage ? <img className="hero-still-image" src={heroAsset(page.heroImage)} alt="" aria-hidden="true" decoding="async" fetchPriority="high" /> : null}
        {page.heroVideo ? <SmartVideo className="hero-video" filename={page.heroVideo} /> : null}
        {page.heroAnimation === "colorTiles" ? <ColorHeroAnimation /> : null}
        {hasSubsidiaryHero ? <SubsidiaryHeroAnimation /> : null}
        {page.heroLibrary ? <LibraryHeroBackground variant={page.heroLibrary} /> : null}
        {page.heroLogo ? <HeroLogoLockup source={page.heroLogo} /> : null}
        <span className="hero-number">{page.number}</span>
        <h1 className="hero-title">{t(page.title)}</h1>
      </header>

      <section className="intro-panel">
        <p>{t(page.intro)}</p>
      </section>

      {page.sections.map((section) => (
        <ContentSection key={section.id} section={section} navigate={navigate} activePageId={activePageId} />
      ))}

      <EndLinks activePageId={activePageId} navigate={navigate} />
    </article>
  );
}

function ContentSection({ section, navigate, activePageId }) {
  const cardsBeforeAssets = section.cards && section.cardsPlacement !== "afterAssets";
  const cardsAfterAssets = section.cards && section.cardsPlacement === "afterAssets";

  return (
    <section className="content-section" id={section.id}>
      <div className="section-title">
        <h2 tabIndex={-1}>{t(section.title)}</h2>
      </div>
      <div className="section-body">
        {section.lead ? <p className="lead-copy">{t(section.lead)}</p> : null}
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
        {section.keywords && !section.positioningShowcase ? <KeywordWall items={section.keywords} /> : null}
        {section.positioningShowcase ? <PositioningShowcase /> : null}
        {section.directory ? <SectionDirectory navigate={navigate} activePageId={activePageId} /> : null}
        {section.examples ? <ExampleGrid items={section.examples} /> : null}
        {cardsBeforeAssets ? <CardGrid items={section.cards} /> : null}
        {section.rules ? <RuleList items={section.rules} /> : null}
        {section.specs ? <SpecGrid items={section.specs} /> : null}
        {section.logos ? <LogoLibrary items={section.logos} /> : null}
        {section.subsidiaryLogos ? <SubsidiaryLogoLibrary setId={section.subsidiaryLogos} /> : null}
        {section.preAssetImages ? <AssetImageGrid items={section.preAssetImages} mode={section.preAssetImageMode} /> : null}
        {section.palette ? <PaletteGrid colors={section.palette} /> : null}
        {section.typeSamples ? <TypeSpecimens items={section.typeSamples} /> : null}
        {section.fontWorkbench ? <FontWorkbench /> : null}
        {section.regimePalette ? <RegimePalette items={section.regimePalette} /> : null}
        {section.regimeSigns ? <RegimeSignLibrary /> : null}
        {section.madeSigns ? <MadeSignLibrary /> : null}
        {section.madeFarEastSigns ? <MadeSignLibrary variantSet="far-east" /> : null}
        {section.assetImages ? <AssetImageGrid items={section.assetImages} mode={section.assetImageMode} /> : null}
        {section.merchGallery ? <MerchGallery items={section.merchGallery} /> : null}
        {cardsAfterAssets ? <CardGrid items={section.cards} /> : null}
        {section.photoCredit ? (
          <footer className="photo-credit" aria-label={t("Сведения об авторе фотографии")}>
            <span>{t("Автор фото:")} <strong>{t(section.photoCredit.author)}</strong></span>
            <span>{t("Источник:")} {t(section.photoCredit.source)}</span>
          </footer>
        ) : null}
        {section.resourceLinks ? <ResourceLinks keys={section.resourceLinks} /> : null}
        {section.typografDemo ? <TypografDemo /> : null}
        {section.contacts ? <ContactBlock items={section.contacts} /> : null}
        {section.contactCta ? <ContactCta item={section.contactCta} /> : null}
      </div>
    </section>
  );
}


function KeywordWall({ items }) {
  return (
    <div className="keyword-wall">
      {items.map((item) => (
        <span key={item}>{t(item)}</span>
      ))}
    </div>
  );
}

function ExampleGrid({ items }) {
  return (
    <div className="example-grid">
      {items.map((item) => (
        <code key={item}>{t(item)}</code>
      ))}
    </div>
  );
}

function CardGrid({ items }) {
  return (
    
      <motion.div className="card-grid">
        {items.map((item, index) => (
          <motion.article className="info-card" key={`${item.title}-${index}`} whileHover={{ y: -2 }}>
            <h3>{t(item.title)}</h3>
            <p>{t(item.text)}</p>
          </motion.article>
        ))}
      </motion.div>
    
  );
}

function PositioningShowcase() {
  const promiseTags = ["ближе к будущему", "ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"];

  return (
    <div className="positioning-showcase">
      <div className="positioning-promise">
        <div>
          <span>{t("Бренд-обещание")}</span>
          <strong>{t("Дальний Восток и Арктика — ближе к будущему")}</strong>
        </div>
        <div className="positioning-tag-cloud" aria-label={t("Смысловые направления")}>
          {promiseTags.map((tag) => (
            <em key={tag}>{t(tag)}</em>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionDirectory({ navigate, activePageId }) {
  return (
    
      <motion.div className="section-directory">
        {pagesData.map((page) => {
          const isCurrent = activePageId === page.id;
          const hasCover = Boolean(page.heroVideo || page.heroImage);
          const hasStillCover = Boolean(page.heroImage);
          const hasMotionCover = page.heroAnimation === "colorTiles";
          const hasLibraryCover = Boolean(page.heroLibrary);

          return (
            <motion.button
              className="directory-card"
              data-current={isCurrent}
              key={page.id}
              type="button"
             
              onClick={() => navigate(page.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={t("Открыть раздел " + (page.directoryTitle || page.title))}
            >
              <div data-topic={page.id} className={`directory-visual ${hasCover || hasMotionCover || hasLibraryCover ? "has-cover" : ""} ${hasMotionCover ? "has-motion-cover" : ""} ${hasLibraryCover ? "has-library-cover" : ""} ${hasStillCover ? "has-still-cover" : ""}`} aria-hidden="true">
                {page.heroVideo ? <SmartVideo className="directory-video" filename={page.heroVideo} /> : null}
                {page.heroImage ? <img className="directory-still-image" src={heroAsset(page.heroImage)} alt="" loading="lazy" decoding="async" /> : null}
                {hasMotionCover ? <ColorHeroAnimation /> : null}
                {hasLibraryCover ? <LibraryHeroBackground variant={page.heroLibrary} miniature /> : null}
                {hasCover || hasMotionCover || hasLibraryCover ? null : <div className="directory-fallback" />}
              </div>
              <div className="directory-copy">
                <h3>{t(page.directoryTitle || page.title)}</h3>
                <p>{t(page.directoryDescription || page.intro)}</p>
                <small>
                  <span>{t("Открыть раздел")}</span>
                  <UiIcon icon={ICONS.arrowRight} className="directory-arrow" />
                </small>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    
  );
}


export { GuidelinePage };
