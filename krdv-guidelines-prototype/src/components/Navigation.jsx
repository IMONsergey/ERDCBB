import { motion } from "motion/react";
import { logoAsset, ICONS, t, pagesData } from "../data/brandbook.js";
import { UiIcon } from "./UiIcon.jsx";

function Sidebar({ activePageId, openGroup, setOpenGroup, navigate, jumpTo, preloading, sidebarRef, inaccessible }) {
  return (
    <aside id="brandbook-navigation" ref={sidebarRef} className="sidebar" aria-label={t("Навигация брендбука")} inert={inaccessible}>
      <button className="brand-lockup" type="button" onClick={() => navigate("overview")} aria-label={t("Открыть обзор")}>
        <motion.img layoutId={preloading ? undefined : "krdv-menu-logo"} src={logoAsset("krdv-logo-ru-square.svg")} alt={t("КРДВ")} />
      </button>

      <div className="sidebar-meta">
        <strong>{t("Руководство по фирменному стилю")}</strong>
      </div>

      <nav className="nav-list">
        {pagesData.map((group) => {
          const isOpen = openGroup === group.id;
          const isActive = activePageId === group.id;

          return (
            <div className={`nav-group ${isActive ? "is-active" : ""} ${isOpen ? "is-open" : ""}`} key={group.id}>
              <button
                className="nav-parent"
                type="button"
                aria-expanded={isOpen}
                aria-controls={"nav-sections-" + group.id}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (isActive) {
                    setOpenGroup(isOpen ? "" : group.id);
                    return;
                  }
                  navigate(group.id);
                }}
              >
                <span>{group.number}</span>
                <strong>{t(group.navTitle || group.title)}</strong>
                <UiIcon icon={isOpen ? ICONS.chevronUp : ICONS.chevronDown} className="nav-chevron" />
              </button>
              <NavChildren group={group} isOpen={isOpen} activePageId={activePageId} navigate={navigate} jumpTo={jumpTo} />
            </div>
          );
        })}
      </nav>

    </aside>
  );
}

function NavChildren({ group, isOpen, activePageId, navigate, jumpTo }) {
  return (
    <div
      id={"nav-sections-" + group.id}
      className="nav-children-shell"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="nav-children-clip">
        <div className="nav-children">
          {group.sections.map((section) => (
            <button
              key={section.id}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => (activePageId === group.id ? jumpTo(section.id) : navigate(group.id))}
            >
              {t(section.navTitle || section.title)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
