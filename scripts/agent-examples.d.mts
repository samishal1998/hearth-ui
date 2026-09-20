export interface ComponentExample {
  vue: string;
  script?: string;
  imports?: string[];
  props?: Record<string, unknown>;
  children?: string;
  mountTag?: string;
  notes?: string[];
  related?: string[];
  event?: string;
  js?: string;
}
export const examples: Record<string, ComponentExample>;
