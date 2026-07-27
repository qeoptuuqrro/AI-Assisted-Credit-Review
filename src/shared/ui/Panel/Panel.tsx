import type { HTMLAttributes } from "react";
import styles from "./Panel.module.css";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: "flat" | "raised";
};

export function Panel({ className = "", elevation = "raised", ...props }: PanelProps) {
  return <div className={`${styles.panel} ${styles[elevation]} ${className}`} {...props} />;
}
