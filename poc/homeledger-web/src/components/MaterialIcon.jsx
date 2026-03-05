// FILENAME: src/components/MaterialIcon.jsx
import React from "react";

/**
 * MaterialIcon component that renders a Material Symbols Outlined icon.
 *
 * @param {string} icon - The icon key (e.g., "shopping_cart", "home", "settings")
 * @param {number} size - The font size in pixels (default: 24)
 * @param {string} color - The icon color (default: "inherit")
 * @param {boolean} filled - Whether to use filled style (default: false)
 * @param {object} style - Additional inline styles
 */
function MaterialIcon({ icon, size = 24, color = "inherit", filled = false, style = {}, ...props }) {
  if (!icon) return null;

  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        verticalAlign: "middle",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      {icon}
    </span>
  );
}

export default MaterialIcon;
