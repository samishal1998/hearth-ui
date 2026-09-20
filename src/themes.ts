export const themes = ["sunset", "ocean", "forest", "dusk", "rose"] as const;
export type Theme = (typeof themes)[number];
export type Mode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";
export type DateRange = [string, string];
export type NumberRange = [number, number];
export interface StepItem {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
}
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
  icon?: string;
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
  [key: string]: TableCell;
}
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "start" | "end";
  width?: string;
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
  icon?: string;
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
