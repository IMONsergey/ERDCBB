import { useEffect, useRef, useState } from "react";
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
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = innerRef.current;
    if (!element) return undefined;

    const shell = element.parentElement;
    let firstFrame = 0;
    let secondFrame = 0;

    if (isOpen) {
      setHeight(0);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setHeight(element.scrollHeight);
        });
      });
    } else {
      setHeight(shell?.getBoundingClientRect().height || element.scrollHeight);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setHeight(0);
        });
      });
    }

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [group.sections, isOpen]);

  return (
    <div className="nav-children-shell" aria-hidden={!isOpen} style={{ height }}>
      <div className="nav-children" ref={innerRef}>
        {group.sections.map((section) => (
          <button key={section.id} type="button" tabIndex={isOpen ? 0 : -1} onClick={() => (activePageId === group.id ? jumpTo(section.id) : navigate(group.id))}>
            {t(section.navTitle || section.title)}
          </button>
        ))}
      </div>
    </div>
  );
}

export { Sidebar };
