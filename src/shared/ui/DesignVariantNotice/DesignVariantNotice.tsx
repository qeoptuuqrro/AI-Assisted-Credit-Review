import { Icon } from "../Icon/Icon";
import styles from "./DesignVariantNotice.module.css";

type DesignVariantNoticeProps = {
  area: string;
  variant: string;
  onReturn: () => void;
};

export function DesignVariantNotice({ area, variant, onReturn }: DesignVariantNoticeProps) {
  return (
    <aside className={styles.notice} aria-label={`Previewing ${area} ${variant}`}>
      <Icon name="branch" size="sm" />
      <span><small>Previewing {area}</small><strong>{variant}</strong></span>
      <button type="button" onClick={onReturn}>Return to current</button>
    </aside>
  );
}
