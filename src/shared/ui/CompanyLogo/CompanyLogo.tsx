import { useEffect, useState } from "react";
import styles from "./CompanyLogo.module.css";

type CompanyLogoProps = {
  /** Prefer a product-owned asset; `domain` remains available for Brandfetch-backed identities. */
  src?: string;
  domain?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const brandfetchClientId = "1idu_D1vAllHiesPdw1";
const requestSize = { sm: 56, md: 80, lg: 96 } as const;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getLogoUrl(domain: string, size: "sm" | "md" | "lg") {
  const pixels = requestSize[size];
  return [
    `https://cdn.brandfetch.io/domain/${encodeURIComponent(domain)}`,
    `w/${pixels}`,
    `h/${pixels}`,
    "theme/light",
    "fallback/404",
    "type/icon",
  ].join("/") + `?c=${brandfetchClientId}`;
}

export function CompanyLogo({ src, domain, name, size = "sm", className = "" }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const logoUrl = src ?? (domain ? getLogoUrl(domain, size) : undefined);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [logoUrl]);

  return (
    <span className={`${styles.logo} ${styles[size]} ${className}`} aria-hidden="true">
      <span className={styles.fallback}>{getInitials(name)}</span>
      {logoUrl && !failed && (
        <img
          className={loaded ? styles.loaded : ""}
          src={logoUrl}
          alt=""
          decoding="async"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      )}
    </span>
  );
}
