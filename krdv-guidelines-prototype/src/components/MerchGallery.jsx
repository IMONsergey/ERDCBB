import { rasterAsset, ICONS, t } from "../data/brandbook.js";
import { UiIcon } from "./UiIcon.jsx";

function MerchGallery({ items, boardUrl }) {
  return (
    <div className="merch-showcase">
      <div className="merch-showcase-toolbar">
        <span>{t("Подборка примеров")} · {items.length}</span>
        <a href={boardUrl} target="_blank" rel="noopener noreferrer">
          {t("Все материалы в Miro")}
          <UiIcon icon={ICONS.arrowRight} className="merch-link-arrow" />
        </a>
      </div>
      <div className="merch-gallery">
        {items.map((item) => (
          <a
            className="merch-gallery-card"
            href={rasterAsset(item.file)}
            target="_blank"
            rel="noopener noreferrer"
            key={item.file}
            aria-label={t("Открыть пример в полном размере: " + item.title)}
          >
            <div className="merch-gallery-media">
              <img src={rasterAsset(item.preview)} alt={t(item.title)} loading="lazy" decoding="async" />
            </div>
            <span className="merch-gallery-caption">
              <span>{t(item.title)}</span>
              <UiIcon icon={ICONS.arrowRight} className="merch-link-arrow" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export { MerchGallery };
