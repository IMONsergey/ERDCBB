import { copyText } from "../lib/clipboard.js";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { rasterAsset, ICONS, t, fontFamilies, pagesData } from "../data/brandbook.js";
import { UiIcon } from "./UiIcon.jsx";

function RuleList({ items }) {
  return (
    <div className="rule-list">
      {items.map((item, index) => (
        <article key={`${item.label}-${index}`}>
          <strong>{t(item.label)}</strong>
          <p>{t(item.text)}</p>
        </article>
      ))}
    </div>
  );
}

function SpecGrid({ items }) {
  return (
    <div className="spec-grid">
      {items.map((spec) => (
        <article key={spec.title}>
          <h3>{t(spec.title)}</h3>
          <ul>
            {spec.items.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function PaletteGrid({ colors }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyState, setCopyState] = useState({ key: null, status: null });
  useEffect(() => {
    if (!copyState.status) return undefined;
    const timeout = window.setTimeout(() => setCopyState({ key: null, status: null }), 1900);
    return () => window.clearTimeout(timeout);
  }, [copyState]);
  const selected = colors[selectedIndex] || colors[0];

  async function copyHex(hex) {
    try {
      await copyText(hex);
      setCopyState({ key: hex, status: "success" });
    } catch {
      setCopyState({ key: hex, status: "error" });
    }
  }

  return (
    <LayoutGroup>
      <div className="palette-stage" style={{ "--active-color": selected?.hex }}>
        <motion.div className="palette-grid" layout>
          {colors.map((color, index) => (
            <motion.button
              key={color.hex}
              type="button"
              layout
              aria-pressed={selectedIndex === index}
              data-active={selectedIndex === index}
              onClick={() => {
                setSelectedIndex(index);
                copyHex(color.hex);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-label={t(`Скопировать HEX цвета ${color.name}`)}
            >
              <i style={{ backgroundColor: color.hex }} />
              <strong>{t(color.name)}</strong>
              <span>HEX: {color.hex}</span>
              <span>RGB: {color.rgb}</span>
              <span>CMYK: {color.cmyk}</span>
              {color.pantone ? <span>{color.pantone}</span> : null}
              <span className="copy-action" role="status" aria-live="polite" data-copied={copyState.key === color.hex && copyState.status === "success"}>
                <UiIcon icon={copyState.key === color.hex && copyState.status === "success" ? ICONS.check : ICONS.copy} className="copy-action-icon" />
                <span>{t(copyState.key === color.hex ? copyState.status === "success" ? "Скопировано" : "Ошибка копирования" : "Скопировать HEX")}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

function TypeSpecimens({ items }) {
  return (
    <div className="type-stack">
      {items.map((item) => (
        <TypeSpecimen key={item} title={item} />
      ))}
    </div>
  );
}

function TypeSpecimen({ title }) {
  const variant = title.includes("Tsars") ? "tsars" : title.includes("Serif") ? "serif" : "norms";
  const copy = variant === "tsars" ? "Благодарность за вклад в развитие" : "Коммуникация должна быть точной";

  return (
    <article className={`type-specimen is-${variant}`}>
      <span>{title}</span>
      <p>{t(copy)}</p>
      <em>{t(variant === "tsars" ? "Гарнитура для наградных документов." : "Фирменная шрифтовая система КРДВ.")}</em>
    </article>
  );
}

function getDefaultFontIndex(family) {
  const index = family.files.findIndex((file) => file.file === family.defaultFile);
  return index >= 0 ? index : 0;
}

function FontWorkbench() {
  const [familyId, setFamilyId] = useState("norms");
  const selectedFamily = fontFamilies.find((family) => family.id === familyId) || fontFamilies[0];
  const [styleIndex, setStyleIndex] = useState(getDefaultFontIndex(selectedFamily));
  const [previewSize, setPreviewSize] = useState(64);
  const [sample, setSample] = useState(selectedFamily.sample);
  const selectedStyle = selectedFamily.files[styleIndex] || selectedFamily.files[0];
  const fallback = selectedFamily.id === "tsars" || selectedFamily.id === "serif" ? "Georgia, serif" : "Arial, sans-serif";
  const preferredStyles = ["Regular", "Medium", "DemiBold", "Bold", "Black"];
  const styleOptions = selectedFamily.files.filter((file) => preferredStyles.includes(file.label) || file.file === selectedStyle?.file);

  function selectFamily(family) {
    setFamilyId(family.id);
    setStyleIndex(getDefaultFontIndex(family));
    setSample((current) => (current === selectedFamily.sample ? family.sample : current));
  }

  return (
    <div className="font-workbench">
      <div className="font-preview-panel">
        <div className="font-preview-meta">
          <span>{t(selectedFamily.role)}</span>
          <em>{selectedStyle ? `${selectedStyle.label} · ${selectedStyle.weight}` : t("Лицензионный пакет")}</em>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedFamily.id}-${selectedStyle?.file || "missing"}`}
            className="font-preview-sample"
            style={{
              "--preview-size": `${previewSize}px`,
              fontFamily: `"${selectedFamily.cssFamily}", ${fallback}`,
              fontWeight: selectedStyle?.weight || 400,
              fontStyle: selectedStyle?.style || "normal",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {t(sample || selectedFamily.sample)}
          </motion.div>
        </AnimatePresence>
        <p>{t(selectedFamily.description)}</p>
        {selectedFamily.unavailable ? <small>{t(selectedFamily.unavailable)}</small> : null}
      </div>

      <div className="font-workbench-controls">
        <div className="font-family-tabs" role="group" aria-label={t("Семейства шрифтов")}>
          {fontFamilies.map((family) => (
            <button
              key={family.id}
              type="button"
              aria-pressed={selectedFamily.id === family.id}
              data-active={selectedFamily.id === family.id}
              onClick={() => selectFamily(family)}
            >
              <strong>{family.title}</strong>
              <span>{t(family.role)}</span>
            </button>
          ))}
        </div>

        <label className="font-preview-input">
          <span>{t("Фраза для проверки")}</span>
          <input
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          />
        </label>

        <div className="font-style-chips" role="group" aria-label={t("Начертания")}>
          <span>{t("Начертание")}</span>
          {styleOptions.length ? (
            <div>
              {styleOptions.map((file) => {
                const index = selectedFamily.files.findIndex((item) => item.file === file.file);
                return (
                  <button key={file.file} type="button" aria-pressed={selectedStyle?.file === file.file} data-active={selectedStyle?.file === file.file} onClick={() => setStyleIndex(index)}>
                    {file.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p>{t("Для Serif-семейства используется отдельный лицензионный пакет TypeType.")}</p>
          )}
        </div>

        <label className="font-size-control">
          <span>{t("Размер")}</span>
          <strong>{previewSize}px</strong>
          <input
            type="range"
            min="32"
            max="104"
            value={previewSize}
            onChange={(event) => setPreviewSize(Number(event.target.value))}
          />
        </label>

      </div>
    </div>
  );
}

function RegimePalette({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyState, setCopyState] = useState({ key: null, status: null });
  useEffect(() => {
    if (!copyState.status) return undefined;
    const timeout = window.setTimeout(() => setCopyState({ key: null, status: null }), 1900);
    return () => window.clearTimeout(timeout);
  }, [copyState]);
  const selected = items[selectedIndex] || items[0];

  async function copyHex(item) {
    try {
      await copyText(item.color);
      setCopyState({ key: item.short, status: "success" });
    } catch {
      setCopyState({ key: item.short, status: "error" });
    }
  }

  return (
    <LayoutGroup>
      <div className="regime-palette-stage" style={{ "--active-regime-color": selected?.color }}>
        <motion.div className="regime-palette" layout>
          {items.map((item, index) => (
            <motion.button
              key={item.short}
              type="button"
              layout
              data-active={selectedIndex === index}
              aria-pressed={selectedIndex === index}
              style={{ "--regime-color": item.color }}
              onClick={() => {
                setSelectedIndex(index);
                copyHex(item);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-label={t(`Скопировать HEX цвета ${item.short}`)}
            >
              <i />
              <strong>{t(item.short)}</strong>
              <span>{t(item.title)}</span>
              <em>{item.color}</em>
              <span className="copy-action" role="status" aria-live="polite" data-copied={copyState.key === item.short && copyState.status === "success"}>
                <UiIcon icon={copyState.key === item.short && copyState.status === "success" ? ICONS.check : ICONS.copy} className="copy-action-icon" />
                <span>{t(copyState.key === item.short ? copyState.status === "success" ? "Скопировано" : "Ошибка копирования" : "Скопировать HEX")}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

function TypografDemo() {
  const [value, setValue] = useState("АО КРДВ помогает бизнесу и гражданам на Дальнем Востоке и в Арктике.");
  const output = useMemo(() => t(value), [value]);

  return (
    <div className="typograf-demo">
      <label>
        <span>{t("Ввод")}</span>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <div>
        <span>{t("Результат")}</span>
        <p>{output}</p>
      </div>
    </div>
  );
}

function ContactBlock({ items }) {
  return (
    <address className="contact-block">
      <strong>{t(items.organization)}</strong>
      <a href={"https://" + items.website} target="_blank" rel="noopener noreferrer">{items.website}</a>
      <small>{t("Руководство обновлено")} <time dateTime={items.updatedAt}>{items.updatedLabel}</time></small>
    </address>
  );
}

function ContactCta({ item }) {
  return (
    <a className="contact-cta" href={item.href} target="_blank" rel="noopener noreferrer">
      <span className="contact-cta-copy">
        <span>{t(item.title)}</span>
        <p>{t(item.text)}</p>
        <strong>
          {t(item.label)}
          <UiIcon icon={ICONS.arrowRight} className="contact-cta-icon" />
        </strong>
      </span>
      {item.image ? (
        <span className="contact-cta-visual" aria-hidden="true">
          <img src={rasterAsset(item.image)} alt="" loading="lazy" />
        </span>
      ) : null}
    </a>
  );
}

function EndLinks({ activePageId, navigate }) {
  const currentIndex = pagesData.findIndex((page) => page.id === activePageId);
  const previous = pagesData[currentIndex - 1] || pagesData[pagesData.length - 1];
  const next = pagesData[currentIndex + 1] || pagesData[0];

  return (
    <nav className="end-links" aria-label={t("Переходы между разделами")}>
      <button type="button" onClick={() => navigate(previous.id)}>
        <span>{t(`${previous.number} ${previous.title}`)}</span>
        <em>
          <UiIcon icon={ICONS.arrowLeft} className="end-link-icon" />
          {t("предыдущий раздел")}
        </em>
      </button>
      <button type="button" onClick={() => navigate(next.id)}>
        <span>{t(`${next.number} ${next.title}`)}</span>
        <em>
          {t("следующий раздел")}
          <UiIcon icon={ICONS.arrowRight} className="end-link-icon" />
        </em>
      </button>
    </nav>
  );
}

export { RuleList, SpecGrid, PaletteGrid, TypeSpecimens, FontWorkbench, RegimePalette, TypografDemo, ContactBlock, ContactCta, EndLinks };
