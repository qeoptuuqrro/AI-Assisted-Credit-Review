import { useRef, type KeyboardEvent } from "react";
import styles from "./Tabs.module.css";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
  disabled?: boolean;
};

type TabsProps<T extends string> = {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

/** Underline navigation for durable page sections. */
export function Tabs<T extends string>({ items, value, onChange, ariaLabel, className = "" }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const enabled = items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
    const currentIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
    const target = event.key === "Home"
      ? enabled[0]
      : event.key === "End"
        ? enabled.at(-1)
        : event.key === "ArrowRight"
          ? enabled[(currentIndex + 1) % enabled.length]
          : enabled[(currentIndex - 1 + enabled.length) % enabled.length];
    if (!target) return;
    onChange(target.item.id);
    refs.current[target.itemIndex]?.focus();
  }

  return (
    <div className={`${styles.tabs} ${className}`} role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(element) => { refs.current[index] = element; }}
          type="button"
          role="tab"
          id={`${item.id}-tab`}
          aria-selected={item.id === value}
          aria-controls={`${item.id}-panel`}
          tabIndex={item.id === value ? 0 : -1}
          disabled={item.disabled}
          className={item.id === value ? styles.active : ""}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <span>{item.label}</span>
          {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
