import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { ICONS, t, pagesById, getInitialPage } from "./data/brandbook.js";
import { Sidebar } from "./components/Navigation.jsx";
import { BrandPreloader } from "./components/Hero.jsx";
import { GuidelinePage } from "./components/GuidelinePage.jsx";
import { UiIcon } from "./components/UiIcon.jsx";

function App() {
  const [activePageId, setActivePageId] = useState(getInitialPage);
  const [openGroup, setOpenGroup] = useState(getInitialPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches,
  );
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window === "undefined") return false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Only the un-routed landing page receives the optional intro.
    // All deep links and reduced-motion environments display content immediately.
    return !reducedMotion && window.location.hash === "";
  });
  const activePage = pagesById[activePageId] || pagesById.overview;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || !menuOpen) return undefined;

    const page = document.getElementById("page");
    const sidebar = sidebarRef.current;
    if (page) page.inert = true;
    sidebar?.querySelector('.nav-parent[aria-current="page"]')?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;

      const controls = [menuButtonRef.current, ...(
        sidebar?.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"])') || []
      )].filter((element) => element && !element.closest('[aria-hidden="true"]'));
      if (!controls.length) return;

      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault();
        controls[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (page) page.inert = false;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, menuOpen]);

  useEffect(() => {
    if (!showPreloader) return undefined;
    const timeout = window.setTimeout(() => setShowPreloader(false), 1100);
    return () => window.clearTimeout(timeout);
  }, [showPreloader]);

  useEffect(() => {
    const onHashChange = () => {
      const next = getInitialPage();
      setActivePageId(next);
      setOpenGroup(next);
      setMenuOpen(false);
      document.getElementById("page")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  useEffect(() => {
    const scroller = document.getElementById("page");
    const targets = [...(scroller?.querySelectorAll(".intro-panel, .content-section, .end-links") || [])];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!targets.length) return undefined;

    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-index", String(Math.min(index, 8)));
      target.dataset.reveal = "pending";
      delete target.dataset.inview;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => {
        target.dataset.inview = "true";
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.inview = "true";
          observer.unobserve(entry.target);
        });
      },
      {
        root: scroller,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    const frame = requestAnimationFrame(() => {
      targets.forEach((target) => observer.observe(target));
      targets.slice(0, 2).forEach((target) => {
        target.dataset.inview = "true";
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activePageId]);

  function navigate(pageId) {
    const nextHash = `#/${pageId}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
    setActivePageId(pageId);
    setOpenGroup(pageId);
    setMenuOpen(false);
    document.getElementById("page")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function jumpTo(sectionId) {
    const target = document.getElementById(sectionId);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
    setMenuOpen(false);
  }

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
      <LayoutGroup id="brandbook-shell">
        <AnimatePresence>{showPreloader ? <BrandPreloader /> : null}</AnimatePresence>
        <div className={`guideline-shell ${menuOpen ? "nav-open" : ""}`}>
          <button ref={menuButtonRef} className="mobile-menu-button" type="button" aria-controls="brandbook-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            <span>{t(menuOpen ? "Закрыть" : "Меню")}</span>
            <UiIcon icon={menuOpen ? ICONS.close : ICONS.menu} className="menu-icon" />
          </button>
          <Sidebar activePageId={activePageId} openGroup={openGroup} setOpenGroup={setOpenGroup} navigate={navigate} jumpTo={jumpTo} preloading={showPreloader} sidebarRef={sidebarRef} inaccessible={isMobile && !menuOpen} />
          <button className="nav-backdrop" type="button" aria-label={t("Закрыть меню")} onClick={() => setMenuOpen(false)} />
          <motion.main id="page" className="page-scroll" layoutScroll tabIndex={-1}>
            <GuidelinePage key={activePageId} page={activePage} activePageId={activePageId} navigate={navigate} />
          </motion.main>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export { App };
