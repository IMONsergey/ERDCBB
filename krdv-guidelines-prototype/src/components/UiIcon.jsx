import { MorphIcon } from "morphicons/react";

function UiIcon({ icon, className = "", label, size = 18 }) {
  return (
    <MorphIcon
      icon={icon}
      size={size}
      strokeWidth={1.7}
      absoluteStrokeWidth
      reducedMotion="user"
      spring="snappy"
      className={`ui-icon ${className}`}
      label={label}
    />
  );
}

export { UiIcon };
