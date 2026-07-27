import type { ReactNode } from "react";
import styles from "./ReviewWorkspaceHeader.module.css";

type ReviewWorkspaceHeaderProps = {
  children: ReactNode;
};

/** Keeps the review identity and its section navigation on one shared rhythm. */
export function ReviewWorkspaceHeader({ children }: ReviewWorkspaceHeaderProps) {
  return <div className={styles.root}>{children}</div>;
}
