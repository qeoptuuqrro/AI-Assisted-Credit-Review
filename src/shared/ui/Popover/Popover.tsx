import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Popover.module.css";

type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Floating surface for compact menus, pickers, and disclosures. */
export function Popover({ children, className = "", ...props }: PopoverProps) {
  return (
    <div className={`${styles.popover} ${className}`} {...props}>
      {children}
    </div>
  );
}
