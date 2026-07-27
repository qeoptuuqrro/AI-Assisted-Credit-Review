import type { ReactNode } from "react";
import styles from "./KeyValueGrid.module.css";

export type KeyValueItem = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
};

type KeyValueGridProps = {
  items: KeyValueItem[];
  columns?: 2 | 3 | 4;
  className?: string;
};

/** Flat definition-list treatment for request, risk, and evidence metadata. */
export function KeyValueGrid({ items, columns = 2, className = "" }: KeyValueGridProps) {
  return (
    <dl className={`${styles.grid} ${styles[`columns${columns}`]} ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          {item.detail && <span>{item.detail}</span>}
        </div>
      ))}
    </dl>
  );
}
