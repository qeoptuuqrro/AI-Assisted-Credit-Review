import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./WorkflowSteps.module.css";

export type WorkflowStepItem<T extends string | number> = {
  id: T;
  label: string;
  description?: string;
};

type WorkflowStepsProps<T extends string | number> = {
  ariaLabel: string;
  items: Array<WorkflowStepItem<T>>;
  value: T;
  onChange?: (value: T) => void;
  className?: string;
  collapseAt?: "tablet" | "mobile";
};

/** Compact process navigation for focused review and confirmation flows. */
export function WorkflowSteps<T extends string | number>({
  ariaLabel,
  items,
  value,
  onChange,
  className = "",
  collapseAt = "tablet",
}: WorkflowStepsProps<T>) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === value));
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const activeButton = activeButtonRef.current;
    if (!activeButton || typeof activeButton.scrollIntoView !== "function") return;
    activeButton.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);

  return (
    <nav
      className={`${styles.steps} ${collapseAt === "mobile" ? styles.collapseMobile : ""} ${className}`}
      aria-label={ariaLabel}
      style={{ "--workflow-step-count": items.length } as CSSProperties}
    >
      <ol>
        {items.map((item, index) => {
          const active = item.id === value;
          const complete = index < activeIndex;

          return (
            <li key={item.id} className={active ? styles.active : complete ? styles.complete : ""}>
              <button
                type="button"
                aria-current={active ? "step" : undefined}
                ref={active ? activeButtonRef : undefined}
                onClick={() => onChange?.(item.id)}
                disabled={!onChange}
              >
                <span>{item.label}</span>
                {item.description && <small>{item.description}</small>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
