import { motion } from "motion/react";
import { rasterAsset, logoAsset, regimeSignAsset, subsidiaryAsset, madeSignAsset, ICONS, t, downloadResources, logoFormats, regimeSignFormats, subsidiaryFormats, madeSignFormats, logoVariants, subsidiaryLogoSets, regimeSignLogos, madeSignVariants, madeFarEastVariants } from "../data/brandbook.js";
import { UiIcon } from "./UiIcon.jsx";

function LogoLibrary({ items }) {
  const variants = items.map((id) => logoVariants[id]).filter(Boolean);

  return (
    
      <motion.div className="logo-library" data-count={variants.length}>
        {variants.map((variant) => {
          const downloads = <LogoDownloads variant={variant} />;

          return (
            <motion.article className={`logo-card is-${variant.kind}`} key={variant.preview} whileHover={{ y: -2 }}>
              <div className="logo-preview">
                <img src={logoAsset(variant.preview)} alt={t(variant.title)} loading="lazy" decoding="async" />
              </div>
              <div className="logo-card-copy">
                <span>{t(variant.role)}</span>
                <h3>{t(variant.title)}</h3>
                <p>{t(variant.description)}</p>
                {variant.inlineDownloads ? downloads : null}
              </div>
              {variant.inlineDownloads ? null : downloads}
            </motion.article>
          );
        })}
      </motion.div>
    
  );
}

function LogoDownloads({ variant }) {
  return (
    <div className="logo-downloads" role="group" aria-label={t(`Скачать ${variant.title}`)}>
      <strong>{t("Скачать")}</strong>
      <div>
        {logoFormats
          .filter((format) => variant.files[format])
          .map((format) => (
            <LogoDownloadLink key={format} file={variant.files[format]} format={format} title={variant.title} />
          ))}
      </div>
    </div>
  );
}

function SubsidiaryLogoLibrary({ setId }) {
  const items = subsidiaryLogoSets[setId] || [];

  return (
    
      <motion.div className={`subsidiary-logo-grid is-${setId}`} data-count={items.length}>
        {items.map((item) => (
          <motion.article className={`subsidiary-logo-card is-${item.orientation}`} key={item.preview} whileHover={{ y: -2 }}>
            <div className="subsidiary-logo-preview">
              <img src={subsidiaryAsset(item.preview)} alt={t(item.title)} loading="lazy" decoding="async" />
            </div>
            <div className="subsidiary-logo-copy">
              <span>{t(item.versionLabel)}</span>
              <h3>{t(item.title)}</h3>
              {item.note ? <p>{t(item.note)}</p> : null}
              <div className="logo-downloads" role="group" aria-label={t(`Скачать ${item.title}`)}>
                <strong>{t("Скачать")}</strong>
                <div>
                  {subsidiaryFormats.map((format) => (
                    <LogoDownloadLink
                      key={format}
                      file={item.files[format]}
                      format={format}
                      title={item.title}
                      asset={subsidiaryAsset}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    
  );
}

function RegimeSignLibrary() {
  return (
    
      <motion.div className="regime-sign-library">
        {regimeSignLogos.map((item) => (
          <motion.article className="regime-sign-card" key={item.slug} style={{ "--sign-color": item.color }} whileHover={{ y: -2 }}>
            <div className="regime-sign-preview">
              <img src={regimeSignAsset(item.preview)} alt={t(item.short)} loading="lazy" decoding="async" />
            </div>
            <div className="regime-sign-copy">
              <span>{t(item.short)}</span>
              <h3>{t(item.title)}</h3>
              <p>{t(item.description)}</p>
              <div className="logo-downloads" role="group" aria-label={t(`Скачать знак ${item.short}`)}>
                <strong>{t("Скачать")}</strong>
                <div>
                  {regimeSignFormats.map((format) => (
                    <LogoDownloadLink key={format} file={item.files[format]} format={format} title={item.title} asset={regimeSignAsset} />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    
  );
}

function MadeSignLibrary({ variantSet = "tor-spv" }) {
  const isFarEast = variantSet === "far-east";
  const items = isFarEast ? madeFarEastVariants : madeSignVariants;
  return (
    <motion.div className={"made-sign-library" + (isFarEast ? " is-far-east" : "")}>
        {items.map((item) => (
          <motion.article className="made-sign-card" data-tone={item.tone} key={item.slug} whileHover={{ y: -2 }}>
            <div className="made-sign-preview">
              <img src={madeSignAsset(item.preview)} alt={t(item.title)} loading="lazy" decoding="async" />
            </div>
            <div className="made-sign-copy">
              <span>{t("Знак")}</span>
              <h3>{t(item.title)}</h3>
              <div className="logo-downloads" role="group" aria-label={t(`Скачать ${item.title}`)}>
                <strong>{t("Скачать")}</strong>
                <div>
                  {madeSignFormats.filter((format) => item.files[format]).map((format) => (
                    <LogoDownloadLink key={format} file={item.files[format]} format={format} title={item.title} asset={madeSignAsset} />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    
  );
}

function LogoDownloadLink({ file, format, title, asset = logoAsset }) {
  return (
    <a
      href={asset(file)}
      download={file}
      aria-label={t(`Скачать ${title} в формате ${format.toUpperCase()}`)}
    >
      <UiIcon icon={ICONS.download} className="format-icon" />
      <span>{format.toUpperCase()}</span>
    </a>
  );
}

function ResourceLinks({ keys }) {
  const links = keys.map((key) => downloadResources[key]).filter(Boolean);

  return (
    <div className={`resource-links ${links.length === 1 ? "is-single" : ""}`}>
      {links.map((item) => (
        <motion.a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
          <div>
            <strong>{t(item.title)}</strong>
            <p>{t(item.description)}</p>
          </div>
          <em>
            {t("Открыть архив")}
            <UiIcon icon={ICONS.arrowRight} className="resource-link-icon" />
          </em>
        </motion.a>
      ))}
    </div>
  );
}

function AssetImageGrid({ items, mode = "grid" }) {
  const isLeafletGallery = mode === "leaflets";
  const imagesOnly = mode === "imagesOnly" || mode === "stack" || isLeafletGallery;

  return (
    
      <motion.div className={`asset-image-grid is-${mode}`}>
        {items.map((item) => (
          <motion.article className={`asset-image-card ${item.wide ? "is-wide" : ""} ${item.contained ? "is-contained" : ""} ${item.embeddedText ? "has-embedded-text" : ""}`} key={item.file}>
            <div className="asset-image-frame">
              {isLeafletGallery ? (
                <a
                  className="leaflet-cover-link"
                  href={rasterAsset(item.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("Открыть обложку в полном размере: " + item.title)}
                >
                  <img src={rasterAsset(item.preview || item.file)} alt={t(item.title)} loading="lazy" decoding="async" />
                </a>
              ) : (
                <img src={rasterAsset(item.file)} alt={t(item.title)} loading="lazy" decoding="async" />
              )}
            </div>
            {item.embeddedText || imagesOnly ? null : (
              <div className="asset-image-copy">
                <h3>{t(item.title)}</h3>
                <p>{t(item.caption)}</p>
              </div>
            )}
          </motion.article>
        ))}
      </motion.div>
    
  );
}

export { LogoLibrary, SubsidiaryLogoLibrary, RegimeSignLibrary, MadeSignLibrary, ResourceLinks, AssetImageGrid };
