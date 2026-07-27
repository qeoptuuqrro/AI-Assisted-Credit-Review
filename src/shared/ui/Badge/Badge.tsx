import type { ReactNode } from "react";
import { StatusPill, type StatusPillTone } from "../StatusPill/StatusPill";

type BadgeProps = {
  children: ReactNode;
  tone?: StatusPillTone;
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}
