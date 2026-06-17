import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0f172a",
    textSecondary: "#60646C",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    border: "#e5e7eb",
    primary: "#059669",
    primaryDark: "#047857",
    danger: "#dc2626",
  },
  dark: {
    text: "#ffffff",
    textSecondary: "#B0B4BA",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    border: "#2E3135",
    primary: "#10b981",
    primaryDark: "#059669",
    danger: "#f87171",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
