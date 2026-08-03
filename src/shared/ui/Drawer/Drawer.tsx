import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/Icon";
import styles from "./Drawer.module.css";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  layout?: "overlay" | "responsive";
  onExited?: () => void;
};

type DrawerHeaderProps = {
  onClose: () => void;
  children: ReactNode;
};

type DrawerRegionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Drawer({
  open,
  onClose,
  labelledBy,
  children,
  className = "",
  layout = "overlay",
  onExited,
}: DrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onExitedRef = useRef(onExited);
  const [responsiveMounted, setResponsiveMounted] = useState(open);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  useEffect(() => {
    if (layout !== "responsive") {
      setResponsiveMounted(false);
      return;
    }
    if (open) setResponsiveMounted(true);
  }, [layout, open]);

  useEffect(() => {
    if (layout !== "responsive" || !responsiveMounted) return;
    const fullScreenQuery = window.matchMedia("(max-width: 520px)");
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    function syncBackgroundScroll() {
      root.style.overflow = fullScreenQuery.matches ? "hidden" : previousOverflow;
    }

    syncBackgroundScroll();
    fullScreenQuery.addEventListener("change", syncBackgroundScroll);
    return () => {
      fullScreenQuery.removeEventListener("change", syncBackgroundScroll);
      root.style.overflow = previousOverflow;
    };
  }, [layout, responsiveMounted]);

  useLayoutEffect(() => {
    if (layout !== "responsive" || !open || !responsiveMounted) return;

    let measurementFrame = 0;

    function updateAvailableHeight() {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const tokens = window.getComputedStyle(drawer);
      const verticalInset = Number.parseFloat(tokens.getPropertyValue("--salt-drawer-responsive-vertical-inset")) || 16;
      const inlineMinWidth = Number.parseFloat(tokens.getPropertyValue("--salt-drawer-responsive-container-min-width")) || 968;
      const minBodyHeight = Number.parseFloat(tokens.getPropertyValue("--salt-drawer-responsive-min-body-height")) || 100;
      const headerHeight = Number.parseFloat(tokens.getPropertyValue("--salt-drawer-header-min-height")) || 56;
      const layoutRect = drawer.parentElement?.getBoundingClientRect();
      const stickyTop = Number.parseFloat(tokens.top) || 0;
      const inlineLayout = Boolean(layoutRect && layoutRect.width >= inlineMinWidth);
      const panelTop = inlineLayout && layoutRect
        ? Math.max(layoutRect.top + verticalInset, stickyTop)
        : drawer.getBoundingClientRect().top;
      const viewportAvailableHeight = window.innerHeight - panelTop - verticalInset;
      // An inline drawer is sticky within a page that may be taller than the
      // viewport. Capping it to the parent's current bottom makes the panel
      // shrink every time the document scrolls. Its body owns overflow, so the
      // stable viewport measure should come from the visible window instead.
      const availableHeight = Math.max(
        minBodyHeight + headerHeight,
        viewportAvailableHeight,
      );
      drawer.style.setProperty("--salt-drawer-responsive-available-height", `${Math.round(availableHeight)}px`);
    }

    function scheduleAvailableHeightUpdate() {
      window.cancelAnimationFrame(measurementFrame);
      measurementFrame = window.requestAnimationFrame(updateAvailableHeight);
    }

    updateAvailableHeight();
    window.addEventListener("resize", scheduleAvailableHeightUpdate);
    window.addEventListener("scroll", scheduleAvailableHeightUpdate, true);
    return () => {
      window.cancelAnimationFrame(measurementFrame);
      window.removeEventListener("resize", scheduleAvailableHeightUpdate);
      window.removeEventListener("scroll", scheduleAvailableHeightUpdate, true);
    };
  }, [layout, open, responsiveMounted]);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      const drawer = drawerRef.current;
      const focusTarget = drawer?.querySelector<HTMLElement>("[data-drawer-close]") ?? drawer;
      focusTarget?.focus({ preventScroll: true });
    });

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  const rendered = layout === "responsive" ? responsiveMounted : open;
  if (!rendered) return null;

  function finishResponsiveExit(event: AnimationEvent<HTMLElement>) {
    if (event.currentTarget !== event.target || layout !== "responsive" || open) return;
    setResponsiveMounted(false);
    onExitedRef.current?.();
  }

  return (
    <aside
      ref={drawerRef}
      className={`${styles.drawer} ${layout === "responsive" ? styles.responsive : styles.overlay} ${className}`}
      aria-hidden={open ? undefined : true}
      aria-labelledby={labelledBy}
      data-state={open ? "open" : "closing"}
      tabIndex={-1}
      onAnimationEnd={finishResponsiveExit}
    >
      {children}
    </aside>
  );
}

export function DrawerHeader({ onClose, children }: DrawerHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>{children}</div>
      <button className={styles.closeButton} type="button" aria-label="Close detail panel" data-drawer-close onClick={onClose}>
        <Icon name="close" size="sm" />
      </button>
    </header>
  );
}

export function DrawerBody({ children, className = "", ...props }: DrawerRegionProps) {
  return <div className={`${styles.body} ${className}`} {...props}>{children}</div>;
}

export function DrawerSection({ children, className = "", ...props }: DrawerRegionProps) {
  return <section className={`${styles.section} ${className}`} {...props}>{children}</section>;
}

export function DrawerFooter({ children, className = "", ...props }: DrawerRegionProps) {
  return <footer className={`${styles.footer} ${className}`} {...props}>{children}</footer>;
}
