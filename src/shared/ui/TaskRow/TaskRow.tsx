import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import { IconTile } from "../IconTile/IconTile";
import styles from "./TaskRow.module.css";

type TaskRowProps = {
  icon: IconName;
  iconTone?: "neutral" | "warning" | "danger" | "success" | "info";
  title: string;
  description?: string;
  meta?: ReactNode;
  status?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function TaskRow({ icon, iconTone = "neutral", title, description, meta, status, onClick, className = "" }: TaskRowProps) {
  const content = (
    <>
      <IconTile tone={iconTone} size="sm"><Icon name={icon} size="sm" /></IconTile>
      <span className={styles.copy}><strong>{title}</strong>{description && <span>{description}</span>}</span>
      {meta && <span className={styles.meta}>{meta}</span>}
      {status && <span className={styles.status}>{status}</span>}
      {onClick && <Icon name="chevronRight" size="sm" className={styles.chevron} />}
    </>
  );

  if (onClick) return <button type="button" className={`${styles.row} ${styles.interactive} ${className}`} onClick={onClick}>{content}</button>;
  return <div className={`${styles.row} ${className}`}>{content}</div>;
}
