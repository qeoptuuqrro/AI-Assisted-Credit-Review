import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import { IconTile, type IconTone } from "../IconTile/IconTile";
import styles from "./ActivityLedger.module.css";

/** `human` and `evidence` remain as compatibility inputs, but render neutral: actor and content type are not status. */
export type ActivityLedgerTone = IconTone | "human" | "evidence";

export type ActivityLedgerItem = {
  id: string;
  title: string;
  meta: string;
  description?: string;
  details?: ReactNode;
  icon: IconName;
  tone?: ActivityLedgerTone;
};

type ActivityLedgerProps = {
  items: ActivityLedgerItem[];
  /** `timeline` keeps the ledger's event model but adds a connected chronology rail. */
  layout?: "ledger" | "timeline";
  expandedId?: string | null;
  onToggle?: (id: string) => void;
  className?: string;
};

/** Flat chronological ledger with optional in-row disclosure. */
export function ActivityLedger({ items, layout = "ledger", expandedId = null, onToggle, className = "" }: ActivityLedgerProps) {
  return (
    <div className={`${styles.root} ${className}`} data-layout={layout}>
      <div className={styles.columnHeader} aria-hidden="true">
        <span>Event</span>
        <span>When</span>
      </div>
      <ol className={styles.list}>
        {items.map((item) => {
          const expandable = Boolean(item.details && onToggle);
          const expanded = expandedId === item.id;
          const rowContent = (
            <>
              <IconTile className={styles.icon} size="sm" shape="circle" tone={activityIconTone(item.tone)}>
                <Icon name={item.icon} size="sm" />
              </IconTile>
              <span className={styles.copy}>
                <strong>{item.title}</strong>
                {item.description && <small>{item.description}</small>}
              </span>
              <time>{item.meta}</time>
              {expandable && (
                <Icon className={styles.disclosure} data-expanded={expanded} name="chevronDown" size="sm" />
              )}
            </>
          );

          return (
            <li key={item.id}>
              {expandable ? (
                <button className={styles.row} type="button" aria-expanded={expanded} onClick={() => onToggle?.(item.id)}>
                  {rowContent}
                </button>
              ) : (
                <div className={styles.row}>{rowContent}</div>
              )}
              {expanded && item.details && <div className={styles.details}>{item.details}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function activityIconTone(tone: ActivityLedgerTone | undefined): IconTone {
  if (tone === "human" || tone === "evidence") return "neutral";
  return tone ?? "neutral";
}
