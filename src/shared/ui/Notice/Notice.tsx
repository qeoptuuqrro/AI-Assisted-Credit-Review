import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./Notice.module.css";

export type NoticeTone = "info" | "success" | "warning";

type NoticeProps = {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  icon?: IconName;
  className?: string;
};

const toneIcons: Record<NoticeTone, IconName> = {
  info: "alertCircle",
  success: "checkCircle",
  warning: "alertCircle",
};

export function Notice({ tone = "info", title, children, action, icon, className = "" }: NoticeProps) {
  return (
    <aside className={`${styles.notice} ${styles[tone]} ${className}`} role={tone === "warning" ? "alert" : "status"}>
      <span className={styles.icon} aria-hidden="true"><Icon name={icon ?? toneIcons[tone]} size="sm" /></span>
      <span className={styles.copy}>
        {title && <strong>{title}</strong>}
        <span>{children}</span>
      </span>
      {action && <span className={styles.action}>{action}</span>}
    </aside>
  );
}
