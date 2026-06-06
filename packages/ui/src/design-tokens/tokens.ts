// Design tokens as JS constants (mirrors the CSS variables)
export const colors = {
  royalGold: "#B8860B",
  royalGoldLight: "#DAA520",
  maroon: "#6B1A1A",
  maroonDeep: "#4A0E0E",
  desertSand: "#F5E6C8",
  palaceIvory: "#FDF6E3",
  jodhpurBlue: "#1A3A5C",
  emerald: "#1A6B4A",
  saffron: "#E8820C",
} as const;

export const fonts = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;
