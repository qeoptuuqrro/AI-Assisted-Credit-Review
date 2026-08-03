import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon/Icon";
import styles from "./Dialog.module.css";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
}

function focusDialogTarget(
  dialog: HTMLElement,
  initialFocusRef: RefObject<HTMLElement | null> | undefined,
  direction: "first" | "last" = "first",
) {
  const preferred = initialFocusRef?.current;
  const focusable = getFocusableElements(dialog);
  const target = preferred && dialog.contains(preferred)
    ? preferred
    : direction === "last" ? focusable.at(-1) : focusable[0];
  (target ?? dialog).focus({ preventScroll: true });
}

/** Modal task surface with focus containment, Escape dismissal, and focus return. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  eyebrow,
  footer,
  closeLabel = "Close dialog",
  initialFocusRef,
  size = "md",
  className = "",
}: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const initialFocusRefRef = useRef(initialFocusRef);
  const previousInitialFocusRef = useRef(initialFocusRef);
  const hasOpenFocusRef = useRef(false);

  // Keep the active focus preference current without restarting the modal
  // lifecycle (which would incorrectly return focus to the opener).
  initialFocusRefRef.current = initialFocusRef;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    hasOpenFocusRef.current = true;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      if (dialogRef.current) focusDialogTarget(dialogRef.current, initialFocusRefRef.current);
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        focusDialogTarget(dialogRef.current, initialFocusRefRef.current, event.shiftKey ? "last" : "first");
        return;
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const dialog = dialogRef.current;
      if (!dialog || !dialog.isConnected || dialog.contains(event.target as Node)) return;
      focusDialogTarget(dialog, initialFocusRefRef.current);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.body.style.overflow = previousOverflow;
      hasOpenFocusRef.current = false;
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  // Content-driven state changes can unmount the active control (for example,
  // replacing a dirty form with its discard confirmation). Restore focus before
  // the browser can leave the modal with focus on BODY.
  useLayoutEffect(() => {
    if (!open || !hasOpenFocusRef.current || !dialogRef.current) return;
    const focusTargetChanged = previousInitialFocusRef.current !== initialFocusRef;
    previousInitialFocusRef.current = initialFocusRef;
    if (focusTargetChanged || !dialogRef.current.contains(document.activeElement)) {
      focusDialogTarget(dialogRef.current, initialFocusRef);
    }
  });

  if (!open) return null;

  return createPortal(
    <div className={styles.layer}>
      <div className={styles.backdrop} aria-hidden="true" onMouseDown={() => onCloseRef.current()} />
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${styles[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className={styles.close} type="button" aria-label={closeLabel} onClick={onClose}>
            <Icon name="close" size="sm" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
