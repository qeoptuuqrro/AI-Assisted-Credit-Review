import styles from "./WorkflowSteps.module.css";

export type WorkflowStepItem<T extends string> = {
  id: T;
  label: string;
  description?: string;
};

type WorkflowStepsProps<T extends string> = {
  ariaLabel: string;
  items: Array<WorkflowStepItem<T>>;
  value: T;
  onChange?: (value: T) => void;
  className?: string;
};

/** Compact process navigation for focused review and confirmation flows. */
export function WorkflowSteps<T extends string>({ ariaLabel, items, value, onChange, className = "" }: WorkflowStepsProps<T>) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === value));

  return (
    <nav className={`${styles.steps} ${className}`} aria-label={ariaLabel}>
      <ol>
        {items.map((item, index) => {
          const active = item.id === value;
          const complete = index < activeIndex;

          return (
            <li key={item.id} className={active ? styles.active : complete ? styles.complete : ""}>
              <button
                type="button"
                aria-current={active ? "step" : undefined}
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
