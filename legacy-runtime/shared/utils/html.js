export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function money(main, cents = "") {
  return `<span class="money">${escapeHtml(main)}${cents ? `<small>${escapeHtml(cents)}</small>` : ""}</span>`;
}

export function monoAmount(value, positive = false) {
  return `<span class="amount ${positive ? "is-positive" : ""}">${escapeHtml(value)}</span>`;
}
