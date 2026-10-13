import { useEffect, useRef } from "react";
import { heroAsset } from "../data/brandbook.js";

/** Decorative video pauses offscreen, in background tabs and for reduced motion. */
function SmartVideo({ className, filename }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !preference.matches && document.visibilityState === "visible") {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        }, { threshold: 0.05 })
      : null;

    if (observer) observer.observe(video);
    else {
      visible = true;
      sync();
    }
    preference.addEventListener?.("change", sync);
    document.addEventListener("visibilitychange", sync);
    video.addEventListener("loadeddata", sync);

    return () => {
      observer?.disconnect();
      preference.removeEventListener?.("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("loadeddata", sync);
      video.pause();
    };
  }, [filename]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={heroAsset(filename.replace(/\.mp4$/i, ".webp"))}
      preload="none"
      muted
      loop
      playsInline
      aria-hidden="true"
    >
      <source src={heroAsset(filename.replace(/\.mp4$/i, ".webm"))} type="video/webm" />
      <source src={heroAsset(filename)} type="video/mp4" />
    </video>
  );
}

export { SmartVideo };
