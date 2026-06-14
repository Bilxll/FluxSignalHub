// FLUX Traders theme
// Cream background + the dark green from the FLUX logo, with a gold accent
// for highlights (profit / TP) and a muted red for losses / SL.

export const colors = {
  background: "#F7F2E7",      // cream
  surface: "#FFFFFF",         // card background
  surfaceAlt: "#EFE8D8",      // slightly deeper cream for inputs/sections

  primary: "#0B3D1E",         // dark green from logo
  primaryLight: "#1E5A38",
  primaryDark: "#072813",

  accent: "#C9A227",          // gold accent

  text: "#16261C",            // near-black green-tinted text
  textMuted: "#6E7B72",
  border: "#E1D8C4",

  success: "#1E7A3F",         // TP / profit
  danger: "#B3422F",          // SL / loss
  warning: "#C9A227",         // BE / pending
  info: "#2E6E8E",

  buy: "#1E7A3F",
  sell: "#B3422F",

  white: "#FFFFFF",
  black: "#000000"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32
};

export default { colors, spacing, radius, fontSizes };
