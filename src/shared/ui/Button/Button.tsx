import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "soft" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "start" | "end";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconPosition = "end",
  children,
  className = "",
  type = "button",
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {iconPosition === "start" && icon}
      <span>{children}</span>
      {iconPosition === "end" && icon}
    </button>
  );
});
