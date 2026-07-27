import { escapeHtml } from "../utils/html.js";

export function statusPill(label, tone = "slate") {
  return `<span class="ds-status" data-tone="${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

export function tag(label, tone = "slate") {
  return `<span class="ds-tag" data-tone="${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

export function checkbox({ checked = false, label, attrs = "" } = {}) {
  const aria = label ? ` aria-label="${escapeHtml(label)}"` : "";
  return `<button class="ds-checkbox ${checked ? "is-checked" : ""}" type="button" aria-checked="${checked ? "true" : "false"}"${aria} ${attrs}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
  </button>`;
}
