import {
  themeStyle,
  type ThemeTokens,
  type ThemeModeTokens,
  type ThemeProfile,
} from "../src/themes";

const colors = new Set([
  "--h-bg",
  "--h-surface",
  "--h-raised",
  "--h-panel",
  "--h-border",
  "--h-border-strong",
  "--h-text",
  "--h-muted",
  "--h-faint",
  "--h-accent",
  "--h-accent-hover",
  "--h-accent-text",
  "--h-on-accent",
  "--h-accent-subtle",
  "--h-success",
  "--h-warning",
  "--h-danger",
  "--h-info",
  "--h-focus",
  "--h-shadow",
  "--h-shadow-soft",
  "--h-scene-bg",
  "--h-scene-text",
  "--h-scene-muted",
  "--h-mountain-back",
  "--h-mountain-mid",
  "--h-mountain-front",
]);
export function restoreThemeProfile(
  saved: Record<string, unknown>,
  mode: "dark" | "light",
): ThemeProfile {
  const tokens = themeStyle(saved.tokens as ThemeTokens);
  if (saved.version === 2) {
    const modes = saved.modeTokens as ThemeModeTokens | undefined;
    return {
      tokens,
      modeTokens: {
        dark: themeStyle(modes?.dark),
        light: themeStyle(modes?.light),
      },
    };
  }
  // Keep the active appearance when migrating; retain the original storage record separately.
  const common: ThemeTokens = {},
    legacyColors: ThemeTokens = {};
  for (const [key, value] of Object.entries(tokens))
    (colors.has(key) ? legacyColors : common)[key as keyof ThemeTokens] = value;
  return { tokens: common, modeTokens: { [mode]: legacyColors } };
}
export function resolvedProfile(
  dark: ThemeTokens,
  light: ThemeTokens,
): ThemeProfile {
  const tokens: ThemeTokens = {},
    darkColors: ThemeTokens = {},
    lightColors: ThemeTokens = {};
  for (const key of new Set([...Object.keys(dark), ...Object.keys(light)])) {
    const name = key as keyof ThemeTokens;
    if (colors.has(key) || dark[name] !== light[name]) {
      if (dark[name] !== undefined) darkColors[name] = dark[name];
      if (light[name] !== undefined) lightColors[name] = light[name];
    } else if (dark[name] !== undefined) tokens[name] = dark[name];
  }
  return { tokens, modeTokens: { dark: darkColors, light: lightColors } };
}
export function contrastRatio(
  foreground: string | undefined,
  background: string | undefined,
): number | undefined {
  function channels(value: string | undefined) {
    if (!value) return;
    const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hex) {
      const expanded =
        hex[1].length === 3
          ? [...hex[1]].map((character) => character + character).join("")
          : hex[1];
      return [0, 2, 4].map(
        (index) => parseInt(expanded.slice(index, index + 2), 16) / 255,
      );
    }
    const rgb = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    return rgb
      ? rgb.slice(1).map((channel) => Number(channel) / 255)
      : undefined;
  }
  const a = channels(foreground),
    b = channels(background);
  if (!a || !b) return;
  const luminance = (values: number[]) =>
    values
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      )
      .reduce(
        (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
        0,
      );
  const first = luminance(a),
    second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
