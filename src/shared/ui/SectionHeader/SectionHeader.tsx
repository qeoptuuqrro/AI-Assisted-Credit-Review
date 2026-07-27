import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  headingId?: string;
  className?: string;
};

/** Compact heading hierarchy for product sections and panels. */
export function SectionHeader({ title, description, eyebrow, actions, headingId, className = "" }: SectionHeaderProps) {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.copy}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 id={headingId}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
