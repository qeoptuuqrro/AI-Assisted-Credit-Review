import { Icon } from "../Icon/Icon";
import { useId } from "react";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

export function SearchField({ value, onChange, placeholder = "Search", ariaLabel = "Search", className = "" }: SearchFieldProps) {
  const inputId = useId();
  return (
    <div className={`${styles.field} ${className}`}>
      <Icon name="search" size="sm" />
      <label className={styles.visuallyHidden} htmlFor={inputId}>{ariaLabel}</label>
      <input id={inputId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")}><Icon name="close" size="sm" /></button>}
    </div>
  );
}
