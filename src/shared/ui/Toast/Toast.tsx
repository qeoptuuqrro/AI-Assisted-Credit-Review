import { useEffect } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./Toast.module.css";

type ToastProps = {
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
};

/** Nonblocking workflow feedback using the compact dark toast contract. */
export function Toast({ title, message, onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onClose]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true"><Icon name="check" size="sm" /></span>
      <span className={styles.copy}>
        <strong>{title}</strong>
        {message && <span>{message}</span>}
      </span>
      <button type="button" aria-label="Dismiss notification" onClick={onClose}><Icon name="close" size="sm" /></button>
    </div>
  );
}
