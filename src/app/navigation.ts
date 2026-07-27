import type { AppPath } from "./router";

export type NavigationItem = {
  label: string;
  to: AppPath;
  icon: "home" | "command" | "clipboard" | "layers";
  badge?: string;
};

export const primaryNavigation: NavigationItem[] = [
  { label: "Overview", to: "/", icon: "home" },
  { label: "Intelligence", to: "/intelligence", icon: "command", badge: "New" },
  { label: "Credit reviews", to: "/credit-reviews", icon: "clipboard" },
  { label: "Design system", to: "/design-system", icon: "layers" },
];
