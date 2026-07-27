import type { ReactNode } from "react";
import styles from "./StatusPill.module.css";

export type StatusPillTone = "neutral" | "info" | "success" | "warning" | "danger";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}
