/**
 * Invoice/document theme definitions, extracted from the invoice preview so the
 * shared theme customizer and previews can reuse them.
 */
export type FontSize = "sm" | "md" | "lg";

export interface InvoiceTheme {
  primary: string;
  accent: string;
  fontSize: FontSize;
}

export const DEFAULT_THEME: InvoiceTheme = {
  primary: "#6538BF",
  accent: "#efebf8",
  fontSize: "md",
};

export const FONT_ZOOM: Record<FontSize, number> = { sm: 0.88, md: 1, lg: 1.12 };

export const PRESET_THEMES = [
  { name: "Purple", primary: "#6538BF", accent: "#efebf8" },
  { name: "Indigo", primary: "#4338ca", accent: "#eef2ff" },
  { name: "Blue", primary: "#1d4ed8", accent: "#eff6ff" },
  { name: "Teal", primary: "#0f766e", accent: "#f0fdfa" },
  { name: "Green", primary: "#166534", accent: "#f0fdf4" },
  { name: "Rose", primary: "#be123c", accent: "#fff1f2" },
  { name: "Orange", primary: "#c2410c", accent: "#fff7ed" },
  { name: "Slate", primary: "#1e3a5f", accent: "#f0f4f8" },
];
