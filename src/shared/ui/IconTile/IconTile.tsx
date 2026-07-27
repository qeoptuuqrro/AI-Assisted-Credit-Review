import type { ReactNode } from "react";
import styles from "./IconTile.module.css";

export type IconTone = "neutral" | "warning" | "danger" | "success" | "info";
export type IconTileShape = "rounded" | "circle";

type IconTileProps = {
  children: ReactNode;
  tone?: IconTone;
  size?: "sm" | "md";
  shape?: IconTileShape;
  className?: string;
};

export function IconTile({ children, tone = "neutral", size = "md", shape = "rounded", className = "" }: IconTileProps) {
  return (
    <span
      className={`${styles.tile} ${styles[tone]} ${size === "sm" ? styles.small : ""} ${shape === "circle" ? styles.circle : ""} ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
