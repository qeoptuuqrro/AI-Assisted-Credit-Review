import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./FilterChip.module.css";

type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  count?: number;
  pressed?: boolean;
};

export function FilterChip({ children, count, pressed = false, className = "", type = "button", ...props }: FilterChipProps) {
  return (
    <button
      type={type}
      className={`${styles.chip} ${pressed ? styles.selected : ""} ${className}`}
      aria-pressed={pressed}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
