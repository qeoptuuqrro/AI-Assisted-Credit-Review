import type { ReactNode } from "react";
import styles from "./DataCell.module.css";

type DataCellProps = {
  primary?: ReactNode;
  secondary?: ReactNode;
  children?: ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function DataCell({ primary, secondary, children, align = "start", className = "" }: DataCellProps) {
  return (
    <div className={`${styles.cell} ${styles[align]} ${className}`}>
      {children ?? <><span className={styles.primary}>{primary}</span>{secondary !== undefined && <span className={styles.secondary}>{secondary}</span>}</>}
    </div>
  );
}
