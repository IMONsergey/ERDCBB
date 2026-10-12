import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { logoAsset, subsidiaryAsset, LOTUS_MARK_PATHS, t, colorHeroTiles, colorHeroHoldDuration, smoothStepEase, colorHeroTileStates, subsidiaryHeroLogos } from "../data/brandbook.js";

function BrandPreloader() {
  const columns = Array.from({ length: 6 });
  const rows = Array.from({ length: 5 });

  return (
    <motion.div
      className="brand-preloader"
      role="status"
      aria-label={t("Загрузка брендбука")}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 } }}
    >
      <div className="preloader-blueprint" aria-hidden="true">
        {columns.map((_, index) => (
          <motion.i
            className="preloader-v-line"
            key={`v-${index}`}
            style={{ left: `${(index / (columns.length - 1)) * 100}%` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        {rows.map((_, index) => (
          <motion.i
            className="preloader-h-line"
            key={`h-${index}`}
            style={{ top: `${(index / (rows.length - 1)) * 100}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.12 + index * 0.055, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
      <motion.div className="preloader-frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
        <motion.p className="preloader-statement" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}>
          {t("Руководство по использованию фирменного стиля АО «КРДВ»")}
        </motion.p>
        <motion.img
          layoutId="krdv-menu-logo"
          className="preloader-logo"
          src={logoAsset("krdv-logo-ru-square.svg")}
          alt=""
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroLogoLockup({ source, compact = false }) {
  return (
    <div className={`hero-cover-logo ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <svg className="hero-cover-mark" viewBox="0 0 125.09 68.99" focusable="false">
        <g className="hero-cover-mark-outline">
          {LOTUS_MARK_PATHS.map((path) => (
            <path key={`outline-${path}`} d={path} pathLength={1} />
          ))}
        </g>
        <g className="hero-cover-mark-fill">
          {LOTUS_MARK_PATHS.map((path) => (
            <path key={`fill-${path}`} d={path} />
          ))}
        </g>
      </svg>
      <span className="hero-cover-wordmark">
        <img src={logoAsset(source)} alt="" />
      </span>
    </div>
  );
}

function ColorHeroAnimation() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    let cancelled = false;
    let ctx;
    let timeline;
    let visibilityObserver;

    import("gsap").then(({ gsap }) => {
      if (cancelled || !rootRef.current) return;

      ctx = gsap.context(() => {
        const tiles = gsap.utils.toArray(".color-hero-tile", rootRef.current);
        const firstState = colorHeroTileStates[0];
        const toRect = (rects) => ({
          left: (index) => `${rects[index].left}%`,
          top: (index) => `${rects[index].top}%`,
          width: (index) => `${rects[index].width}%`,
          height: (index) => `${rects[index].height}%`,
        });

        gsap.set(tiles, toRect(firstState));

        timeline = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 0.22,
          defaults: { duration: 4.6, ease: smoothStepEase },
        });

        colorHeroTileStates.slice(1).forEach((state) => {
          timeline.to(tiles, toRect(state));
          timeline.to({}, { duration: colorHeroHoldDuration });
        });

        timeline.to(tiles, toRect(firstState));
        timeline.to({}, { duration: colorHeroHoldDuration });
      }, rootRef);

      if ("IntersectionObserver" in window) {
        visibilityObserver = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && document.visibilityState === "visible") timeline?.resume();
          else timeline?.pause();
        }, { threshold: 0.05 });
        visibilityObserver.observe(rootRef.current);
      } else {
        timeline?.resume();
      }
    });

    return () => {
      cancelled = true;
      visibilityObserver?.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <div className="color-hero-animation" ref={rootRef} aria-hidden="true">
      {colorHeroTiles.map((tile, index) => {
        const rect = colorHeroTileStates[0][index];
        return (
          <span
            className="color-hero-tile"
            key={tile.id}
            style={{
              "--tile-color": tile.color,
              left: `${rect.left}%`,
              top: `${rect.top}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function SubsidiaryHeroAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % subsidiaryHeroLogos.length);
    }, 1850);

    return () => window.clearInterval(timer);
  }, []);

  const logo = subsidiaryHeroLogos[activeIndex];

  return (
    <div className="subsidiary-hero-lockup" aria-hidden="true">
      <img className="subsidiary-hero-fixed" src={subsidiaryAsset(subsidiaryHeroLogos[0].file)} alt="" />
      <span className="subsidiary-hero-region-window">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={logo.file}
            src={subsidiaryAsset(logo.file)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
      </span>
    </div>
  );
}

function LibraryMiniPreview({ variant }) {
  return (
    <div className={`library-hero-bg is-miniature is-${variant}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

const LazyColorPanels = lazy(() =>
  import("@paper-design/shaders-react").then(({ ColorPanels }) => ({ default: ColorPanels })),
);

// Decorative WebGL is optional. If unavailable, the CSS artwork remains visible.
function canUseWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    const supported = Boolean(gl.getParameter(gl.VERSION));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

class OptionalShaderBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function OverviewPanels() {
  const targetRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersects = false;
    let supported;
    const sync = () => {
      if (!intersects || preference.matches) {
        setVisible(false);
        return;
      }
      if (supported === undefined) supported = canUseWebGL2();
      setVisible(supported);
    };
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          intersects = entry.isIntersecting;
          sync();
        }, { threshold: 0.05 })
      : null;

    if (observer && targetRef.current) observer.observe(targetRef.current);
    else {
      intersects = true;
      sync();
    }
    preference.addEventListener?.("change", sync);
    return () => {
      observer?.disconnect();
      preference.removeEventListener?.("change", sync);
    };
  }, []);

  return (
    <div ref={targetRef} className="library-hero-bg is-overview-panels" aria-hidden="true">
      <div className="library-shader-fallback" />
      {visible ? (
        <OptionalShaderBoundary>
          <Suspense fallback={null}>
            <LazyColorPanels
            className="library-shader"
            fit="cover"
            maxPixelCount={2400000}
            minPixelRatio={1}
            style={{ width: "100%", height: "100%" }}
            colors={["#0056a2", "#22a8e0", "#9ec6eb", "#de2327"]}
            colorBack="#001d37"
            density={1.18}
            length={1.7}
            angle1={0.34}
            angle2={-0.18}
            blur={0.06}
            edges
            speed={0.16}
            gradient={0.18}
            />
          </Suspense>
        </OptionalShaderBoundary>
      ) : null}
    </div>
  );
}

function LibraryHeroBackground({ variant, miniature = false }) {
  if (!variant) return null;
  if (miniature) return <LibraryMiniPreview variant={variant} />;

  switch (variant) {
    case "overview-panels":
      return <OverviewPanels />;
    default:
      return null;
  }
}

export { BrandPreloader, HeroLogoLockup, ColorHeroAnimation, SubsidiaryHeroAnimation, LibraryHeroBackground };
