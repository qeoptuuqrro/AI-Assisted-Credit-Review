import { Icon, type IconName } from "../Icon/Icon";
import styles from "./DocumentRow.module.css";

export type DocumentRowProps = {
  name: string;
  meta: string;
  icon?: IconName;
  selected?: boolean;
  onOpen: () => void;
  ariaLabel?: string;
};

/**
 * Compact evidence/document trigger used in drawers and source lists.
 * The row owns only document presentation; the parent owns the preview or
 * navigation destination.
 */
export function DocumentRow({ name, meta, icon = "document", selected = false, onOpen, ariaLabel }: DocumentRowProps) {
  return (
    <button
      type="button"
      className={`${styles.row} ${selected ? styles.selected : ""}`}
      aria-label={ariaLabel ?? `Open ${name}`}
      aria-pressed={selected}
      onClick={onOpen}
    >
      <span className={styles.icon} aria-hidden="true"><Icon name={icon} size="sm" /></span>
      <span className={styles.content}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
      <Icon name="externalLink" size="xs" className={styles.affordance} />
    </button>
  );
}
