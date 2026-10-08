export const themes = ["sunset", "ocean", "forest", "dusk", "rose"] as const;
export type Theme = (typeof themes)[number];
export type Mode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";
export type ControlSize = "regular" | "compact";
export interface IconDefinition {
  paths: readonly string[];
  viewBox?: string;
  fill?: "none" | "currentColor";
  fillRule?: "nonzero" | "evenodd";
  strokeWidth?: number;
}
export type IconValue = string | IconDefinition;
export type DateRange = [string, string];
export type NumberRange = [number, number];
export interface StepItem {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
}
export interface VirtualItem {
  id: string;
  label: string;
  description?: string;
}
export interface TreeItem {
  id: string;
  label: string;
  disabled?: boolean;
  children?: TreeItem[];
}
export type ThemeTokens = Partial<Record<`--h-${string}`, string>>;
export interface ThemeModeTokens {
  dark?: ThemeTokens;
  light?: ThemeTokens;
}
export interface ThemeProfile {
  tokens?: ThemeTokens;
  modeTokens?: ThemeModeTokens;
}
export interface ThemeExportOptions {
  selector?: string;
  target?: "vue" | "elements";
}
export type Tone =
  "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export interface NavItem {
  id: string;
  label: string;
  icon?: IconValue;
  href?: string;
  badge?: string | number;
  disabled?: boolean;
}
export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface ChipOption extends SelectOption {
  count?: number;
  icon?: IconValue;
  title?: string;
}
export interface ChoiceOption extends SelectOption {
  description?: string;
}
export interface ComboboxOption extends ChoiceOption {
  keywords?: string[];
}
export interface ComboboxProps {
  hideLabel?: boolean;
  size?: ControlSize;
  mobileBreakpoint?: number;
  modelValue?: string | string[];
  value?: string | string[];
  label: string;
  name?: string;
  options: ComboboxOption[];
  multiple?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  emptyText?: string;
  formDisabled?: boolean;
}
export type MultiSelectProps = Omit<
  ComboboxProps,
  "modelValue" | "value" | "multiple"
> & { modelValue?: string[]; value?: string[] };
export interface NavigationItem extends NavItem {
  children?: NavItem[];
}
export interface SidebarSection {
  label: string;
  items: NavItem[];
}
export interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  dateTime?: string;
  href?: string;
  tone?: Tone;
}

export interface MenuAction {
  id: string;
  label: string;
  icon?: IconValue;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
}
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
  duration?: number;
  actionLabel?: string;
}
export type TableCell = string | number | boolean | null | undefined;
export interface TableRow {
  id: string;
  [key: string]: unknown;
}
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "start" | "end";
  width?: string;
  minWidth?: string;
  truncate?: boolean;
  hideBelow?: number;
}
export interface TableSort {
  key: string;
  direction: "ascending" | "descending";
}
export interface DescriptionItem {
  key: string;
  label: string;
  value?: TableCell;
  href?: string;
}
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: IconValue;
  group?: string;
  shortcut?: string;
  keywords?: string[];
  disabled?: boolean;
}
export interface LogEntry {
  id: string;
  message: string;
  timestamp?: string;
  level?: "debug" | "info" | "warning" | "error";
}
export interface FileRejection {
  name: string;
  reason: string;
}
export interface ConnectionDraft {
  name: string;
  endpoint: string;
}
export type ServiceState =
  "operational" | "degraded" | "outage" | "maintenance" | "unknown";
export interface StatusService {
  id: string;
  name: string;
  status: ServiceState;
  description?: string;
  href?: string;
}
export interface StatusGroup {
  id: string;
  label: string;
  services: StatusService[];
}
export interface StatusIncident {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "monitoring" | "resolved";
  updatedAt?: string;
}
export function tableCellSlot(rowId: string, columnKey: string): string {
  return `cell:${encodeURIComponent(rowId)}:${encodeURIComponent(columnKey)}`;
}

/** Filters to Hearth variables; values are CSS authored by the consuming application. */
export function themeStyle(tokens: ThemeTokens = {}): Record<string, string> {
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) return {};
  return Object.fromEntries(
    Object.entries(tokens).filter(
      (entry): entry is [string, string] =>
        /^--h-[a-z0-9-]+$/.test(entry[0]) && typeof entry[1] === "string",
    ),
  );
}

/** Serialize flat tokens. Use themeProfileCSS for independent color modes. */
export function themeCSS(tokens: ThemeTokens, selector = ":root"): string {
  return `${selector} {\n${Object.entries(themeStyle(tokens))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n}`;
}

/** Mode-aware CSS targets the owning theme element, including the web-component base part. */
export function themeProfileCSS(
  profile: ThemeProfile,
  options: ThemeExportOptions = {},
): string {
  const elements = options.target === "elements";
  const owner = `:is(${options.selector || (elements ? 'hearth-theme[theme="custom"]' : '[data-hearth-theme="custom"]')})`;
  const attribute = elements ? "mode" : "data-hearth-mode";
  const part = elements ? "::part(base)" : "";
  const selector = (mode: "dark" | "light" | "system") =>
    `${owner}[${attribute}="${mode}"]${part}`;
  const rule = (mode: "dark" | "light", target: string) => {
    const css = themeCSS(profile.modeTokens?.[mode] || {}, target);
    return css.replace("{\n", `{\n  color-scheme: ${mode};\n`);
  };
  return [
    themeCSS(profile.tokens || {}, `${owner}${part}`),
    rule("dark", `${owner}:not([${attribute}])${part},\n${selector("dark")}`),
    rule("light", selector("light")),
    ...(["dark", "light"] as const).map(
      (mode) =>
        `@media (prefers-color-scheme: ${mode}) {\n${rule(
          mode,
          selector("system"),
        )
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")}\n}`,
    ),
  ].join("\n\n");
}
