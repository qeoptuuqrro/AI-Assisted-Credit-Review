import type { ReactNode } from "react";
import styles from "./Timeline.module.css";

/** `ai` and `human` remain compatibility inputs, but render neutral. */
export type TimelineTone = "neutral" | "ai" | "human" | "warning";

export type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  description?: string;
  tone?: TimelineTone;
  details?: ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
  expandedId?: string | null;
  onToggle?: (id: string) => void;
  className?: string;
};

/** Attributable chronology with optional progressive disclosure. */
export function Timeline({ items, expandedId = null, onToggle, className = "" }: TimelineProps) {
  return (
    <ol className={`${styles.timeline} ${className}`}>
      {items.map((item) => {
        const expandable = Boolean(item.details && onToggle);
        const expanded = expandedId === item.id;
        const content = (
          <>
            <span className={`${styles.marker} ${styles[item.tone ?? "neutral"]}`} aria-hidden="true" />
            <span className={styles.content}>
              <span className={styles.topline}>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </span>
              {item.description && <span className={styles.description}>{item.description}</span>}
              {expanded && item.details && <span className={styles.details}>{item.details}</span>}
            </span>
          </>
        );
        return (
          <li key={item.id}>
            {expandable ? (
              <button type="button" aria-expanded={expanded} onClick={() => onToggle?.(item.id)}>{content}</button>
            ) : <div>{content}</div>}
          </li>
        );
      })}
    </ol>
  );
}
