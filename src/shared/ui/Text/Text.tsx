import type { ReactNode } from "react";
import styles from "./Text.module.css";

type TextVariant = "pageTitle" | "sectionTitle" | "body" | "bodySecondary" | "metadata";
type TextElement = "h1" | "h2" | "h3" | "p" | "span" | "strong";

type TextProps = {
  as?: TextElement;
  variant: TextVariant;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Text({ as: Component = "span", variant, children, className = "", id }: TextProps) {
  return <Component id={id} className={`${styles.text} ${styles[variant]} ${className}`}>{children}</Component>;
}
