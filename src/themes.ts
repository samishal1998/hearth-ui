export const themes = ["sunset", "ocean", "forest", "dusk", "rose"] as const;
export type Theme = (typeof themes)[number];
export type Mode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";
export type ThemeTokens = Partial<Record<`--h-${string}`, string>>;
export type Tone =
  "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
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
export interface ChoiceOption extends SelectOption {
  description?: string;
}
export interface ComboboxOption extends ChoiceOption {
  keywords?: string[];
}
export interface ComboboxProps {
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
}
export interface AuthCredentials {
  username: string;
  password: string;
}

/** Filters to Hearth variables; values are CSS authored by the consuming application. */
export function themeStyle(tokens: ThemeTokens = {}): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).filter(
      (entry): entry is [string, string] =>
        /^--h-[a-z0-9-]+$/.test(entry[0]) && typeof entry[1] === "string",
    ),
  );
}

/** A complete, copyable stylesheet for an application or scoped theme island. */
export function themeCSS(tokens: ThemeTokens, selector = ":root"): string {
  return `${selector} {\n${Object.entries(themeStyle(tokens))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n}`;
}
