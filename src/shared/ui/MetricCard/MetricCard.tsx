import type { ReactNode } from "react";
import styles from "./MetricCard.module.css";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accessory?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  density?: "default" | "compact";
  elevation?: "raised" | "flat";
  detailTone?: "neutral" | "positive" | "negative";
};

/**
 * A compact, reusable dashboard surface for one decision-relevant value.
 * Renders as a button only when the metric controls another view.
 */
export function MetricCard({
  label,
  value,
  detail,
  accessory,
  selected = false,
  onClick,
  className = "",
  density = "default",
  elevation = "raised",
  detailTone = "neutral",
}: MetricCardProps) {
  const classes = `${styles.card} ${density === "compact" ? styles.compact : ""} ${elevation === "flat" ? styles.flat : ""} ${onClick ? styles.interactive : ""} ${selected ? styles.selected : ""} ${className}`;
  const content = (
    <>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
      {detail && <span className={`${styles.detail} ${detailTone === "positive" ? styles.detailPositive : detailTone === "negative" ? styles.detailNegative : ""}`}>{detail}</span>}
      {accessory && <span className={styles.accessory}>{accessory}</span>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} aria-pressed={selected} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
