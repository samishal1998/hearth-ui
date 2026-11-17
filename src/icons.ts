import type { IconDefinition } from "./themes";
export const paths: Record<string, string> = {
  apps: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  home: "m3 10 9-7 9 7v10H15v-6H9v6H3z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  left: "m15 6-6 6 6 6",
  right: "m9 6 6 6-6 6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2",
  calendar:
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM7 3v4M17 3v4M3 11h18M7 15h2M13 15h2",
  close: "m6 6 12 12M18 6 6 18",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  launch: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  check: "m5 12 4 4L19 6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
  lock: "M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3m-4 4v3",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
  server: "M3 3h18v7H3zM3 14h18v7H3zM7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5",
  providers: "M12 3v7M5 17l7-7 7 7M9 3h6v4H9zM2 17h6v4H2zM16 17h6v4h-6z",
  health: "M3 12h4l3-8 4 16 3-8h4",
  settings:
    "m10 3-1 3-3 1-3 3 2 2-2 2 3 3 3 1 1 3h4l1-3 3-1 3-3-2-2 2-2-3-3-3-1-1-3zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  menu: "M4 6h16M4 12h16M4 18h16",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  logout: "M9 4H4v16h5M10 12h11m-4-4 4 4-4 4",
  moon: "M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  down: "m6 9 6 6 6-6",
  up: "m6 15 6-6 6 6",
  info: "M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  layout: "M3 3h6v18H3zM13 3h8v7h-8zM13 14h8v7h-8z",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16",
  copy: "M8 8h13v13H8zM16 8V3H3v13h5",
  refresh:
    "M20 7v5h-5M4 17v-5h5M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  upload: "M12 15V3m-5 5 5-5 5 5M4 16v5h16v-5",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
  users:
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M2 21v-2a7 7 0 0 1 14 0v2M17 3a4 4 0 0 1 0 8M22 21v-2a7 7 0 0 0-4-6.3",
  key: "M12 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0M12 8h10M17 8v4M21 8v3",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z",
  alert: "m12 3 10 18H2zM12 9v5m0 3h.01",
  help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M9 9a3 3 0 1 1 5 2.2c-1.2.8-2 1.3-2 2.8m0 3h.01",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  play: "m7 3 14 9-14 9z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  send: "m3 3 18 9-18 9 3-9zM6 12h15",
  keyboard:
    "M3 5h18v14H3zM6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10",
  palette:
    "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.6-3.2 1.5 1.5 0 0 1 1.2-2.4H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3M7 8h.01M12 6h.01M17 8h.01M6 13h.01",
  list: "M4 6h.01M8 6h12M4 12h.01M8 12h12M4 18h.01M8 18h12",
  package: "m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5V14",
  container: "M3 5h18v14H3zM7 8v8M12 8v8M17 8v8M3 9H1m2 6H1m20-6h2m-2 6h2",
  file: "M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6",
  filter: "M3 4h18l-7 8v7l-4 2v-9z",
  error: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M9 9l6 6m0-6-6 6",
  success: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-13 0 3 3 5-6",
  save: "M4 3h13l4 4v14H3V4a1 1 0 0 1 1-1ZM7 3v6h9V3M7 21v-8h10v8",
  resend: "M3 5h12v4M3 5l6 5 6-5M3 5v13h6M20 11v4h-4M20 15a5 5 0 1 0-1 5",
  snooze: "M10 3a9 9 0 1 0 11 11M12 7v5l-3 2M16 3h5l-5 5h5",
  later: "M10 3a9 9 0 1 0 11 11M12 7v5l-3 2M15 6h7m-3-3 3 3-3 3",
  admin:
    "M3 20v-2a6 6 0 0 1 8-5.7M12 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m5 6 5 2v3c0 3-5 5-5 5s-5-2-5-5v-3z",
  link: "m10 13 4-4M8 15l-2 2a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m6 0 2-2a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0",
  unlink:
    "M12 7l3-3a3.54 3.54 0 0 1 5 5l-3 3M7 12l-3 3a3.54 3.54 0 0 0 5 5l3-3M4 4l3 3M17 17l3 3",
  edit: "m15 4 5 5M4 16 16 4a3 3 0 0 1 4 4L8 20l-5 1z",
  undo: "M4 4v6h6M4 10a8 8 0 1 1 0 6",
  redo: "M20 4v6h-6M20 10a8 8 0 1 0 0 6",
  archive: "M3 3h18v5H3zM5 8v13h14V8M10 12h4",
  folder: "M3 6V4h6l2 3h10v13H3z",
  "folder-open": "M3 11V4h6l2 3h9v4M3 20l3-9h16l-3 9z",
  mail: "M3 5h18v14H3zM3 5l9 7 9-7",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  "eye-off":
    "M3 3l18 18M10 5c7-1 12 7 12 7s-1 2-3 4M6 6c-3 2-4 6-4 6s4 7 10 7c2 0 4-1 5-2M9 9a4 4 0 0 0 6 6",
  unlock: "M5 10h14v11H5zM8 10V7a4 4 0 0 1 7.5-2M12 14v3",
  stop: "M5 5h14v14H5z",
  power: "M12 2v10M6.3 5a9 9 0 1 0 11.4 0",
  history: "M3 4v6h6M3 10a9 9 0 1 1 1 7M12 7v5l4 2",
};
/** Semantic names that intentionally reuse an existing glyph. */
export const iconAliases: Readonly<Record<string, string>> = Object.freeze({
  retry: "refresh",
  reload: "refresh",
  cancel: "close",
  time: "clock",
  warning: "alert",
  delete: "trash",
  "link-off": "unlink",
  notification: "bell",
  account: "user",
  duplicate: "copy",
});
for (const [alias, name] of Object.entries(iconAliases))
  paths[alias] = paths[name];
export const iconNames: readonly string[] = Object.freeze(Object.keys(paths));
/** Portable, immutable definitions sharing HIcon's 24px grid and stroke defaults. */
export const iconDefinitions: Readonly<Record<string, IconDefinition>> =
  Object.freeze(
    Object.fromEntries(
      Object.entries(paths).map(([name, path]) => [
        name,
        Object.freeze({
          paths: Object.freeze([path]),
          viewBox: "0 0 24 24",
          fill: "none" as const,
          strokeWidth: 1.8,
        }),
      ]),
    ),
  );
