import { rasterAsset, ICONS, t } from "../data/brandbook.js";
import { UiIcon } from "./UiIcon.jsx";

function MerchGallery({ items }) {
  return (
    <div className="merch-showcase">
      <div className="merch-showcase-toolbar">
        <span>{t("Все слайды презентации")} · {items.length}</span>
      </div>
      <div className="merch-gallery">
        {items.map((item) => (
          <a
            className="merch-gallery-card"
            href={rasterAsset(item.file)}
            target="_blank"
            rel="noopener noreferrer"
            key={item.file}
            aria-label={t("Открыть слайд " + String(item.slide).padStart(2, "0") + " в полном размере: " + item.title)}
          >
            <div className="merch-gallery-media">
              <img src={rasterAsset(item.preview)} alt={t(item.title)} loading="lazy" decoding="async" />
            </div>
            <span className="merch-gallery-caption">
              <span className="merch-gallery-label">
                <span className="merch-gallery-index">{String(item.slide).padStart(2, "0")}</span>
                <span>{t(item.title)}</span>
              </span>
              <UiIcon icon={ICONS.arrowRight} className="merch-link-arrow" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export { MerchGallery };
