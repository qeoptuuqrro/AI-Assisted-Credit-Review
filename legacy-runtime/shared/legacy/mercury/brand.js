import { escapeHtml } from "../../utils/html.js";

export function mercuryMark() {
  const petals = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    const x = 12 + Math.cos(angle) * 6.2;
    const y = 12 + Math.sin(angle) * 6.2;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.72"></circle>`;
  }).join("");

  return `
    <span class="orb-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9.4"></circle>
        <circle cx="12" cy="12" r="4.3"></circle>
        ${petals}
      </svg>
    </span>
  `;
}

export function investorLogoMark({
  src = "/logos/investors/peak-rock-capital-circle.svg",
  alt = "Peak Rock Capital",
  initials = "PR",
  tone = "teal",
} = {}) {
  return `
    <span class="investor-logo-mark tone-${escapeHtml(tone)}" aria-hidden="true" title="${escapeHtml(alt)}">
      <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async">
      <em>${escapeHtml(initials)}</em>
    </span>
  `;
}

export function companyLogoMark({
  src = "",
  alt = "Company",
  initials = "",
  tone = "blue",
  className = "",
} = {}) {
  const classes = ["company-logo-mark", `tone-${tone}`, src ? "has-logo" : "", className].filter(Boolean);
  return `
    <span class="${classes.map(escapeHtml).join(" ")}" aria-hidden="true" title="${escapeHtml(alt)}">
      ${src ? `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async">` : ""}
      <em>${escapeHtml(initials)}</em>
    </span>
  `;
}

export function avatar(initials = "JS", tone = "neutral") {
  return `<span class="person-avatar tone-${tone}">${escapeHtml(initials)}</span>`;
}

export function googleMark() {
  return `
    <span class="google-mark" aria-hidden="true">
      <svg viewBox="0 0 18 18">
        <path fill="#4285f4" d="M17.64 9.2c0-.63-.06-1.23-.16-1.82H9v3.44h4.84a4.13 4.13 0 0 1-1.8 2.72v2.24h2.9c1.7-1.56 2.7-3.85 2.7-6.58Z" />
        <path fill="#34a853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.85-3.06.85a5.35 5.35 0 0 1-5.03-3.7H.98v2.3A9 9 0 0 0 9 18Z" />
        <path fill="#fbbc05" d="M3.97 10.73A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.73V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.82.98 4.04l2.99-2.31Z" />
        <path fill="#ea4335" d="M9 3.57c1.32 0 2.5.45 3.43 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .98 4.96l2.99 2.31A5.35 5.35 0 0 1 9 3.57Z" />
      </svg>
    </span>
  `;
}
