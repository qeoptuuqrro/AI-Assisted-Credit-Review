import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import styles from "./ObjectHeader.module.css";

type ObjectHeaderProps = {
  backLabel: string;
  onBack: () => void;
  logo: ReactNode;
  title: ReactNode;
  metadata: ReactNode[];
  status?: ReactNode;
  utilityAction?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ObjectHeader({
  backLabel,
  onBack,
  logo,
  title,
  metadata,
  status,
  utilityAction,
  action,
  className = "",
}: ObjectHeaderProps) {
  return (
    <div className={`${styles.root} ${className}`}>
      <Button
        className={styles.back}
        variant="quiet"
        size="sm"
        aria-label={`Back to ${backLabel}`}
        iconPosition="start"
        icon={<Icon name="arrowLeft" size="sm" />}
        onClick={onBack}
      >
        {backLabel}
      </Button>

      <header className={styles.header}>
        <div className={styles.identity}>
          {logo}
          <div className={styles.copy}>
            <h1>{title}</h1>
            <p className={styles.metadata}>
              {metadata.map((item, index) => <span key={index}>{item}</span>)}
            </p>
            {status && <div className={styles.status}>{status}</div>}
          </div>
        </div>
        {(utilityAction || action) && (
          <div className={styles.actions}>
            {utilityAction}
            {action}
          </div>
        )}
      </header>
    </div>
  );
}
