import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon/Icon";
import styles from "./DocumentViewer.module.css";

type DocumentViewerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  meta: string;
  children: ReactNode;
  learningTargetProps?: {
    "data-learning-target"?: string;
    "data-learning-label"?: string;
    tabIndex?: number;
  };
};

/**
 * Focus-contained lightbox for reading an evidence attachment without
 * replacing the current product context. DocumentRow owns the trigger; this
 * component owns only the modal viewing surface.
 */
export function DocumentViewer({ open, onClose, title, meta, children, learningTargetProps }: DocumentViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-document-viewer-close]")?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  const titleId = `document-viewer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div className={styles.backdrop} onMouseDown={closeFromBackdrop} {...learningTargetProps}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className={styles.header}>
          <span className={styles.fileIcon} aria-hidden="true"><Icon name="document" size="sm" /></span>
          <div className={styles.identity}>
            <h2 id={titleId}>{title}</h2>
            <p>{meta}</p>
          </div>
          <button type="button" className={styles.closeButton} aria-label="Close document preview" data-document-viewer-close onClick={onClose}>
            <Icon name="close" size="sm" />
          </button>
        </header>

        <div className={styles.stage}>
          <article className={styles.paper} aria-label={`${title} preview`}>
            <span className={styles.previewLabel}>Reviewed source</span>
            <h3>{title}</h3>
            <div className={styles.documentRule} />
            <div className={styles.previewContent}>{children}</div>
            <div className={styles.documentLines} aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <footer><Icon name="checkCircle" size="xs" /> Included in AI review</footer>
          </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}
