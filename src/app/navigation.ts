import type { IconName } from "../shared/ui/Icon/Icon";
import type { AppPath } from "./router";

export type NavigationItem = {
  label: string;
  mobileLabel: string;
  to: AppPath;
  icon: IconName;
  badge?: string;
};

export const primaryNavigation: NavigationItem[] = [
  { label: "Overview", mobileLabel: "Home", to: "/", icon: "home" },
  { label: "Intelligence", mobileLabel: "AI", to: "/intelligence", icon: "command", badge: "New" },
  { label: "Credit reviews", mobileLabel: "Reviews", to: "/credit-reviews", icon: "clipboard" },
  { label: "Policy rules", mobileLabel: "Rules", to: "/policy-rules", icon: "scale" },
  { label: "Design system", mobileLabel: "System", to: "/design-system", icon: "layers" },
];
