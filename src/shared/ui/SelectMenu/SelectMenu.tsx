import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./SelectMenu.module.css";

const TYPEAHEAD_RESET_MS = 500;

export type SelectMenuOption<T extends string = string> = {
  value: T;
  label: string;
};

type SelectMenuProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SelectMenuOption<T>[];
  onChange: (value: T) => void;
  placement?: "down" | "up";
  disabled?: boolean;
  className?: string;
};

/** Browser-consistent single-select control with an anchored, keyboard-operable option menu. */
export function SelectMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  placement = "down",
  disabled = false,
  className = "",
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<number | null>(null);
  const menuId = useId();
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  useEffect(() => () => {
    if (typeaheadTimerRef.current !== null) window.clearTimeout(typeaheadTimerRef.current);
  }, []);

  function openMenu() {
    if (disabled || !options.length) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function chooseOption(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    typeaheadRef.current = "";
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function moveActive(delta: number) {
    if (!options.length) return;
    setActiveIndex((current) => (current + delta + options.length) % options.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      if (!open) openMenu();
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (open) chooseOption(activeIndex);
      else openMenu();
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }

    if (
      event.key.length === 1
      && event.key !== " "
      && !event.altKey
      && !event.ctrlKey
      && !event.metaKey
    ) {
      event.preventDefault();
      event.stopPropagation();
      const typed = `${typeaheadRef.current}${event.key}`.toLowerCase();
      let matchIndex = options.findIndex((option) => option.label.toLowerCase().startsWith(typed));
      const nextQuery = matchIndex >= 0 ? typed : event.key.toLowerCase();
      if (matchIndex < 0) {
        matchIndex = options.findIndex((option) => option.label.toLowerCase().startsWith(nextQuery));
      }
      typeaheadRef.current = nextQuery;
      if (typeaheadTimerRef.current !== null) window.clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = window.setTimeout(() => {
        typeaheadRef.current = "";
        typeaheadTimerRef.current = null;
      }, TYPEAHEAD_RESET_MS);
      if (!open) setOpen(true);
      if (matchIndex >= 0) setActiveIndex(matchIndex);
    }
  }

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open ? `${menuId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        value={value}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedOption?.label ?? value}</span>
        <Icon className={styles.chevron} name="chevronDown" size="sm" />
      </button>

      {open && (
        <div
          id={menuId}
          className={`${styles.menu} ${placement === "up" ? styles.menuUp : ""}`}
          role="listbox"
          aria-label={`${label} options`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              id={`${menuId}-option-${index}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={option.value === value}
              className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
